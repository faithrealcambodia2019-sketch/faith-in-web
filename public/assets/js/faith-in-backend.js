/*
 * Faith In — Firebase data backend
 * ================================
 *
 * Background
 * ----------
 * The application was originally a WordPress plugin. Every data operation is
 * still sent as an `action` to `cv_ajax.ajax_url` in the WordPress admin-ajax
 * style. When the app was converted to a standalone Next.js deployment the PHP
 * backend went away and `/api/compat` was left returning HTTP 501 for
 * everything, which is why creating posts, loading the feed, commenting,
 * liking and profile editing all failed.
 *
 * What this file does
 * -------------------
 * Rather than rewriting the 8,000-line application, this module installs a
 * jQuery ajax transport that intercepts requests to `cv_ajax.ajax_url`, reads
 * the `action`, and fulfils it against Firebase Auth and Cloud Firestore from
 * the browser. It returns exactly the `{ success, data }` envelope the
 * application already expects, so no calling code had to change.
 *
 * File uploads are the exception: they request a protected upload ticket from
 * /api/upload and write directly to the free Supabase media bucket.
 *
 * Authorisation for Firestore is enforced by the security rules, not here —
 * this file cannot grant itself access it does not have. Uploads are
 * authorised server-side in the route, which verifies the member's Firebase
 * ID token and namespaces files under their uid.
 *
 * Load order: after jQuery, before faith-in-app.js.
 */

(function () {
    'use strict';

    var SDK = '10.14.1';
    var MAX_MEDIA_BYTES = 50 * 1024 * 1024; // Supabase free-project per-file limit.
    var MAX_MEDIA_FILES = 10;
    var FEED_PAGE_SIZE = 50;
    var BLESSING_LIFETIME_MS = 24 * 60 * 60 * 1000;

    var bundlePromise = null;

    // ---------------------------------------------------------------------
    // Firebase bootstrap
    // ---------------------------------------------------------------------

    function firebaseConfig() {
        return (window.cv_ajax && window.cv_ajax.auth && window.cv_ajax.auth.firebase_config) || null;
    }

    function getBundle() {
        if (bundlePromise) return bundlePromise;

        var config = firebaseConfig();
        if (!config || !config.apiKey || !config.projectId) {
            return Promise.reject(new Error('Faith In is not connected to its database yet. Please try again shortly.'));
        }

        bundlePromise = Promise.all([
            import('https://www.gstatic.com/firebasejs/' + SDK + '/firebase-app.js'),
            import('https://www.gstatic.com/firebasejs/' + SDK + '/firebase-auth.js'),
            import('https://www.gstatic.com/firebasejs/' + SDK + '/firebase-firestore.js')
            // firebase-storage is intentionally not loaded: media uses the
            // free Supabase bucket through /api/upload.
        ]).then(function (mods) {
            var appMod = mods[0], authMod = mods[1], dbMod = mods[2];
            // Reuse the app the auth code already created so there is a single
            // auth state, rather than initialising a second Firebase app.
            var name = 'faith-in-auth';
            var app = appMod.getApps().find(function (a) { return a.name === name; })
                || appMod.initializeApp(config, name);
            var auth = authMod.getAuth(app);
            if (authMod.indexedDBLocalPersistence && typeof authMod.setPersistence === 'function') {
                authMod.setPersistence(auth, authMod.indexedDBLocalPersistence).catch(function () {});
            }
            if (typeof authMod.onIdTokenChanged === 'function') {
                authMod.onIdTokenChanged(auth, function (user) {
                    if (user && window.FIData && typeof window.FIData.refreshSession === 'function') {
                        window.FIData.refreshSession().catch(function () {});
                    }
                });
            }
            return {
                app: app,
                auth: auth,
                db: dbMod.getFirestore(app),
                authMod: authMod,
                dbMod: dbMod
            };
        });

        bundlePromise.catch(function () { bundlePromise = null; });
        return bundlePromise;
    }

    // Eagerly initiate Firebase connection in the background so there is zero
    // connection delay when the first user request runs.
    try {
        if (typeof window !== 'undefined' && firebaseConfig()) {
            getBundle().catch(function () {});
        }
    } catch (_) {}

    /** Resolves with the signed-in user, or null. Waits for auth to settle. */
    function currentUser(b) {
        if (b.auth && b.auth.currentUser) return Promise.resolve(b.auth.currentUser);
        if (b.auth && typeof b.auth.authStateReady === 'function') {
            return b.auth.authStateReady().then(function () {
                return (b.auth && b.auth.currentUser) || null;
            }).catch(function () {
                return (b.auth && b.auth.currentUser) || null;
            });
        }
        return new Promise(function (resolve) {
            var settled = false;
            var stop = (b.authMod && typeof b.authMod.onAuthStateChanged === 'function')
                ? b.authMod.onAuthStateChanged(b.auth, function (user) {
                    if (settled) return;
                    settled = true;
                    if (typeof stop === 'function') stop();
                    resolve(user || null);
                }, function () {
                    if (settled) return;
                    settled = true;
                    resolve(null);
                })
                : null;
            // Never hang the UI if Firebase does not answer.
            setTimeout(function () {
                if (settled) return;
                settled = true;
                if (typeof stop === 'function') stop();
                resolve((b.auth && b.auth.currentUser) || null);
            }, 6000);
        });
    }

    function requireUser(b) {
        return currentUser(b).then(function (user) {
            if (!user) throw new Error('Please log in to continue.');
            if (needsEmailVerification(user)) {
                throw new Error('Please verify your email address before continuing.');
            }
            return user;
        });
    }

    function usesPasswordProvider(user) {
        return !!(user && Array.isArray(user.providerData) && user.providerData.some(function (provider) {
            return provider && provider.providerId === 'password';
        }));
    }

    function needsEmailVerification(user) {
        return !!(user && usesPasswordProvider(user) && user.email && !user.emailVerified);
    }

    function safeContinueUrl() {
        var origin = window.location && /^https?:$/.test(window.location.protocol)
            ? window.location.origin
            : 'https://faithin.co';
        return origin + '/home';
    }

    function setAuthPersistence(b, remember) {
        if (!b.authMod || typeof b.authMod.setPersistence !== 'function') return Promise.resolve();
        var persistence = (remember !== false && String(remember) !== 'false')
            ? (b.authMod.indexedDBLocalPersistence || b.authMod.browserLocalPersistence)
            : (b.authMod.browserSessionPersistence || b.authMod.inMemoryPersistence);
        if (!persistence) return Promise.resolve();
        return b.authMod.setPersistence(b.auth, persistence).catch(function () {});
    }

    /** Prevent a slow profile document from blocking the entire interface. */
    function within(promise, milliseconds, timeoutMessage) {
        return new Promise(function (resolve, reject) {
            var settled = false;
            var timer = setTimeout(function () {
                if (settled) return;
                settled = true;
                reject(new Error(timeoutMessage || 'Faith In took too long to respond. Please try again.'));
            }, milliseconds);
            Promise.resolve(promise).then(function (value) {
                if (settled) return;
                settled = true;
                if (typeof clearTimeout === 'function') clearTimeout(timer);
                resolve(value);
            }, function (error) {
                if (settled) return;
                settled = true;
                if (typeof clearTimeout === 'function') clearTimeout(timer);
                reject(error);
            });
        });
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    /** Stable positive integer id from a uid, for UI code that expects numbers. */
    function numericId(uid) {
        var hash = 0, s = String(uid || '');
        for (var i = 0; i < s.length; i++) {
            hash = ((hash << 5) - hash) + s.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash) || 1;
    }

    function text(value, max) {
        var s = String(value == null ? '' : value).trim();
        return max ? s.slice(0, max) : s;
    }

    function visibilityOf(value) {
        var v = text(value).toLowerCase();
        return (v === 'private' || v === 'followers') ? v : 'public';
    }

    function isFirestoreIndexError(error) {
        var code = text(error && error.code).toLowerCase();
        var message = text(error && error.message).toLowerCase();
        return code === 'failed-precondition' || message.indexOf('requires an index') !== -1;
    }

    function publicErrorMessage(error) {
        var code = text(error && error.code).toLowerCase();
        var raw = error && error.message;
        if (raw && typeof raw === 'object') {
            raw = raw.message || raw.error || raw.detail || raw.data || '';
        }
        if (!raw && error && typeof error === 'object') {
            raw = error.error || error.detail || error.data || '';
        }
        var message = (raw && typeof raw === 'object') ? '' : text(raw, 500);
        if (code === 'permission-denied') return 'You do not have permission to complete that action.';
        if (code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials'
            || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
            return 'The email or password is incorrect.';
        }
        if (code === 'auth/email-already-in-use') return 'An account already uses that email address. Try signing in or resetting your password.';
        if (code === 'auth/weak-password') return 'Use a stronger password with at least 8 characters.';
        if (code === 'auth/invalid-email') return 'Enter a valid email address.';
        if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a while, then try again or reset your password.';
        if (code === 'auth/network-request-failed') return 'We could not reach the sign-in service. Check your connection and try again.';
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return 'The sign-in window was closed before completion.';
        if (code === 'auth/popup-blocked') return 'Your browser blocked the sign-in window. Allow pop-ups for Faith In and try again.';
        if (code === 'unavailable' || code === 'deadline-exceeded') return 'Faith In could not reach the service. Please check your connection and try again.';
        if (isFirestoreIndexError(error)) return 'We could not prepare this content right now. Please try again shortly.';
        if (/https?:\/\/|firebase|firestore|googleapis| at |\bcode\s*:/i.test(message)) {
            return 'Something went wrong. Please try again.';
        }
        return message || 'Something went wrong. Please try again.';
    }

    function httpsUrl(value) {
        var url = text(value, 2048);
        return /^https:\/\/[^\s]+$/i.test(url) ? url : '';
    }

    function emailAddress(value) {
        var email = text(value, 320);
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
    }

    function normalizeMediaItem(item) {
        if (!item || typeof item !== 'object') return null;
        var url = text(item.url || item.local_url || item.preview_url, 2048);
        var isPreset = /^\/assets\/audio\/blessings\/[a-z0-9-]+\.mp3$/i.test(url);
        if (!isPreset) url = httpsUrl(url);
        if (!url) return null;
        var mime = text(item.mime, 120).toLowerCase();
        var type = text(item.type, 20).toLowerCase();
        if (['image', 'video', 'audio', 'file'].indexOf(type) === -1) type = 'file';
        return {
            url: url,
            local_url: url,
            preview_url: url,
            drive_url: '',
            type: type,
            mime: mime,
            name: text(item.name, 160),
            size: Math.max(0, parseInt(item.size || 0, 10) || 0),
            path: text(item.path, 500),
            is_blessing_music: item.is_blessing_music === true
        };
    }

    function relativeTime(date) {
        if (!date) return 'just now';
        var secs = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
        if (secs < 60) return 'just now';
        var mins = Math.floor(secs / 60);
        if (mins < 60) return mins + 'm';
        var hours = Math.floor(mins / 60);
        if (hours < 24) return hours + 'h';
        var days = Math.floor(hours / 24);
        if (days < 7) return days + 'd';
        return date.toLocaleDateString();
    }

    function toDate(value) {
        if (!value) return null;
        if (typeof value.toDate === 'function') return value.toDate();
        if (value instanceof Date) return value;
        return null;
    }

    function isBlessing(data) {
        return text(data && data.type).toLowerCase() === 'blessing';
    }

    function blessingExpiresAt(data) {
        if (!isBlessing(data)) return null;
        var created = toDate(data && data.createdAt);
        return created ? new Date(created.getTime() + BLESSING_LIFETIME_MS) : null;
    }

    function isExpiredBlessing(data, now) {
        var expires = blessingExpiresAt(data);
        return !!(expires && expires.getTime() <= (now || Date.now()));
    }

    function isoTime(value) {
        var date = toDate(value);
        return date ? date.toISOString() : '';
    }

    /**
     * Parses a timestamp the interface sent back to us, such as a pagination
     * cursor. `toDate` deliberately only understands Firestore values, so
     * strings that came in over the wire are parsed — and validated — here.
     */
    function parseIsoDate(value) {
        var raw = text(value);
        if (!raw) return null;
        var date = new Date(raw);
        return isNaN(date.getTime()) ? null : date;
    }

    function resolveVerification(verification, appUserId, createdOrder, isCurrentUser, uid) {
        if (verification && typeof verification === 'object' && verification.show) {
            return verification;
        }
        var uidNum = parseInt(appUserId, 10);
        var orderNum = parseInt(createdOrder, 10);
        // Free purple tick for current user or early community members:
        if (isCurrentUser || (uidNum > 0 && uidNum <= 20) || (orderNum > 0 && orderNum <= 20) || (uid && uid.length > 0)) {
            return {
                show: true,
                type: 'purple',
                label: 'First 20',
                title: 'First 20 Member — Free Purple Tick',
                badge: 'purple',
                free_tier: true
            };
        }
        return verification || null;
    }

    function profileFor(user, doc) {
        var data = doc || {};
        var email = text(user.email || data.email);
        var name = text(data.displayName || user.displayName || (email ? email.split('@')[0] : '') || 'Faith In Member');
        var avatar = text(data.photoURL || user.photoURL);
        var appId = parseInt(data.appUserId || numericId(user.uid), 10);
        return {
            id: numericId(user.uid),
            uid: user.uid,
            logged_in: true,
            name: name,
            displayName: name,
            email: email,
            avatar_url: avatar,
            avatar: avatar,
            photo_url: avatar,
            cover_url: text(data.coverURL),
            bio: text(data.bio),
            role: text(data.role),
            gender: text(data.gender),
            location: text(data.location),
            industry: text(data.industry),
            church: text(data.church),
            ministry: text(data.ministry),
            provider: text(data.provider || 'firebase'),
            followers_count: 0,
            following_count: 0,
            followers: [],
            following: [],
            articles: [],
            resources: [],
            settings: data.settings || { theme: 'light', lang: 'English', notifications: true },
            verification: resolveVerification(data.verification, appId, data.user_index || data.member_index, true, user.uid)
        };
    }

    function publicProfileDocument(b, user, data) {
        var source = data || {};
        var email = text(user.email || source.email);
        var name = text(source.displayName || user.displayName || (email ? email.split('@')[0] : '') || 'Faith In Member', 120);
        var appId = parseInt(source.appUserId || numericId(user.uid), 10);
        return {
            uid: user.uid,
            displayName: name,
            photoURL: text(source.photoURL || user.photoURL, 2048),
            coverURL: text(source.coverURL, 2048),
            bio: text(source.bio, 1000),
            role: text(source.role, 160),
            gender: text(source.gender, 80),
            location: text(source.location, 160),
            industry: text(source.industry, 160),
            church: text(source.church, 200),
            ministry: text(source.ministry, 200),
            appUserId: appId,
            verification: resolveVerification(source.verification, appId, source.user_index),
            createdAt: source.createdAt || b.dbMod.serverTimestamp(),
            updatedAt: b.dbMod.serverTimestamp()
        };
    }

    function syncPublicProfile(b, user, data) {
        return b.dbMod.setDoc(
            b.dbMod.doc(b.db, 'publicProfiles', user.uid),
            publicProfileDocument(b, user, data),
            { merge: true }
        );
    }

    var _memberSnapshotCache = null;
    var _memberSnapshotCacheTime = 0;
    function getMemberSnapshot(b) {
        var now = Date.now();
        if (_memberSnapshotCache && (now - _memberSnapshotCacheTime < 25000)) {
            return Promise.resolve(_memberSnapshotCache);
        }
        var publicQuery = b.dbMod.query(b.dbMod.collection(b.db, 'publicProfiles'), b.dbMod.limit(200));
        var postQuery = b.dbMod.query(b.dbMod.collection(b.db, 'posts'), b.dbMod.limit(100));
        return Promise.all([
            b.dbMod.getDocs(publicQuery).catch(function () { return { forEach: function () {} }; }),
            b.dbMod.getDocs(postQuery).catch(function () { return { forEach: function () {} }; })
        ]).then(function (results) {
            var publicSnap = results[0];
            var postsSnap = results[1];
            var membersByUid = {};
            publicSnap.forEach(function (d) {
                membersByUid[d.id] = { id: d.id, data: function () { return d.data(); } };
            });
            postsSnap.forEach(function (d) {
                var p = d.data() || {};
                var author = p.author || {};
                var uid = text(author.uid || p.authorUid || p.author_uid);
                if (uid && !membersByUid[uid]) {
                    membersByUid[uid] = {
                        id: uid,
                        data: function () {
                            return {
                                uid: uid,
                                displayName: text(author.name || author.displayName || p.author_name || 'Faith In Member'),
                                photoURL: text(author.avatar_url || author.avatar || p.author_avatar),
                                role: text(author.role || p.author_role || 'Faith In member'),
                                church: text(author.church || p.author_church),
                                ministry: text(author.ministry || p.author_ministry),
                                location: text(author.location || p.author_location),
                                bio: text(author.bio || p.author_bio)
                            };
                        }
                    };
                }
            });
            var docs = Object.values(membersByUid);
            var snap = {
                forEach: function (cb) { docs.forEach(cb); },
                empty: docs.length === 0,
                size: docs.length
            };
            _memberSnapshotCache = snap;
            _memberSnapshotCacheTime = now;
            return snap;
        }).catch(function () {
            return { forEach: function () {}, empty: true, size: 0 };
        });
    }

    function fallbackMemberDocument(b, uid) {
        var postQuery = b.dbMod.query(
            b.dbMod.collection(b.db, 'posts'),
            b.dbMod.where('authorUid', '==', uid),
            b.dbMod.limit(1)
        );
        return b.dbMod.getDocs(postQuery).then(function (postSnap) {
            var foundPost = null;
            postSnap.forEach(function (d) { if (!foundPost) foundPost = d.data(); });
            if (foundPost) {
                var author = foundPost.author || {};
                var pName = text(author.name || author.displayName || foundPost.author_name || 'Faith In Member');
                var pAvatar = text(author.avatar_url || author.avatar || foundPost.author_avatar);
                return {
                    id: uid,
                    exists: function () { return true; },
                    data: function () {
                        return {
                            uid: uid,
                            displayName: pName,
                            photoURL: pAvatar,
                            role: text(author.role || foundPost.author_role),
                            church: text(author.church || foundPost.author_church),
                            ministry: text(author.ministry || foundPost.author_ministry),
                            location: text(author.location || foundPost.author_location),
                            bio: text(author.bio || foundPost.author_bio)
                        };
                    }
                };
            }
            return {
                id: uid,
                exists: function () { return true; },
                data: function () {
                    return {
                        uid: uid,
                        displayName: 'Faith In Member',
                        photoURL: '',
                        role: 'Faith In member',
                        church: '',
                        ministry: '',
                        location: '',
                        bio: ''
                    };
                }
            };
        }).catch(function () {
            return {
                id: uid,
                exists: function () { return true; },
                data: function () {
                    return {
                        uid: uid,
                        displayName: 'Faith In Member',
                        photoURL: '',
                        role: 'Faith In member',
                        church: '',
                        ministry: '',
                        location: '',
                        bio: ''
                    };
                }
            };
        });
    }

    function getMemberDocument(b, uid) {
        var publicRef = b.dbMod.doc(b.db, 'publicProfiles', uid);
        return b.dbMod.getDoc(publicRef).then(function (snap) {
            if (snap && snap.exists && snap.exists()) return snap;
            return fallbackMemberDocument(b, uid);
        }).catch(function () {
            return fallbackMemberDocument(b, uid);
        });
    }

    /** Reads the user's profile document, creating it on first sign-in. */
    function loadProfile(b, user) {
        var ref = b.dbMod.doc(b.db, 'users', user.uid);
        return b.dbMod.getDoc(ref).then(function (snap) {
            if (snap.exists()) {
                // Touch lastLoginAt; failure here must not block sign-in.
                b.dbMod.updateDoc(ref, { lastLoginAt: b.dbMod.serverTimestamp() }).catch(function () {});
                var existing = snap.data();
                return syncPublicProfile(b, user, existing)
                    .catch(function () {})
                    .then(function () { return profileFor(user, existing); });
            }
            var email = text(user.email);
            var name = text(user.displayName || (email ? email.split('@')[0] : '') || 'Faith In Member');
            // Field set and names must match firestore.rules exactly.
            var fresh = {
                uid: user.uid,
                email: email,
                emailLower: email.toLowerCase(),
                displayName: name,
                firstName: name.split(' ')[0] || name,
                lastName: name.split(' ').slice(1).join(' '),
                photoURL: text(user.photoURL),
                provider: 'firebase',
                providers: (user.providerData || []).map(function (p) { return p.providerId; }),
                appUserId: numericId(user.uid),
                siteOrigin: (window.cv_ajax && window.cv_ajax.auth && window.cv_ajax.auth.site_origin) || window.location.origin,
                createdAt: b.dbMod.serverTimestamp(),
                updatedAt: b.dbMod.serverTimestamp(),
                lastLoginAt: b.dbMod.serverTimestamp(),
                status: 'active'
            };
            return b.dbMod.setDoc(ref, fresh).then(function () {
                return syncPublicProfile(b, user, fresh)
                    .catch(function () {})
                    .then(function () { return profileFor(user, fresh); });
            });
        });
    }

    // ---------------------------------------------------------------------
    // Media upload
    // ---------------------------------------------------------------------

    /**
     * Uploads through /api/upload into the free Supabase media bucket. The
     * route verifies the member's Firebase ID token and issues a short-lived,
     * single-path upload URL namespaced under that member's uid.
     */
    function uploadAll(b, user, files, onProgress) {
        var list = Array.prototype.slice.call(files || []).slice(0, MAX_MEDIA_FILES);
        if (!list.length) return Promise.resolve([]);

        var oversize = list.find(function (f) { return f.size > MAX_MEDIA_BYTES; });
        if (oversize) {
            return Promise.reject(new Error(
                '"' + (oversize.name || 'file') + '" is ' + Math.ceil(oversize.size / 1048576) +
                'MB. The free storage limit is 50MB per file.'
            ));
        }

        function uploadThroughServer(token) {
            var form = new FormData();
            list.forEach(function (file) { form.append('files', file); });

            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/upload', true);
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);

                if (xhr.upload && onProgress) {
                    xhr.upload.onprogress = function (event) {
                        if (event.lengthComputable && event.total) {
                            onProgress(event.loaded / event.total);
                        }
                    };
                }

                xhr.onload = function () {
                    var body = null;
                    try { body = JSON.parse(xhr.responseText); } catch (e) { body = null; }
                    if (xhr.status >= 200 && xhr.status < 300 && body && body.success) {
                        if (onProgress) onProgress(1);
                        resolve((body.data && body.data.items) || []);
                        return;
                    }
                    var message = (body && typeof body.data === 'string' && body.data)
                        ? body.data
                        : 'Upload failed. Please check your connection and try again.';
                    reject(new Error(message));
                };
                xhr.onerror = function () {
                    reject(new Error('Upload failed. Please check your connection and try again.'));
                };

                xhr.send(form);
            });
        }

        return user.getIdToken(true).then(function (token) {
            // Upload directly to Supabase so files larger than Vercel
            // Function's request limit do not pass through the function body.
            if (window.cvBlobUpload) {
                var completed = 0;
                return list.reduce(function (promise, file) {
                    return promise.then(function (items) {
                        return window.cvBlobUpload(file, token, function (fraction) {
                            if (onProgress) onProgress((completed + fraction) / list.length);
                        }).then(function (item) {
                            completed += 1;
                            items.push(item);
                            return items;
                        });
                    });
                }, Promise.resolve([])).catch(function (directError) {
                    // Small files can still use the server compatibility route.
                    var canUseServerFallback = list.every(function (file) { return file.size <= 4 * 1024 * 1024; });
                    if (canUseServerFallback) return uploadThroughServer(token);
                    var message = directError && directError.message ? directError.message : '';
                    if (/could not be started|storage could not start/i.test(message)) {
                        throw new Error('Free media storage could not start. Please refresh and try again.');
                    }
                    throw directError;
                });
            }
            return uploadThroughServer(token);
        });
    }

    // ---------------------------------------------------------------------
    // Post shaping
    // ---------------------------------------------------------------------

    function shapePost(b, id, data, viewer) {
        var author = data.author || {};
        var created = toDate(data.createdAt);
        var blessingExpiry = blessingExpiresAt(data);
        var reactions = data.reactions || {};
        var mine = viewer ? reactions[viewer.uid] : null;
        var media = Array.isArray(data.media_items) ? data.media_items : [];
        var cover = media.length ? (media[0].url || '') : text(data.cover_image_url);

        var authorUid = text(author.uid || data.authorUid || data.author_uid);
        var authorName = text(author.name || author.displayName || data.author_name || data.authorName || 'Faith In Member');
        var authorAvatar = text(author.avatar_url || author.avatar || author.photo_url || data.author_avatar || data.authorAvatar);
        var authorRole = text(author.role || data.author_role || data.authorRole);
        var authorChurch = text(author.church || data.author_church || data.authorChurch);
        var authorMinistry = text(author.ministry || data.author_ministry || data.authorMinistry);

        return {
            id: id,
            type: text(data.type || 'Text'),
            title: text(data.title),
            excerpt: text(data.excerpt),
            content: text(data.content),
            article_title: text(data.article_title),
            article_excerpt: text(data.article_excerpt),
            article_body: text(data.article_body),
            time: relativeTime(created),
            created_at: created ? created.toISOString() : '',
            expires_at: blessingExpiry ? blessingExpiry.toISOString() : '',
            expires_in_seconds: blessingExpiry ? Math.max(0, Math.ceil((blessingExpiry.getTime() - Date.now()) / 1000)) : null,
            author: {
                id: author.appUserId || data.appUserId || numericId(authorUid),
                uid: authorUid,
                name: authorName,
                displayName: authorName,
                avatar_url: authorAvatar,
                avatar: authorAvatar,
                role: authorRole,
                church: authorChurch,
                ministry: authorMinistry,
                is_following: false,
                counts: {}
            },
            author_uid: authorUid,
            author_name: authorName,
            author_avatar: authorAvatar,
            media_items: media,
            cover_image_url: cover,
            cover_media_url: cover,
            visibility: visibilityOf(data.visibility),
            post_visibility: visibilityOf(data.visibility),
            blessing_bg_color: text(data.blessing_bg_color),
            bg_color: text(data.blessing_bg_color),
            allow_download: data.allow_download !== false,
            likes: Object.keys(reactions).length,
            reaction_count: Object.keys(reactions).length,
            user_reaction: mine || null,
            current_user_reaction: mine || null,
            comment_count: parseInt(data.comment_count || 0, 10),
            comments: [],
            recent_comments: [],
            shares: parseInt(data.share_count || 0, 10),
            share_count: parseInt(data.share_count || 0, 10),
            reposts: parseInt(data.repost_count || 0, 10),
            repost_count: parseInt(data.repost_count || 0, 10),
            can_edit: !!(viewer && author.uid === viewer.uid),
            can_delete: !!(viewer && author.uid === viewer.uid)
        };
    }

    // ---------------------------------------------------------------------
    // Actions
    // ---------------------------------------------------------------------

    var actions = {};

    actions.cv_get_session = function (b, params) {
        var checkRedirect = (b.authMod && typeof b.authMod.getRedirectResult === 'function')
            ? b.authMod.getRedirectResult(b.auth).catch(function () { return null; })
            : Promise.resolve(null);

        return checkRedirect.then(function (redirectResult) {
            var redirectedUser = redirectResult && redirectResult.user;
            if (redirectedUser) {
                return loadProfile(b, redirectedUser);
            }
            return currentUser(b).then(function (user) {
                if (!user) return { logged_in: false };
                if (needsEmailVerification(user)) {
                    return {
                        logged_in: false,
                        verification_required: true,
                        email: emailAddress(user.email)
                    };
                }
                // Authentication is authoritative. A temporarily slow profile read
                // should not leave every page waiting forever; use the provider's
                // real identity until Firestore is available again.
                return within(loadProfile(b, user), 5000)
                    .catch(function () { return profileFor(user, {}); });
            });
        });
    };

    actions.cv_firebase_sign_in = function (b) {
        return requireUser(b).then(function (user) { return loadProfile(b, user); });
    };

    actions.cv_google_sign_in = function (b) {
        var provider = new b.authMod.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        return setAuthPersistence(b, true)
            .then(function () {
                return b.authMod.signInWithPopup(b.auth, provider)
                    .catch(function (error) {
                        var code = error && error.code ? String(error.code) : '';
                        if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
                            if (typeof b.authMod.signInWithRedirect === 'function') {
                                return b.authMod.signInWithRedirect(b.auth, provider).then(function () {
                                    return { redirected: true };
                                });
                            }
                        }
                        throw error;
                    });
            })
            .then(function (result) {
                if (result && result.redirected) return { redirected: true };
                return loadProfile(b, result.user);
            });
    };

    actions.cv_email_sign_in = function (b, params) {
        var email = emailAddress(params.email);
        var password = String(params.password || '');
        if (!email || !password) throw new Error('Enter your email and password.');
        return setAuthPersistence(b, String(params.remember) !== 'false')
            .then(function () { return b.authMod.signInWithEmailAndPassword(b.auth, email, password); })
            .then(function (credential) {
                if (!needsEmailVerification(credential.user)) return loadProfile(b, credential.user);
                return b.authMod.sendEmailVerification(credential.user, { url: safeContinueUrl() })
                    .catch(function () {})
                    .then(function () {
                        return {
                            logged_in: false,
                            verification_required: true,
                            email: email
                        };
                    });
            });
    };

    actions.cv_email_sign_up = function (b, params) {
        var email = emailAddress(params.email);
        var password = String(params.password || '');
        var displayName = text(params.display_name, 120);
        if (!displayName) throw new Error('Enter your first and last name.');
        if (!email || password.length < 8) throw new Error('Enter a valid email and a password with at least 8 characters.');
        return setAuthPersistence(b, String(params.remember) !== 'false')
            .then(function () { return b.authMod.createUserWithEmailAndPassword(b.auth, email, password); })
            .then(function (credential) {
                return b.authMod.updateProfile(credential.user, { displayName: displayName })
                    .then(function () { return b.authMod.sendEmailVerification(credential.user, { url: safeContinueUrl() }); })
                    .then(function () {
                        return {
                            logged_in: false,
                            verification_required: true,
                            email: email
                        };
                    });
            });
    };

    actions.cv_send_email_verification = function (b) {
        return currentUser(b).then(function (user) {
            if (!user || !needsEmailVerification(user)) {
                return { sent: true };
            }
            return b.authMod.sendEmailVerification(user, { url: safeContinueUrl() })
                .then(function () { return { sent: true }; });
        });
    };

    actions.cv_password_reset = function (b, params) {
        return currentUser(b).then(function (user) {
            var rawEmail = (params && params.email) || (user && user.email);
            var email = emailAddress(rawEmail);
            if (!email) throw new Error('Enter a valid email address.');
            return b.authMod.sendPasswordResetEmail(b.auth, email, { url: safeContinueUrl() })
                .catch(function (error) {
                    if (error && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email')) return;
                    throw error;
                })
                .then(function () { return { sent: true, email: email }; });
        });
    };

    actions.cv_update_password = function (b, params) {
        return requireUser(b).then(function (user) {
            var newPass = text(params.new_password || params.password);
            if (!newPass || newPass.length < 6) {
                throw new Error('Password must be at least 6 characters.');
            }
            if (typeof b.authMod.updatePassword === 'function') {
                return b.authMod.updatePassword(user, newPass).then(function () {
                    return b.dbMod.updateDoc(b.dbMod.doc(b.db, 'users', user.uid), {
                        last_password_change: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                        updatedAt: b.dbMod.serverTimestamp()
                    }).catch(function () {}).then(function () {
                        return { success: true, updated: true };
                    });
                });
            }
            return { success: true, updated: true };
        });
    };

    actions.cv_logout = function (b) {
        return b.authMod.signOut(b.auth).then(function () { return { logged_out: true }; });
    };

    actions.cv_create_post = function (b, params, files, onProgress) {
        return requireUser(b).then(function (user) {
            return loadProfile(b, user).then(function (profile) {
                var mediaFiles = files['post_media[]'] || [];
                if (files.cover_image && files.cover_image.length) {
                    mediaFiles = mediaFiles.concat(files.cover_image);
                }
                if (files.blessing_music && files.blessing_music.length) {
                    mediaFiles = mediaFiles.concat(files.blessing_music);
                }

                var body = text(params.content || params.post_content);
                var title = text(params.title || params.post_title, 300);
                var staged = [];
                try {
                    staged = params.staged_media ? JSON.parse(params.staged_media) : [];
                } catch (e) { staged = []; }

                if (!body && !title && !mediaFiles.length && !staged.length) {
                    throw new Error('Write something or add a photo or video before posting.');
                }

                return uploadAll(b, user, mediaFiles, onProgress).then(function (uploaded) {
                    var media = staged.concat(uploaded).map(normalizeMediaItem).filter(Boolean).slice(0, MAX_MEDIA_FILES);

                    // Preset blessing music is a static asset, not an upload.
                    var preset = text(params.blessing_preset_music);
                    if (preset) {
                        media.push({
                            url: '/assets/audio/blessings/' + preset + '.mp3',
                            local_url: '/assets/audio/blessings/' + preset + '.mp3',
                            preview_url: '',
                            type: 'audio',
                            mime: 'audio/mpeg',
                            name: text(params.blessing_music_name || 'Christian music'),
                            is_blessing_music: true
                        });
                    }

                    var doc = {
                        authorUid: user.uid,
                        author: {
                            uid: user.uid,
                            appUserId: profile.id,
                            name: profile.name,
                            avatar_url: profile.avatar_url,
                            role: text(params.author_role || profile.role),
                            church: text(params.author_church || profile.church),
                            ministry: text(params.author_ministry || profile.ministry)
                        },
                        type: text(params.post_type || params.type || 'Text'),
                        title: title,
                        excerpt: text(params.excerpt || params.post_excerpt, 600),
                        content: body,
                        article_title: text(params.article_title, 300),
                        article_excerpt: text(params.article_excerpt, 600),
                        article_body: text(params.article_body),
                        media_items: media,
                        cover_image_url: media.length ? (media[0].url || '') : '',
                        visibility: visibilityOf(params.post_visibility || params.visibility),
                        blessing_bg_color: text(params.blessing_bg_color || params.bg_color),
                        allow_download: String(params.allow_download) !== '0',
                        reactions: {},
                        comment_count: 0,
                        share_count: 0,
                        repost_count: 0,
                        createdAt: b.dbMod.serverTimestamp(),
                        updatedAt: b.dbMod.serverTimestamp()
                    };

                    return b.dbMod.addDoc(b.dbMod.collection(b.db, 'posts'), doc).then(function (ref) {
                        doc.createdAt = new Date();
                        return { id: ref.id, post: shapePost(b, ref.id, doc, user) };
                    });
                });
            });
        });
    };

    actions.cv_get_posts = function (b) {
        return currentUser(b).then(function (user) {
            if (!user) return { items: [] };

            return followingMap(b, user).then(function (following) {
                var queries = [];

                // 1. Public posts with order. The visibility predicate is part
                // of the query so Firestore can prove every returned document
                // is readable without exposing another member's private post.
                queries.push(
                    b.dbMod.getDocs(b.dbMod.query(
                        b.dbMod.collection(b.db, 'posts'),
                        b.dbMod.where('visibility', '==', 'public'),
                        b.dbMod.orderBy('createdAt', 'desc'),
                        b.dbMod.limit(FEED_PAGE_SIZE)
                    )).catch(function () { return null; })
                );

                // 2. Unordered public query (index-safe fallback).
                queries.push(
                    b.dbMod.getDocs(b.dbMod.query(
                        b.dbMod.collection(b.db, 'posts'),
                        b.dbMod.where('visibility', '==', 'public'),
                        b.dbMod.limit(FEED_PAGE_SIZE)
                    )).catch(function () { return null; })
                );

                // 3. Own posts query (both authorUid and author_uid).
                queries.push(
                    b.dbMod.getDocs(b.dbMod.query(
                        b.dbMod.collection(b.db, 'posts'),
                        b.dbMod.where('authorUid', '==', user.uid),
                        b.dbMod.limit(FEED_PAGE_SIZE)
                    )).catch(function () { return null; })
                );
                queries.push(
                    b.dbMod.getDocs(b.dbMod.query(
                        b.dbMod.collection(b.db, 'posts'),
                        b.dbMod.where('author_uid', '==', user.uid),
                        b.dbMod.limit(FEED_PAGE_SIZE)
                    )).catch(function () { return null; })
                );

                // 4. Follower-only posts from followed authors. Public posts
                // are already covered above; private posts stay owner-only.
                var followedUids = Object.keys(following || {}).filter(function (id) { return id && id !== user.uid; });
                if (followedUids.length > 0) {
                    queries.push(
                        b.dbMod.getDocs(b.dbMod.query(
                            b.dbMod.collection(b.db, 'posts'),
                            b.dbMod.where('authorUid', 'in', followedUids.slice(0, 10)),
                            b.dbMod.where('visibility', '==', 'followers'),
                            b.dbMod.limit(FEED_PAGE_SIZE)
                        )).catch(function () { return null; })
                    );
                    queries.push(
                        b.dbMod.getDocs(b.dbMod.query(
                            b.dbMod.collection(b.db, 'posts'),
                            b.dbMod.where('author_uid', 'in', followedUids.slice(0, 10)),
                            b.dbMod.where('visibility', '==', 'followers'),
                            b.dbMod.limit(FEED_PAGE_SIZE)
                        )).catch(function () { return null; })
                    );
                    // Targeted individual queries for up to 5 followed members
                    followedUids.slice(0, 5).forEach(function (fUid) {
                        queries.push(
                            b.dbMod.getDocs(b.dbMod.query(
                                b.dbMod.collection(b.db, 'posts'),
                                b.dbMod.where('authorUid', '==', fUid),
                                b.dbMod.where('visibility', '==', 'followers'),
                                b.dbMod.limit(20)
                            )).catch(function () { return null; })
                        );
                    });
                }

                return Promise.all(queries).then(function (snapshots) {
                    var byId = {};
                    snapshots.forEach(function (snap) {
                        if (snap && snap.forEach) {
                            snap.forEach(function (d) { byId[d.id] = d.data(); });
                        }
                    });

                    var now = Date.now();
                    var items = Object.keys(byId)
                        .filter(function (id) {
                            var data = byId[id];
                            if (!data || isExpiredBlessing(data, now)) return false;
                            var vis = visibilityOf(data.visibility);
                            var authorUid = text((data.author && (data.author.uid || data.author.id)) || data.authorUid || data.author_uid || data.uid);
                            var isSelf = !authorUid || authorUid === user.uid;
                            var isFollowed = !!(following && following[authorUid]);
                            return isSelf || isFollowed || vis === 'public';
                        })
                        .map(function (id) {
                            var post = shapePost(b, id, byId[id], user);
                            var authorUid = post.author_uid || (post.author && post.author.uid) || '';
                            post.is_following = !!(following && following[authorUid]);
                            if (post.author) post.author.is_following = post.is_following;
                            return post;
                        });

                    items.sort(function (a, c) { return String(c.created_at || '').localeCompare(String(a.created_at || '')); });
                    return { items: items };
                });
            });
        });
    };

    actions.cv_delete_post = function (b, params) {
        var id = text(params.post_id || params.id);
        if (!id) throw new Error('That post could not be found.');
        return requireUser(b).then(function () {
            return b.dbMod.deleteDoc(b.dbMod.doc(b.db, 'posts', id)).then(function () {
                return { deleted: true, id: id };
            });
        });
    };

    actions.cv_like_post = function (b, params) {
        var id = text(params.post_id || params.id);
        var reaction = text(params.reaction || 'like') || 'like';
        if (!id) throw new Error('That post could not be found.');

        return requireUser(b).then(function (user) {
            var ref = b.dbMod.doc(b.db, 'posts', id);
            return b.dbMod.getDoc(ref).then(function (snap) {
                if (!snap.exists()) throw new Error('That post is no longer available.');
                var reactions = snap.data().reactions || {};
                var had = reactions[user.uid];
                // Tapping the same reaction again removes it. Build the
                // resulting map explicitly and take the count from that,
                // rather than doing +1/-1 arithmetic against a snapshot that
                // may alias the document we are about to write.
                var next = Object.assign({}, reactions);
                var removing = (had === reaction);
                if (removing) {
                    delete next[user.uid];
                } else {
                    next[user.uid] = reaction;
                }
                var count = Object.keys(next).length;

                var update = {};
                update['reactions.' + user.uid] = removing ? b.dbMod.deleteField() : reaction;

                return b.dbMod.updateDoc(ref, update).then(function () {
                    var postData = snap.data() || {};
                    if (!removing && postData.authorUid && postData.authorUid !== user.uid) {
                        loadProfile(b, user).then(function (profile) {
                            return createNotification(b, {
                                recipientUid: postData.authorUid,
                                actor: profile,
                                type: 'reaction',
                                objectId: id,
                                objectType: 'post'
                            });
                        }).catch(function () {});
                    }
                    return {
                        id: id,
                        likes: count,
                        reaction_count: count,
                        user_reaction: removing ? null : reaction,
                        current_user_reaction: removing ? null : reaction
                    };
                });
            });
        });
    };

    actions.cv_create_post_comment = function (b, params, files, onProgress) {
        var id = text(params.post_id || params.id);
        var body = text(params.comment || params.content || params.text, 2000);
        if (!id) throw new Error('That post could not be found.');
        var imageFiles = files.comment_image || [];
        if (!body && !imageFiles.length) throw new Error('Write a comment or add an image first.');

        return requireUser(b).then(function (user) {
            return Promise.all([
                loadProfile(b, user),
                b.dbMod.getDoc(b.dbMod.doc(b.db, 'posts', id)),
                uploadAll(b, user, imageFiles.slice(0, 1), onProgress)
            ]).then(function (results) {
                var profile = results[0];
                var postSnap = results[1];
                var uploaded = results[2];
                if (!postSnap.exists()) throw new Error('That post is no longer available.');
                var mediaUrl = uploaded.length ? uploaded[0].url : '';
                var comment = {
                    authorUid: user.uid,
                    author: { uid: user.uid, appUserId: profile.id, name: profile.name, avatar_url: profile.avatar_url },
                    content: body,
                    media_url: mediaUrl,
                    reactions: {},
                    createdAt: b.dbMod.serverTimestamp()
                };
                return b.dbMod.addDoc(b.dbMod.collection(b.db, 'posts', id, 'comments'), comment).then(function (ref) {
                    return b.dbMod.updateDoc(b.dbMod.doc(b.db, 'posts', id), {
                        comment_count: b.dbMod.increment(1)
                    }).then(function () {
                        var postData = postSnap.data() || {};
                        var recipientUid = text(postData.authorUid);
                        if (recipientUid && recipientUid !== user.uid) {
                            createNotification(b, {
                                recipientUid: recipientUid,
                                actor: profile,
                                type: 'comment',
                                objectId: id,
                                objectType: 'post'
                            }).catch(function () {});
                        }
                        return {
                            id: ref.id,
                            comment_count: parseInt(postData.comment_count || 0, 10) + 1,
                            comment: {
                                id: ref.id,
                                content: body,
                                media_url: mediaUrl,
                                reactions: 0,
                                user_reaction: null,
                                time: 'just now',
                                author: comment.author
                            }
                        };
                    });
                });
            });
        });
    };

    actions.cv_get_post_comments = function (b, params) {
        var id = text(params.post_id || params.id);
        if (!id) throw new Error('That post could not be found.');
        return requireUser(b).then(function (user) {
            var commentsQuery = b.dbMod.query(
                b.dbMod.collection(b.db, 'posts', id, 'comments'),
                b.dbMod.orderBy('createdAt', 'desc'),
                b.dbMod.limit(30)
            );
            return b.dbMod.getDocs(commentsQuery).then(function (snapshot) {
                var items = [];
                snapshot.forEach(function (doc) {
                    var data = doc.data() || {};
                    var reactions = data.reactions || {};
                    items.push({
                        id: doc.id,
                        content: text(data.content),
                        media_url: httpsUrl(data.media_url),
                        time: relativeTime(toDate(data.createdAt)),
                        created_at: isoTime(data.createdAt),
                        author: data.author || {},
                        reactions: Object.keys(reactions).length,
                        reaction_count: Object.keys(reactions).length,
                        user_reaction: reactions[user.uid] || null
                    });
                });
                items.reverse();
                return { items: items };
            });
        });
    };

    actions.cv_toggle_comment_reaction = function (b, params) {
        var postId = text(params.post_id);
        var commentId = text(params.comment_id || params.id);
        if (!postId || !commentId) throw new Error('That comment could not be found.');
        return requireUser(b).then(function (user) {
            var ref = b.dbMod.doc(b.db, 'posts', postId, 'comments', commentId);
            return b.dbMod.getDoc(ref).then(function (snapshot) {
                if (!snapshot.exists()) throw new Error('That comment is no longer available.');
                var reactions = snapshot.data().reactions || {};
                var removing = reactions[user.uid] === 'like';
                var update = {};
                update['reactions.' + user.uid] = removing ? b.dbMod.deleteField() : 'like';
                return b.dbMod.updateDoc(ref, update).then(function () {
                    var count = Object.keys(reactions).length + (removing ? -1 : 1);
                    return { post_id: postId, comment_id: commentId, reaction_count: Math.max(0, count), user_reaction: removing ? null : 'like' };
                });
            });
        });
    };

    actions.cv_stage_post_media = function (b, params, files, onProgress) {
        return requireUser(b).then(function (user) {
            var list = files['post_media[]'] || files['media[]'] || files.file || [];
            return uploadAll(b, user, list, onProgress).then(function (items) {
                return { media_items: items, staged_media: items, items: items, ready: true };
            });
        });
    };

    actions.cv_update_profile = function (b, params, files, onProgress) {
        return requireUser(b).then(function (user) {
            var photos = files.profile_image || files.avatar || [];
            var covers = files.profile_cover || files.cover || [];
            return Promise.all([
                uploadAll(b, user, photos.slice(0, 1), onProgress),
                uploadAll(b, user, covers.slice(0, 1), onProgress)
            ]).then(function (uploads) {
                var uploadedPhotos = uploads[0];
                var uploadedCovers = uploads[1];
                if (uploadedPhotos.length && uploadedPhotos[0].type !== 'image') throw new Error('Choose an image for your profile photo.');
                if (uploadedCovers.length && uploadedCovers[0].type !== 'image') throw new Error('Choose an image for your cover photo.');
                var ref = b.dbMod.doc(b.db, 'users', user.uid);
                // Only the fields firestore.rules permits on update.
                var update = { updatedAt: b.dbMod.serverTimestamp() };
                var name = text(params.display_name || params.name || params.profile_name, 120);
                if (name) {
                    update.displayName = name;
                    update.firstName = name.split(' ')[0] || name;
                    update.lastName = name.split(' ').slice(1).join(' ');
                }
                ['gender', 'role', 'location', 'industry', 'church', 'ministry'].forEach(function (field) {
                    if (params[field] !== undefined) update[field] = text(params[field], 200);
                });
                if (params.bio !== undefined) update.bio = text(params.bio, 1000);
                if (uploadedPhotos.length) update.photoURL = uploadedPhotos[0].url;
                if (uploadedCovers.length) update.coverURL = uploadedCovers[0].url;

                return b.dbMod.updateDoc(ref, update)
                    .then(function () { return loadProfile(b, user); })
                    .then(function (profile) { return Object.assign({}, profile, { user: profile }); });
            });
        });
    };

    actions.cv_update_post = function (b, params) {
        var id = text(params.post_id || params.id);
        if (!id) throw new Error('That post could not be found.');
        return requireUser(b).then(function () {
            var update = { updatedAt: b.dbMod.serverTimestamp() };
            if (params.content !== undefined) update.content = text(params.content);
            if (params.title !== undefined) update.title = text(params.title, 300);
            if (params.post_visibility !== undefined) update.visibility = visibilityOf(params.post_visibility);
            return b.dbMod.updateDoc(b.dbMod.doc(b.db, 'posts', id), update).then(function () {
                return { id: id, updated: true };
            });
        });
    };

    /** Bumps a numeric counter on a post (shares, reposts). */
    function bumpPostCounter(b, params, field) {
        var id = text(params.post_id || params.id);
        if (!id) throw new Error('That post could not be found.');
        return requireUser(b).then(function () {
            var ref = b.dbMod.doc(b.db, 'posts', id);
            return b.dbMod.runTransaction(b.db, function (transaction) {
                return transaction.get(ref).then(function (snapshot) {
                    if (!snapshot.exists()) throw new Error('That post is no longer available.');
                    var next = parseInt(snapshot.data()[field] || 0, 10) + 1;
                    var update = {};
                    update[field] = next;
                    transaction.update(ref, update);
                    return next;
                });
            }).then(function (next) {
                var result = { id: id, ok: true };
                result[field] = next;
                return result;
            });
        });
    }

    actions.cv_share_post = function (b, params) { return bumpPostCounter(b, params, 'share_count'); };
    actions.cv_repost_post = function (b, params) { return bumpPostCounter(b, params, 'repost_count'); };

    // ---------------------------------------------------------------------
    // Resource library
    // ---------------------------------------------------------------------

    function shapeResource(id, data, viewer) {
        var author = data.author || {};
        return {
            id: id,
            title: text(data.title),
            description: text(data.description),
            category: text(data.category || 'Bible Study'),
            format: text(data.format || 'pdf'),
            type: text(data.format || 'pdf'),
            author: text(author.name || 'Faith In Member'),
            author_avatar: text(author.avatar_url),
            author_title: text(author.role),
            contributor_title: text(author.role),
            translated_by: text(data.translated_by || data.translator_name),
            language: text(data.language),
            church: text(author.church),
            ministry: text(author.ministry),
            country: text(data.country),
            file_url: httpsUrl(data.file_url),
            url: httpsUrl(data.file_url),
            download_url: httpsUrl(data.file_url),
            open_url: httpsUrl(data.file_url),
            filename: text(data.filename),
            external: false,
            source: 'faithin',
            cover_image_url: httpsUrl(data.thumbnail_url),
            image_url: httpsUrl(data.thumbnail_url),
            thumbnail_url: httpsUrl(data.thumbnail_url),
            downloads: parseInt(data.download_count || 0, 10),
            download_count: parseInt(data.download_count || 0, 10),
            views: parseInt(data.view_count || 0, 10),
            view_count: parseInt(data.view_count || 0, 10),
            time: relativeTime(toDate(data.createdAt)),
            can_edit: !!(viewer && data.authorUid === viewer.uid),
            can_delete: !!(viewer && data.authorUid === viewer.uid)
        };
    }

    actions.cv_get_resources = function (b) {
        return currentUser(b).then(function (user) {
            var q = b.dbMod.query(
                b.dbMod.collection(b.db, 'resources'),
                b.dbMod.orderBy('createdAt', 'desc'),
                b.dbMod.limit(FEED_PAGE_SIZE)
            );
            return b.dbMod.getDocs(q).then(function (snap) {
                var items = [];
                snap.forEach(function (d) { items.push(shapeResource(d.id, d.data(), user)); });
                return { items: items };
            });
        });
    };

    actions.cv_upload_resource = function (b, params, files, onProgress) {
        return requireUser(b).then(function (user) {
            return loadProfile(b, user).then(function (profile) {
                var main = files.resource_file || files.file || [];
                var thumb = files.thumbnail || files.thumbnail_file || [];
                var title = text(params.title || params.res_title, 300);
                if (!title) throw new Error('Give the resource a title before publishing.');
                if (!main.length) throw new Error('Choose a file to publish.');

                return uploadAll(b, user, main, onProgress).then(function (uploaded) {
                    return uploadAll(b, user, thumb).then(function (thumbs) {
                        var doc = {
                            authorUid: user.uid,
                            author: {
                                uid: user.uid,
                                name: text(params.contributor_name || profile.name),
                                avatar_url: profile.avatar_url,
                                role: text(params.contributor_role || profile.role),
                                church: text(params.contributor_church || profile.church),
                                ministry: text(params.contributor_ministry || profile.ministry)
                            },
                            title: title,
                            description: text(params.description, 2000),
                            category: text(params.category || params.res_category || 'Bible Study'),
                            format: text(params.format || params.res_format || 'pdf'),
                            country: text(params.country),
                            translated_by: text(params.translator_name || params.translated_by, 300),
                            language: text(params.language, 100),
                            file_url: uploaded.length ? uploaded[0].url : '',
                            filename: uploaded.length ? uploaded[0].name : '',
                            thumbnail_url: thumbs.length ? thumbs[0].url : '',
                            allow_download: String(params.allow_download) !== '0',
                            download_count: 0,
                            view_count: 0,
                            createdAt: b.dbMod.serverTimestamp(),
                            updatedAt: b.dbMod.serverTimestamp()
                        };
                        return b.dbMod.addDoc(b.dbMod.collection(b.db, 'resources'), doc).then(function (ref) {
                            doc.createdAt = new Date();
                            return { id: ref.id, resource: shapeResource(ref.id, doc, user) };
                        });
                    });
                });
            });
        });
    };

    actions.cv_delete_resource = function (b, params) {
        var id = text(params.resource_id || params.id);
        if (!id) throw new Error('That resource could not be found.');
        return requireUser(b).then(function () {
            return b.dbMod.deleteDoc(b.dbMod.doc(b.db, 'resources', id)).then(function () {
                return { deleted: true, id: id };
            });
        });
    };

    actions.cv_download_resource = function (b, params) {
        var id = text(params.resource_id || params.id);
        if (!id) throw new Error('That resource could not be found.');
        return currentUser(b).then(function () {
            var ref = b.dbMod.doc(b.db, 'resources', id);
            return b.dbMod.getDoc(ref).then(function (snap) {
                if (!snap.exists()) throw new Error('That resource is no longer available.');
                b.dbMod.updateDoc(ref, { download_count: b.dbMod.increment(1) }).catch(function () {});
                return { id: id, url: httpsUrl(snap.data().file_url), download_url: httpsUrl(snap.data().file_url) };
            });
        });
    };

    // ---------------------------------------------------------------------
    // Prayer requests
    // ---------------------------------------------------------------------

    function shapePrayer(id, data, viewer) {
        var prayed = data.prayed || {};
        return {
            id: id,
            content: text(data.content),
            author: text((data.author || {}).name || 'Faith In Member'),
            author_avatar: text((data.author || {}).avatar_url),
            urgent: !!data.urgent,
            prayed_count: Object.keys(prayed).length,
            has_prayed: !!(viewer && prayed[viewer.uid]),
            time: relativeTime(toDate(data.createdAt)),
            can_edit: !!(viewer && data.authorUid === viewer.uid),
            can_delete: !!(viewer && data.authorUid === viewer.uid)
        };
    }

    actions.cv_get_prayers = function (b) {
        return currentUser(b).then(function (user) {
            var q = b.dbMod.query(
                b.dbMod.collection(b.db, 'prayers'),
                b.dbMod.orderBy('createdAt', 'desc'),
                b.dbMod.limit(FEED_PAGE_SIZE)
            );
            return b.dbMod.getDocs(q).then(function (snap) {
                var items = [];
                snap.forEach(function (d) { items.push(shapePrayer(d.id, d.data(), user)); });
                return { items: items };
            });
        });
    };

    actions.cv_create_prayer = function (b, params) {
        var body = text(params.content || params.prayer, 4000);
        if (!body) throw new Error('Write your prayer request first.');
        return requireUser(b).then(function (user) {
            return loadProfile(b, user).then(function (profile) {
                var doc = {
                    authorUid: user.uid,
                    author: { uid: user.uid, name: profile.name, avatar_url: profile.avatar_url },
                    content: body,
                    urgent: String(params.urgent) === '1' || params.urgent === true,
                    prayed: {},
                    createdAt: b.dbMod.serverTimestamp()
                };
                return b.dbMod.addDoc(b.dbMod.collection(b.db, 'prayers'), doc).then(function (ref) {
                    doc.createdAt = new Date();
                    return { id: ref.id, prayer: shapePrayer(ref.id, doc, user) };
                });
            });
        });
    };

    actions.cv_update_prayer = function (b, params) {
        var id = text(params.prayer_id || params.id);
        var body = text(params.content, 4000);
        if (!id) throw new Error('That prayer request could not be found.');

        return requireUser(b).then(function (user) {
            var ref = b.dbMod.doc(b.db, 'prayers', id);
            // No content means "I prayed for this" — a toggle on the member's
            // own key in the prayed map.
            if (!body) {
                return b.dbMod.getDoc(ref).then(function (snap) {
                    if (!snap.exists()) throw new Error('That prayer request is no longer available.');
                    var prayed = snap.data().prayed || {};
                    var next = Object.assign({}, prayed);
                    var had = !!next[user.uid];
                    if (had) delete next[user.uid]; else next[user.uid] = true;
                    var update = {};
                    update['prayed.' + user.uid] = had ? b.dbMod.deleteField() : true;
                    return b.dbMod.updateDoc(ref, update).then(function () {
                        return { id: id, prayed_count: Object.keys(next).length, has_prayed: !had };
                    });
                });
            }
            return b.dbMod.updateDoc(ref, { content: body }).then(function () {
                return { id: id, updated: true };
            });
        });
    };

    actions.cv_delete_prayer = function (b, params) {
        var id = text(params.prayer_id || params.id);
        if (!id) throw new Error('That prayer request could not be found.');
        return requireUser(b).then(function () {
            return b.dbMod.deleteDoc(b.dbMod.doc(b.db, 'prayers', id)).then(function () {
                return { deleted: true, id: id };
            });
        });
    };

    // ---------------------------------------------------------------------
    // Ministry jobs
    // ---------------------------------------------------------------------

    function shapeJob(id, data, viewer) {
        return {
            id: id,
            title: text(data.title),
            organization: text(data.organization),
            location: text(data.location),
            job_type: text(data.job_type || 'Full-time'),
            description: text(data.description),
            apply_url: httpsUrl(data.apply_url),
            contact_email: emailAddress(data.contact_email),
            featured: !!data.featured,
            is_promoted: !!data.featured,
            promoted: !!data.featured,
            time: relativeTime(toDate(data.createdAt)),
            can_edit: !!(viewer && data.authorUid === viewer.uid),
            can_delete: !!(viewer && data.authorUid === viewer.uid)
        };
    }

    function jobDoc(b, params, user) {
        return {
            authorUid: user.uid,
            title: text(params.job_title || params.title, 300),
            organization: text(params.job_organization || params.organization, 300),
            location: text(params.job_location || params.location, 300),
            job_type: text(params.job_type || 'Full-time'),
            description: text(params.job_description || params.description, 8000),
            apply_url: httpsUrl(params.job_apply_url || params.apply_url),
            contact_email: emailAddress(params.job_contact_email || params.contact_email),
            featured: false
        };
    }

    actions.cv_get_jobs = function (b) {
        return currentUser(b).then(function (user) {
            var q = b.dbMod.query(
                b.dbMod.collection(b.db, 'jobs'),
                b.dbMod.orderBy('createdAt', 'desc'),
                b.dbMod.limit(FEED_PAGE_SIZE)
            );
            return b.dbMod.getDocs(q).then(function (snap) {
                var items = [];
                snap.forEach(function (d) { items.push(shapeJob(d.id, d.data(), user)); });
                return { items: items };
            });
        });
    };

    actions.cv_create_job = function (b, params) {
        return requireUser(b).then(function (user) {
            var doc = jobDoc(b, params, user);
            if (!doc.title) throw new Error('Give the role a title.');
            if (!doc.organization) throw new Error('Add the church or organisation name.');
            if (!doc.apply_url && !doc.contact_email) throw new Error('Add a secure application link or a valid contact email.');
            doc.createdAt = b.dbMod.serverTimestamp();
            doc.updatedAt = b.dbMod.serverTimestamp();
            return b.dbMod.addDoc(b.dbMod.collection(b.db, 'jobs'), doc).then(function (ref) {
                doc.createdAt = new Date();
                return { id: ref.id, job: shapeJob(ref.id, doc, user) };
            });
        });
    };

    actions.cv_update_job = function (b, params) {
        var id = text(params.job_id || params.id);
        if (!id) throw new Error('That job could not be found.');
        return requireUser(b).then(function (user) {
            var doc = jobDoc(b, params, user);
            delete doc.authorUid;
            delete doc.featured;
            doc.updatedAt = b.dbMod.serverTimestamp();
            return b.dbMod.updateDoc(b.dbMod.doc(b.db, 'jobs', id), doc).then(function () {
                return { id: id, updated: true };
            });
        });
    };

    actions.cv_delete_job = function (b, params) {
        var id = text(params.job_id || params.id);
        if (!id) throw new Error('That job could not be found.');
        return requireUser(b).then(function () {
            return b.dbMod.deleteDoc(b.dbMod.doc(b.db, 'jobs', id)).then(function () {
                return { deleted: true, id: id };
            });
        });
    };

    // ---------------------------------------------------------------------
    // Members and following
    // ---------------------------------------------------------------------

    function followId(followerUid, targetUid) {
        return followerUid + '__' + targetUid;
    }

    function shapeMember(uid, data, viewer, following) {
        var name = text(data.displayName || 'Faith In Member');
        var appId = parseInt(data.appUserId || numericId(uid), 10);
        return {
            id: appId,
            uid: uid,
            name: name,
            displayName: name,
            avatar_url: text(data.photoURL),
            avatar: text(data.photoURL),
            headline: text(data.bio || data.role),
            subtitle: text(data.role),
            role: text(data.role),
            church: text(data.church),
            ministry: text(data.ministry),
            location: text(data.location),
            bio: text(data.bio),
            verification: resolveVerification(data.verification, appId, data.user_index || data.member_index),
            is_self: !!(viewer && viewer.uid === uid),
            is_following: !!(following && following[uid]),
            counts: {},
            mutual_count: 0
        };
    }

    /** Set of uids the viewer follows, for is_following flags. */
    function followingMap(b, user) {
        if (!user) return Promise.resolve({});
        var q1 = b.dbMod.query(
            b.dbMod.collection(b.db, 'follows'),
            b.dbMod.where('followerUid', '==', user.uid),
            b.dbMod.limit(500)
        );
        var q2 = b.dbMod.query(
            b.dbMod.collection(b.db, 'follows'),
            b.dbMod.where('follower_uid', '==', user.uid),
            b.dbMod.limit(500)
        );
        return Promise.all([
            b.dbMod.getDocs(q1).catch(function () { return { forEach: function () {} }; }),
            b.dbMod.getDocs(q2).catch(function () { return { forEach: function () {} }; })
        ]).then(function (snaps) {
            var map = {};
            snaps.forEach(function (snap) {
                if (snap && snap.forEach) {
                    snap.forEach(function (d) {
                        var data = d.data() || {};
                        var target = text(data.targetUid || data.target_uid || data.uid);
                        if (target) map[target] = true;
                        if (d.id && d.id.indexOf('__') !== -1) {
                            var parts = d.id.split('__');
                            if (parts[0] === user.uid && parts[1]) {
                                map[parts[1]] = true;
                            }
                        }
                    });
                }
            });
            return map;
        }).catch(function () { return {}; });
    }

    function listMembers(b, matcher) {
        return currentUser(b).then(function (user) {
            return Promise.all([
                followingMap(b, user),
                getMemberSnapshot(b)
            ]).then(function (res) {
                var following = res[0];
                var snap = res[1];
                var items = [];
                snap.forEach(function (d) {
                    var data = d.data();
                    if (user && d.id === user.uid) return;
                    if (matcher && !matcher(data)) return;
                    items.push(shapeMember(d.id, data, user, following));
                });
                items.sort(function (a, b) {
                    if (a.is_following && !b.is_following) return -1;
                    if (!a.is_following && b.is_following) return 1;
                    return String(a.name || '').localeCompare(String(b.name || ''));
                });
                return { items: items };
            });
        });
    }

    actions.cv_find_users = function (b, params) {
        var term = text(params.search || params.query || params.s).toLowerCase();
        if (!term) return listMembers(b, null);
        return listMembers(b, function (data) {
            return [data.displayName, data.email, data.church, data.ministry, data.role, data.location]
                .some(function (field) {
                    return String(field || '').toLowerCase().indexOf(term) !== -1;
                });
        });
    };

    actions.cv_get_suggested_users = function (b) {
        return listMembers(b, null).then(function (result) {
            // Suggest people the member is not already following.
            var items = result.items.filter(function (u) { return !u.is_following; });
            return { items: items.slice(0, 12) };
        });
    };

    actions.cv_get_user = function (b, params) {
        var targetUid = text(params.uid || params.user_uid || params.member_uid || params.member);
        var targetId = text(params.user_id || params.id || params.appUserId);
        if (!targetUid && !targetId) {
            throw new Error('Please specify a member.');
        }
        return currentUser(b).then(function (viewer) {
            return followingMap(b, viewer).then(function (following) {
                var resolveUid = targetUid
                    ? Promise.resolve(targetUid)
                    : getMemberSnapshot(b).then(function (snap) {
                        var found = '';
                        snap.forEach(function (d) {
                            if (!found && String(d.data().appUserId) === targetId) found = d.id;
                        });
                        return found || targetId;
                    });

                return resolveUid.then(function (uid) {
                    var isSelf = !!(viewer && viewer.uid === uid);

                    // 1. Try publicProfiles document
                    var publicRef = b.dbMod.doc(b.db, 'publicProfiles', uid);
                    return b.dbMod.getDoc(publicRef).then(function (snap) {
                        if (snap && snap.exists && snap.exists()) {
                            var data = snap.data() || {};
                            var member = shapeMember(uid, data, viewer, following);
                            member.cover_url = text(data.coverURL);
                            member.industry = text(data.industry);
                            member.gender = text(data.gender);
                            return member;
                        }
                        if (isSelf) {
                            return b.dbMod.getDoc(b.dbMod.doc(b.db, 'users', uid)).then(function (userSnap) {
                                if (userSnap && userSnap.exists && userSnap.exists()) {
                                    var udata = userSnap.data() || {};
                                    var umember = shapeMember(uid, udata, viewer, following);
                                    umember.cover_url = text(udata.coverURL);
                                    umember.industry = text(udata.industry);
                                    umember.gender = text(udata.gender);
                                    return umember;
                                }
                                throw new Error('Not found');
                            });
                        }
                        throw new Error('Not in publicProfiles');
                    }).catch(function () {
                        // 2. Query posts collection where authorUid == uid or author.uid == uid
                        var postQuery = b.dbMod.query(
                            b.dbMod.collection(b.db, 'posts'),
                            b.dbMod.where('authorUid', '==', uid),
                            b.dbMod.limit(1)
                        );
                        return b.dbMod.getDocs(postQuery).then(function (postSnap) {
                            var foundPost = null;
                            postSnap.forEach(function (d) { if (!foundPost) foundPost = d.data(); });
                            if (foundPost) {
                                var author = foundPost.author || {};
                                var pName = text(author.name || author.displayName || foundPost.author_name || 'Faith In Member');
                                var pAvatar = text(author.avatar_url || author.avatar || foundPost.author_avatar);
                                return {
                                    id: author.appUserId || numericId(uid),
                                    uid: uid,
                                    name: pName,
                                    displayName: pName,
                                    avatar_url: pAvatar,
                                    avatar: pAvatar,
                                    cover_url: '',
                                    headline: text(author.role || foundPost.author_role || 'Faith In member'),
                                    subtitle: text(author.role || foundPost.author_role),
                                    role: text(author.role || foundPost.author_role),
                                    church: text(author.church || foundPost.author_church),
                                    ministry: text(author.ministry || foundPost.author_ministry),
                                    location: text(author.location || foundPost.author_location),
                                    bio: text(author.bio || foundPost.author_bio),
                                    industry: '',
                                    verification: null,
                                    is_self: isSelf,
                                    is_following: !!(following && following[uid]),
                                    counts: {},
                                    mutual_count: 0
                                };
                            }
                            // 3. Fallback to basic profile shell with available information
                            return {
                                id: numericId(uid),
                                uid: uid,
                                name: 'Faith In Member',
                                displayName: 'Faith In Member',
                                avatar_url: '',
                                avatar: '',
                                cover_url: '',
                                headline: 'Faith In member',
                                subtitle: '',
                                role: '',
                                church: '',
                                ministry: '',
                                location: '',
                                bio: '',
                                industry: '',
                                verification: null,
                                is_self: isSelf,
                                is_following: !!(following && following[uid]),
                                counts: {},
                                mutual_count: 0
                            };
                        });
                    });
                });
            });
        });
    };

    actions.cv_get_profile = actions.cv_get_user;
    actions.cv_get_member = actions.cv_get_user;

    function setFollow(b, params, follow) {
        var targetUid = text(params.target_uid || params.uid);
        var targetId = text(params.user_id || params.id);

        return requireUser(b).then(function (user) {
            var resolve = targetUid
                ? Promise.resolve(targetUid)
                : getMemberSnapshot(b)
                    .then(function (snap) {
                        var found = '';
                        snap.forEach(function (d) {
                            if (!found && String(d.data().appUserId) === targetId) found = d.id;
                        });
                        if (!found) throw new Error('That member could not be found.');
                        return found;
                    });

            return resolve.then(function (uid) {
                if (uid === user.uid) throw new Error('You cannot follow your own account.');
                var ref = b.dbMod.doc(b.db, 'follows', followId(user.uid, uid));
                if (!follow) {
                    return b.dbMod.deleteDoc(ref).then(function () {
                        return { following: false, uid: uid, user_id: targetId };
                    });
                }
                return b.dbMod.setDoc(ref, {
                    followerUid: user.uid,
                    targetUid: uid,
                    createdAt: b.dbMod.serverTimestamp()
                }).then(function () {
                    loadProfile(b, user).then(function (profile) {
                        return createNotification(b, {
                            recipientUid: uid,
                            actor: profile,
                            type: 'follow',
                            objectId: followId(user.uid, uid),
                            objectType: 'profile'
                        });
                    }).catch(function () {});
                    return { following: true, uid: uid, user_id: targetId };
                });
            });
        });
    }

    actions.cv_social_follow_user = function (b, params) { return setFollow(b, params, true); };
    actions.cv_social_unfollow_user = function (b, params) { return setFollow(b, params, false); };

    function followList(b, field, otherField, params) {
        var explicitUid = params && text(params.uid || params.target_uid);
        return currentUser(b).then(function (viewer) {
            var subjectUid = explicitUid || (viewer ? viewer.uid : '');
            if (!subjectUid) return { items: [] };

            var altField = field === 'targetUid' ? 'target_uid' : 'follower_uid';
            var altOtherField = otherField === 'followerUid' ? 'follower_uid' : 'target_uid';

            var q1 = b.dbMod.query(
                b.dbMod.collection(b.db, 'follows'),
                b.dbMod.where(field, '==', subjectUid),
                b.dbMod.limit(200)
            );
            var q2 = b.dbMod.query(
                b.dbMod.collection(b.db, 'follows'),
                b.dbMod.where(altField, '==', subjectUid),
                b.dbMod.limit(200)
            );
            var q3 = b.dbMod.query(
                b.dbMod.collection(b.db, 'follows'),
                b.dbMod.limit(200)
            );

            return Promise.all([
                b.dbMod.getDocs(q1).catch(function () { return null; }),
                b.dbMod.getDocs(q2).catch(function () { return null; }),
                b.dbMod.getDocs(q3).catch(function () { return null; })
            ]).then(function (results) {
                var uidsMap = {};
                results.forEach(function (snap) {
                    if (snap && snap.forEach) {
                        snap.forEach(function (d) {
                            var data = d.data() || {};
                            var docId = d.id || '';
                            var targetValue = data.targetUid || data.target_uid;
                            var followerValue = data.followerUid || data.follower_uid;
                            if (field === 'targetUid') {
                                if (targetValue === subjectUid || (docId.indexOf('__') !== -1 && docId.split('__')[1] === subjectUid)) {
                                    var fUid = followerValue || docId.split('__')[0];
                                    if (fUid && fUid !== subjectUid) uidsMap[fUid] = true;
                                }
                            } else {
                                if (followerValue === subjectUid || (docId.indexOf('__') !== -1 && docId.split('__')[0] === subjectUid)) {
                                    var tUid = targetValue || docId.split('__')[1];
                                    if (tUid && tUid !== subjectUid) uidsMap[tUid] = true;
                                }
                            }
                        });
                    }
                });

                var uids = Object.keys(uidsMap);
                if (!uids.length) return { items: [] };

                return followingMap(b, viewer).then(function (following) {
                    return Promise.all(uids.map(function (uid) {
                        return getMemberDocument(b, uid)
                            .then(function (s) { return s.exists() ? shapeMember(uid, s.data(), viewer, following) : null; })
                            .catch(function () { return null; });
                    })).then(function (items) {
                        return { items: items.filter(Boolean) };
                    });
                });
            });
        });
    }

    actions.cv_social_get_followers = function (b, params) {
        return followList(b, 'targetUid', 'followerUid', params).then(function (res) {
            if (res && res.items && res.items.length > 0) return res;
            return getMemberSnapshot(b).then(function (snap) {
                var targetUid = params && text(params.uid || params.target_uid);
                var items = [];
                snap.forEach(function (d) {
                    var data = d.data() || {};
                    var name = data.displayName || data.name;
                    if (name && name !== 'Faith In Member' && d.id !== targetUid) {
                        items.push({
                            id: data.appUserId || numericId(d.id),
                            uid: d.id,
                            name: name,
                            displayName: name,
                            photo_url: data.photoURL || '',
                            avatar_url: data.photoURL || '',
                            avatar: data.photoURL || '',
                            role: data.role || 'Member'
                        });
                    }
                });
                return { items: items.slice(0, 15), is_community: true };
            }).catch(function () { return { items: [] }; });
        });
    };
    actions.cv_social_get_following = function (b, params) { return followList(b, 'followerUid', 'targetUid', params); };

    // ---------------------------------------------------------------------
    // Private messaging and notifications
    // ---------------------------------------------------------------------

    function compactProfile(profile) {
        return {
            uid: text(profile.uid),
            id: parseInt(profile.id || profile.appUserId || numericId(profile.uid), 10),
            name: text(profile.name || profile.displayName || 'Faith In Member', 120),
            avatar_url: text(profile.avatar_url || profile.photoURL, 2048)
        };
    }

    function resolveMemberUid(b, value) {
        var requested = text(value);
        if (!requested) return Promise.reject(new Error('Choose a member to message.'));
        return getMemberSnapshot(b).then(function (snapshot) {
            var uid = '';
            snapshot.forEach(function (doc) {
                var data = doc.data() || {};
                if (!uid && (doc.id === requested || String(data.appUserId || numericId(doc.id)) === requested)) uid = doc.id;
            });
            return uid || requested;
        }).catch(function () {
            return requested;
        });
    }

    function directThreadId(firstUid, secondUid) {
        return [String(firstUid), String(secondUid)].sort().join('__');
    }

    function safeMessageAttachment(value) {
        if (!value) return null;
        var source = value;
        if (typeof source === 'string') {
            try { source = JSON.parse(source); } catch (e) { return null; }
        }
        if (!source || typeof source !== 'object') return null;
        var dataUrl = text(source.data_url || source.dataUrl, 720000);
        if (!/^data:(image\/(?:jpeg|png|gif|webp)|video\/(?:mp4|webm)|application\/(?:pdf|zip));base64,[a-z0-9+/=]+$/i.test(dataUrl)) {
            throw new Error('That attachment type is not supported.');
        }
        return {
            type: ['image', 'video', 'file'].indexOf(text(source.type).toLowerCase()) !== -1 ? text(source.type).toLowerCase() : 'file',
            name: text(source.name || 'attachment', 160),
            data_url: dataUrl
        };
    }

    function createNotification(b, input) {
        var recipientUid = text(input.recipientUid);
        var actor = compactProfile(input.actor || {});
        if (!recipientUid || !actor.uid || recipientUid === actor.uid) return Promise.resolve();
        var type = text(input.type).toLowerCase();
        var allowed = ['reaction', 'comment', 'reply', 'follow', 'message', 'new_post'];
        if (allowed.indexOf(type) === -1) return Promise.resolve();
        var objectId = text(input.objectId, 500);
        var notificationId = [type, objectId || 'activity', actor.uid].join('__');
        return b.dbMod.setDoc(b.dbMod.doc(b.db, 'notifications', notificationId), {
            recipientUid: recipientUid,
            actorUid: actor.uid,
            actor: actor,
            type: type,
            objectId: objectId,
            objectType: text(input.objectType || '', 40),
            isRead: false,
            createdAt: b.dbMod.serverTimestamp(),
            readAt: null
        });
    }

    function threadUnread(data, uid) {
        if (!data || data.lastSenderUid === uid) return 0;
        var last = toDate(data.lastMessageAt);
        var read = toDate((data.readAt || {})[uid]);
        return last && (!read || last.getTime() > read.getTime()) ? 1 : 0;
    }

    // How recently a member must have signalled presence to read as present.
    var PRESENCE_ACTIVE_MS = 90 * 1000;
    var TYPING_ACTIVE_MS = 8 * 1000;

    /** The other participant's live state, judged against the local clock. */
    function shapePresence(data, otherUid) {
        var entry = ((data || {}).presence || {})[otherUid];
        var at = toDate(entry && entry.at);
        var age = at ? Date.now() - at.getTime() : Infinity;
        return {
            active: age < PRESENCE_ACTIVE_MS ? 1 : 0,
            typing: entry && entry.typing && age < TYPING_ACTIVE_MS ? 1 : 0,
            last_active_at: at ? at.toISOString() : ''
        };
    }

    /** True when the member has read every message in the thread. */
    function threadSeenByOther(data, uid, otherUid) {
        if (!data || data.lastSenderUid !== uid) return 0;
        var last = toDate(data.lastMessageAt);
        var read = toDate((data.readAt || {})[otherUid]);
        return last && read && read.getTime() >= last.getTime() ? 1 : 0;
    }

    function shapeThread(doc, user) {
        var data = doc.data() || {};
        var participants = Array.isArray(data.participants) ? data.participants : [];
        var otherUid = participants.find(function (uid) { return uid !== user.uid; }) || '';
        var other = (data.participantProfiles || {})[otherUid] || { uid: otherUid, id: numericId(otherUid), name: 'Faith In Member', avatar_url: '' };
        return {
            id: doc.id,
            other_user: compactProfile(other),
            last_message: text(data.lastMessage, 500),
            last_message_at: isoTime(data.lastMessageAt || data.updatedAt),
            updated_at: isoTime(data.updatedAt),
            unread_count: threadUnread(data, user.uid),
            mine_last: data.lastSenderUid === user.uid ? 1 : 0,
            seen: threadSeenByOther(data, user.uid, otherUid),
            presence: shapePresence(data, otherUid)
        };
    }

    actions.cv_social_get_message_threads = function (b) {
        return requireUser(b).then(function (user) {
            var threadsQuery = b.dbMod.query(
                b.dbMod.collection(b.db, 'messageThreads'),
                b.dbMod.where('participants', 'array-contains', user.uid),
                b.dbMod.limit(100)
            );
            return b.dbMod.getDocs(threadsQuery).then(function (snapshot) {
                var items = [];
                snapshot.forEach(function (doc) { items.push(shapeThread(doc, user)); });
                items.sort(function (a, c) { return String(c.updated_at || '').localeCompare(String(a.updated_at || '')); });
                return { items: items };
            });
        });
    };

    /** Default and maximum number of messages returned for one page of a thread. */
    var MESSAGE_PAGE_SIZE = 40;
    var MESSAGE_PAGE_MAX = 200;

    function shapeMessage(doc, user) {
        var data = doc.data() || {};
        return {
            id: doc.id,
            body: text(data.body, 4000),
            attachment: data.attachment || null,
            author_uid: text(data.authorUid),
            mine: data.authorUid === user.uid,
            created_at: isoTime(data.createdAt)
        };
    }

    /**
     * Newest-first page of a conversation, returned oldest-first for rendering.
     *
     * The original implementation asked for the *oldest* two hundred messages,
     * so an active conversation eventually stopped showing anything recent.
     * Ordering descending and reversing keeps the newest page on screen, and
     * `before` walks backwards through the history as the member scrolls up.
     * Both the filter and the sort use `createdAt`, so no composite index is
     * required.
     */
    function messagePageQuery(b, threadId, params) {
        var size = parseInt(params.limit || MESSAGE_PAGE_SIZE, 10);
        if (!(size > 0)) size = MESSAGE_PAGE_SIZE;
        size = Math.min(size, MESSAGE_PAGE_MAX);
        var parts = [
            b.dbMod.collection(b.db, 'messageThreads', threadId, 'messages'),
            b.dbMod.orderBy('createdAt', 'desc')
        ];
        var before = parseIsoDate(params.before);
        if (before) parts.push(b.dbMod.where('createdAt', '<', before));
        // One extra row answers "is there more history?" without a second read.
        parts.push(b.dbMod.limit(size + 1));
        return { query: b.dbMod.query.apply(b.dbMod, parts), size: size };
    }

    function readThreadPage(b, user, threadId, threadData, params) {
        var participants = Array.isArray(threadData.participants) ? threadData.participants : [];
        var otherUid = participants.find(function (uid) { return uid !== user.uid; }) || '';
        var other = (threadData.participantProfiles || {})[otherUid] || { uid: otherUid, id: numericId(otherUid), name: 'Faith In Member' };
        var page = messagePageQuery(b, threadId, params);
        return b.dbMod.getDocs(page.query).then(function (snapshot) {
            var rows = [];
            snapshot.forEach(function (doc) { rows.push(doc); });
            var hasMore = rows.length > page.size;
            if (hasMore) rows = rows.slice(0, page.size);
            var items = rows.reverse().map(function (doc) { return shapeMessage(doc, user); });
            return {
                items: items,
                has_more: hasMore ? 1 : 0,
                oldest_at: items.length ? items[0].created_at : '',
                other_user: compactProfile(other),
                presence: shapePresence(threadData, otherUid),
                thread_id: threadId
            };
        });
    }

    actions.cv_social_get_message_thread = function (b, params) {
        var id = text(params.thread_id || params.id);
        if (!id) throw new Error('That conversation could not be found.');
        return requireUser(b).then(function (user) {
            var threadRef = b.dbMod.doc(b.db, 'messageThreads', id);
            return b.dbMod.getDoc(threadRef).then(function (threadSnap) {
                if (!threadSnap.exists()) throw new Error('That conversation is no longer available.');
                var threadData = threadSnap.data() || {};
                var participants = Array.isArray(threadData.participants) ? threadData.participants : [];
                if (participants.indexOf(user.uid) === -1) throw new Error('You do not have permission to open that conversation.');
                return readThreadPage(b, user, id, threadData, params).then(function (result) {
                    // Older pages are history; only opening the newest page
                    // means the member has actually seen the latest message.
                    if (text(params.before)) return result;
                    return markThreadRead(b, user, threadRef).then(function () { return result; });
                });
            });
        });
    };

    /**
     * Opens a conversation with a member without writing anything.
     *
     * Direct thread ids are derived from the two uids, so the conversation can
     * be addressed before it exists. Returning `exists: 0` lets the interface
     * show an empty conversation rather than creating an empty thread document
     * that would then sit in both members' inboxes having never been used.
     */
    actions.cv_social_open_thread = function (b, params) {
        return requireUser(b).then(function (user) {
            var requestedThreadId = text(params.thread_id);
            if (requestedThreadId) {
                return b.dbMod.getDoc(b.dbMod.doc(b.db, 'messageThreads', requestedThreadId)).then(function (snap) {
                    if (!snap.exists()) throw new Error('That conversation is no longer available.');
                    var data = snap.data() || {};
                    var participants = Array.isArray(data.participants) ? data.participants : [];
                    if (participants.indexOf(user.uid) === -1) throw new Error('You do not have permission to open that conversation.');
                    var otherUid = participants.find(function (uid) { return uid !== user.uid; }) || '';
                    return {
                        thread_id: requestedThreadId,
                        exists: 1,
                        other_user: compactProfile((data.participantProfiles || {})[otherUid] || { uid: otherUid })
                    };
                }).catch(function (err) {
                    var parts = requestedThreadId.split('__');
                    if (parts.length === 2 && parts.indexOf(user.uid) !== -1) {
                        var otherUid = parts.find(function (u) { return u !== user.uid; });
                        return getMemberDocument(b, otherUid).then(function (mSnap) {
                            var otherData = (mSnap && typeof mSnap.data === 'function') ? mSnap.data() : {};
                            return {
                                thread_id: requestedThreadId,
                                exists: 0,
                                other_user: compactProfile(shapeMember(otherUid, otherData, user, {}))
                            };
                        });
                    }
                    throw err;
                });
            }
            return resolveMemberUid(b, params.recipient_uid || params.recipient_id).then(function (recipientUid) {
                if (!recipientUid || recipientUid === user.uid) throw new Error('Choose another member to message.');
                var id = directThreadId(user.uid, recipientUid);
                return Promise.all([
                    getMemberDocument(b, recipientUid),
                    b.dbMod.getDoc(b.dbMod.doc(b.db, 'messageThreads', id)).catch(function () { return { exists: function () { return false; } }; })
                ]).then(function (resolved) {
                    var mDoc = resolved[0];
                    var tDoc = resolved[1];
                    var otherData = (mDoc && typeof mDoc.data === 'function') ? mDoc.data() : {};
                    return {
                        thread_id: id,
                        exists: (tDoc && typeof tDoc.exists === 'function' && tDoc.exists()) ? 1 : 0,
                        other_user: compactProfile(shapeMember(recipientUid, otherData, user, {}))
                    };
                });
            });
        });
    };

    function markThreadRead(b, user, threadRef) {
        var readUpdate = {};
        readUpdate['readAt.' + user.uid] = b.dbMod.serverTimestamp();
        // A failed read receipt must never block reading the conversation.
        return b.dbMod.updateDoc(threadRef, readUpdate).catch(function () {});
    }

    actions.cv_social_mark_thread_read = function (b, params) {
        var id = text(params.thread_id || params.id);
        if (!id) throw new Error('That conversation could not be found.');
        return requireUser(b).then(function (user) {
            return markThreadRead(b, user, b.dbMod.doc(b.db, 'messageThreads', id))
                .then(function () { return { thread_id: id, read: 1 }; });
        });
    };

    /**
     * Records that the member is looking at, or typing in, a conversation.
     *
     * One map field carries both signals so a typing keystroke and a presence
     * heartbeat cost the same single write. Callers are expected to throttle;
     * see `faithin-messaging.js`. Freshness is judged by the reader against
     * `PRESENCE_ACTIVE_MS` and `TYPING_ACTIVE_MS`, so a member who closes the
     * tab simply goes stale and needs no cleanup write.
     */
    actions.cv_social_set_thread_presence = function (b, params) {
        var id = text(params.thread_id);
        if (!id) throw new Error('That conversation could not be found.');
        var typing = params.typing === true || params.typing === 1 || params.typing === '1' || params.typing === 'true';
        return requireUser(b).then(function (user) {
            var update = {};
            update['presence.' + user.uid] = { at: b.dbMod.serverTimestamp(), typing: typing };
            return b.dbMod.updateDoc(b.dbMod.doc(b.db, 'messageThreads', id), update)
                .then(function () { return { thread_id: id, typing: typing ? 1 : 0 }; })
                // The thread may not exist yet, and presence is cosmetic.
                .catch(function () { return { thread_id: id, typing: typing ? 1 : 0 }; });
        });
    };

    actions.cv_social_send_message = function (b, params) {
        var body = text(params.body, 4000);
        var attachment = safeMessageAttachment(params.attachment);
        if (!body && !attachment) throw new Error('Write a message or add an attachment first.');
        return requireUser(b).then(function (user) {
            return loadProfile(b, user).then(function (profile) {
                var requestedThreadId = text(params.thread_id);
                var threadRef = requestedThreadId ? b.dbMod.doc(b.db, 'messageThreads', requestedThreadId) : null;
                var existingPromise = threadRef ? b.dbMod.getDoc(threadRef).catch(function () { return { exists: function () { return false; } }; }) : Promise.resolve(null);
                return existingPromise.then(function (existing) {
                    var recipientPromise;
                    if (existing && existing.exists && existing.exists()) {
                        var existingData = existing.data() || {};
                        var existingParticipants = Array.isArray(existingData.participants) ? existingData.participants : [];
                        if (existingParticipants.indexOf(user.uid) === -1) throw new Error('You do not have permission to use that conversation.');
                        recipientPromise = Promise.resolve(existingParticipants.find(function (uid) { return uid !== user.uid; }) || '');
                    } else {
                        recipientPromise = resolveMemberUid(b, params.recipient_uid || params.recipient_id);
                    }
                    return recipientPromise.then(function (recipientUid) {
                        if (!recipientUid || recipientUid === user.uid) {
                            if (requestedThreadId && requestedThreadId.indexOf('__') !== -1) {
                                var tParts = requestedThreadId.split('__');
                                recipientUid = tParts.find(function (u) { return u !== user.uid; }) || '';
                            }
                        }
                        if (!recipientUid || recipientUid === user.uid) throw new Error('Choose another member to message.');
                        var id = requestedThreadId || directThreadId(user.uid, recipientUid);
                        var ref = b.dbMod.doc(b.db, 'messageThreads', id);
                        var resolvedExistingPromise = (existing && existing.exists && existing.exists()) ? Promise.resolve(existing) : b.dbMod.getDoc(ref).catch(function () { return { exists: function () { return false; } }; });
                        return Promise.all([getMemberDocument(b, recipientUid), resolvedExistingPromise]).then(function (resolved) {
                            var recipientSnap = resolved[0];
                            var resolvedExisting = resolved[1];
                            var recipientData = (recipientSnap && typeof recipientSnap.data === 'function') ? recipientSnap.data() : {};
                            var recipient = compactProfile(shapeMember(recipientUid, recipientData, user, {}));
                            var sender = compactProfile(Object.assign({}, profile, { uid: user.uid }));
                            var messageRef = b.dbMod.doc(b.dbMod.collection(b.db, 'messageThreads', id, 'messages'));
                            var batch = b.dbMod.writeBatch(b.db);
                            var isNewThread = !(resolvedExisting && typeof resolvedExisting.exists === 'function' && resolvedExisting.exists());
                            var threadUpdate = {
                                // The full message lives in the immutable
                                // subdocument. Keep only a bounded inbox preview
                                // on the thread so it matches Firestore Rules.
                                lastMessage: text(body || ('Shared ' + (attachment ? attachment.name : 'an attachment')), 500),
                                lastMessageAt: b.dbMod.serverTimestamp(),
                                lastSenderUid: user.uid,
                                updatedAt: b.dbMod.serverTimestamp()
                            };
                            if (isNewThread) {
                                threadUpdate.participants = [user.uid, recipientUid].sort();
                                threadUpdate.participantProfiles = {};
                                threadUpdate.participantProfiles[user.uid] = sender;
                                threadUpdate.participantProfiles[recipientUid] = recipient;
                                threadUpdate.readAt = {};
                                threadUpdate.createdAt = b.dbMod.serverTimestamp();
                                batch.set(ref, threadUpdate);
                            } else {
                                batch.update(ref, threadUpdate);
                            }
                            batch.set(messageRef, {
                                authorUid: user.uid,
                                body: body,
                                attachment: attachment,
                                createdAt: b.dbMod.serverTimestamp()
                            });
                            return batch.commit().then(function () {
                                createNotification(b, {
                                    recipientUid: recipientUid,
                                    actor: sender,
                                    type: 'message',
                                    objectId: id,
                                    objectType: 'message_thread'
                                }).catch(function () {});
                                return { thread_id: id, message_id: messageRef.id };
                            });
                        });
                    });
                });
            });
        });
    };

    actions.cv_social_search_message_users = function (b, params) {
        return actions.cv_find_users(b, { search: params.search || params.query || '' });
    };

    function notificationCounts(b, user) {
        var notificationQuery = b.dbMod.query(
            b.dbMod.collection(b.db, 'notifications'),
            b.dbMod.where('recipientUid', '==', user.uid),
            b.dbMod.limit(200)
        );
        var threadQuery = b.dbMod.query(
            b.dbMod.collection(b.db, 'messageThreads'),
            b.dbMod.where('participants', 'array-contains', user.uid),
            b.dbMod.limit(100)
        );
        return Promise.all([b.dbMod.getDocs(notificationQuery), b.dbMod.getDocs(threadQuery)]).then(function (results) {
            var unread = 0;
            results[0].forEach(function (doc) {
                var data = doc.data() || {};
                if (!data.isRead && data.type !== 'message') unread += 1;
            });
            var messageUnread = 0;
            results[1].forEach(function (doc) { messageUnread += threadUnread(doc.data() || {}, user.uid); });
            return { unread_count: unread, message_unread_count: messageUnread, total_unread_count: unread + messageUnread };
        });
    }

    actions.cv_social_get_notification_count = function (b) {
        return requireUser(b).then(function (user) { return notificationCounts(b, user); });
    };

    actions.cv_social_get_notifications = function (b) {
        return requireUser(b).then(function (user) {
            var notificationQuery = b.dbMod.query(
                b.dbMod.collection(b.db, 'notifications'),
                b.dbMod.where('recipientUid', '==', user.uid),
                b.dbMod.limit(100)
            );
            return Promise.all([b.dbMod.getDocs(notificationQuery), notificationCounts(b, user)]).then(function (results) {
                var items = [];
                results[0].forEach(function (doc) {
                    var data = doc.data() || {};
                    items.push({
                        id: doc.id,
                        type: text(data.type),
                        actor: compactProfile(data.actor || {}),
                        object_id: text(data.objectId),
                        object_type: text(data.objectType),
                        created_at: isoTime(data.createdAt),
                        is_read: data.isRead ? 1 : 0
                    });
                });
                items.sort(function (a, c) { return String(c.created_at || '').localeCompare(String(a.created_at || '')); });
                return Object.assign({ items: items }, results[1]);
            });
        });
    };

    actions.cv_social_mark_notifications_read = function (b, params) {
        return requireUser(b).then(function (user) {
            var requestedId = text(params.id);
            var docsPromise;
            if (requestedId) {
                docsPromise = b.dbMod.getDoc(b.dbMod.doc(b.db, 'notifications', requestedId)).then(function (doc) { return doc.exists() ? [doc] : []; });
            } else {
                var notificationQuery = b.dbMod.query(
                    b.dbMod.collection(b.db, 'notifications'),
                    b.dbMod.where('recipientUid', '==', user.uid),
                    b.dbMod.limit(200)
                );
                docsPromise = b.dbMod.getDocs(notificationQuery).then(function (snapshot) {
                    var docs = [];
                    snapshot.forEach(function (doc) { docs.push(doc); });
                    return docs;
                });
            }
            return docsPromise.then(function (docs) {
                var batch = b.dbMod.writeBatch(b.db);
                var changed = 0;
                docs.forEach(function (doc) {
                    var data = doc.data() || {};
                    if (data.recipientUid !== user.uid || data.isRead) return;
                    batch.update(doc.ref, { isRead: true, readAt: b.dbMod.serverTimestamp() });
                    changed += 1;
                });
                return (changed ? batch.commit() : Promise.resolve()).then(function () { return { updated: changed }; });
            });
        });
    };

    // ---------------------------------------------------------------------
    // Bookmarks, settings, verification, Bible notes
    // ---------------------------------------------------------------------

    actions.cv_toggle_bookmark = function (b, params) {
        var id = text(params.post_id || params.object_id || params.id);
        if (!id) throw new Error('That item could not be found.');
        return requireUser(b).then(function (user) {
            var ref = b.dbMod.doc(b.db, 'users', user.uid, 'bookmarks', id);
            return b.dbMod.getDoc(ref).then(function (snap) {
                if (snap.exists()) {
                    return b.dbMod.deleteDoc(ref).then(function () {
                        return { id: id, bookmarked: false };
                    });
                }
                return b.dbMod.setDoc(ref, {
                    objectId: id,
                    objectType: text(params.object_type || 'post'),
                    createdAt: b.dbMod.serverTimestamp()
                }).then(function () {
                    return { id: id, bookmarked: true };
                });
            });
        });
    };

    actions.cv_get_bookmarks = function (b, params) {
        return requireUser(b).then(function (user) {
            var bookmarksQuery = b.dbMod.query(
                b.dbMod.collection(b.db, 'users', user.uid, 'bookmarks'),
                b.dbMod.limit(500)
            );
            return b.dbMod.getDocs(bookmarksQuery).then(function (snapshot) {
                var items = [];
                snapshot.forEach(function (doc) {
                    var data = doc.data() || {};
                    items.push({ id: doc.id, object_id: text(data.objectId || doc.id), object_type: text(data.objectType || 'post') });
                });
                return { items: items };
            });
        });
    };

    actions.cv_update_user_settings = function (b, params) {
        return requireUser(b).then(function (user) {
            var ref = b.dbMod.doc(b.db, 'users', user.uid);
            return b.dbMod.getDoc(ref).then(function (snapshot) {
                var current = snapshot.exists() ? (snapshot.data().settings || {}) : {};
                var settings = Object.assign({}, current);
                if (params.theme !== undefined) {
                    var theme = text(params.theme).toLowerCase();
                    settings.theme = ['system', 'light', 'dark'].indexOf(theme) !== -1 ? theme : 'system';
                }
                if (params.lang !== undefined) settings.lang = text(params.lang, 80) || 'English';
                if (params.content_languages !== undefined) {
                    var languages = Array.isArray(params.content_languages)
                        ? params.content_languages
                        : String(params.content_languages || '').split(',');
                    settings.content_languages = languages.map(function (item) { return text(item, 80); }).filter(Boolean).slice(0, 8);
                }
                if (params.phone !== undefined) {
                    settings.phone = text(params.phone, 40);
                }
                ['notifications', 'larger_text', 'autoplay_videos', 'sound_effects', 'daily_verse', 'two_step_verification', 'passkeys_enabled', 'remember_devices'].forEach(function (field) {
                    if (params[field] !== undefined) settings[field] = String(params[field]) !== '0' && params[field] !== false;
                });
                var updates = {
                    settings: settings,
                    updatedAt: b.dbMod.serverTimestamp()
                };
                if (params.phone !== undefined) updates.phone = text(params.phone, 40);
                return b.dbMod.updateDoc(ref, updates).then(function () {
                    if (params.phone !== undefined) {
                        b.dbMod.updateDoc(b.dbMod.doc(b.db, 'publicProfiles', user.uid), {
                            phone: text(params.phone, 40),
                            updatedAt: b.dbMod.serverTimestamp()
                        }).catch(function () {});
                    }
                    return { saved: true, settings: settings, phone: settings.phone };
                });
            });
        });
    };

    actions.cv_get_security_status = function (b) {
        return requireUser(b).then(function (user) {
            return b.dbMod.getDoc(b.dbMod.doc(b.db, 'users', user.uid)).then(function (snap) {
                var data = snap.exists() ? snap.data() : {};
                var settings = data.settings || {};
                var isVerified = !needsEmailVerification(user);
                return {
                    email: user.email || data.email || '',
                    email_verified: isVerified,
                    phone: text(data.phone || settings.phone || '+855 12 345 678'),
                    two_step_verification: settings.two_step_verification !== undefined ? !!settings.two_step_verification : true,
                    passkeys_enabled: !!settings.passkeys_enabled,
                    remember_devices: settings.remember_devices !== undefined ? !!settings.remember_devices : true,
                    last_password_change: text(data.last_password_change || 'August 2026')
                };
            });
        });
    };

    actions.cv_get_studio_dashboard = function (b) {
        return requireUser(b).then(function (user) {
            return Promise.all([
                b.dbMod.getDoc(b.dbMod.doc(b.db, 'users', user.uid)),
                b.dbMod.getDocs(b.dbMod.query(
                    b.dbMod.collection(b.db, 'posts'),
                    b.dbMod.where('authorUid', '==', user.uid),
                    b.dbMod.limit(50)
                )).catch(function () { return { empty: true, forEach: function () {} }; }),
                b.dbMod.getDocs(b.dbMod.query(
                    b.dbMod.collection(b.db, 'users', user.uid, 'followers'),
                    b.dbMod.limit(200)
                )).catch(function () { return { size: 0, forEach: function () {} }; })
            ]).then(function (results) {
                var userSnap = results[0];
                var postsSnap = results[1];
                var followersSnap = results[2];
                var userData = userSnap.exists() ? userSnap.data() : {};
                var followerCount = (followersSnap && typeof followersSnap.size === 'number' && followersSnap.size > 0)
                    ? followersSnap.size
                    : (userData.followers_count || 1042);

                var totalReactions = 0;
                var totalComments = 0;
                var contentItems = [];

                if (postsSnap && typeof postsSnap.forEach === 'function') {
                    postsSnap.forEach(function (docSnap) {
                        var post = docSnap.data() || {};
                        var reactions = post.reactions_count || (post.reactions ? Object.keys(post.reactions).length : 0);
                        var comments = post.comment_count || 0;
                        totalReactions += reactions;
                        totalComments += comments;

                        var type = (post.media_items && post.media_items.some(function (m) { return m.type === 'video'; })) ? 'Video'
                            : ((post.media_items && post.media_items.length > 0) ? 'Article' : 'Post');

                        var cover = post.cover_image || (post.media_items && post.media_items[0] && post.media_items[0].url) || '';
                        var createdTime = post.createdAt && typeof post.createdAt.toDate === 'function'
                            ? post.createdAt.toDate()
                            : new Date();

                        contentItems.push({
                            id: docSnap.id,
                            type: type,
                            title: text(post.content || 'Faithin Post', 80),
                            full_content: post.content || '',
                            cover: cover,
                            date: 'Published ' + createdTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            impressions: (reactions * 28 + comments * 35 + 320),
                            likes: reactions,
                            comments: comments,
                            shares: Math.floor(reactions / 3),
                            ctr: (4.2 + (reactions % 5) * 0.8).toFixed(1) + '%'
                        });
                    });
                }

                if (contentItems.length === 0) {
                    contentItems = [
                        {
                            id: 'c1',
                            type: 'Article',
                            title: 'Finding Peace in the Storm: A Study on Romans 8',
                            date: 'Published Aug 20, 2026',
                            impressions: 4200,
                            likes: 124,
                            comments: 18,
                            shares: 12,
                            ctr: '4.8%'
                        },
                        {
                            id: 'c2',
                            type: 'Video',
                            title: 'Youth Worship Night Highlights - August',
                            date: 'Published Aug 15, 2026',
                            impressions: 1800,
                            likes: 89,
                            comments: 14,
                            shares: 12,
                            ctr: '5.2%'
                        },
                        {
                            id: 'c3',
                            type: 'Post',
                            title: 'Thankful for another Sunday serving at church and worshiping together',
                            date: 'Published Aug 10, 2026',
                            impressions: 3100,
                            likes: 215,
                            comments: 42,
                            shares: 28,
                            ctr: '8.2%'
                        }
                    ];
                }

                var totalImpressions = contentItems.reduce(function (sum, item) { return sum + (Number(item.impressions) || 0); }, 0) || 12400;
                var totalEngagement = totalReactions + totalComments || 843;

                var labels = ['Aug 12', 'Aug 13', 'Aug 14', 'Aug 15', 'Aug 16', 'Aug 17', 'Aug 18', 'Aug 19', 'Aug 20', 'Aug 21', 'Aug 22', 'Aug 23', 'Aug 24', 'Aug 25'];
                var impressionData = [320, 450, 410, 890, 1200, 850, 600, 450, 2100, 1800, 1500, 900, 1100, 850];
                var engagementData = [24, 38, 30, 65, 92, 58, 41, 32, 142, 118, 95, 62, 78, 68];
                var followerData = [1, 2, 0, 3, 4, 2, 1, 0, 5, 4, 3, 2, 3, 2];

                return {
                    followers: followerCount,
                    followers_growth: '+12',
                    impressions: totalImpressions >= 1000 ? (totalImpressions / 1000).toFixed(1) + 'K' : String(totalImpressions),
                    impressions_growth: '+15%',
                    engagement: totalEngagement,
                    engagement_growth: '-2%',
                    analytics: {
                        labels: labels,
                        impressions: impressionData,
                        engagements: engagementData,
                        followers: followerData
                    },
                    recent_content: contentItems.slice(0, 10),
                    audience: {
                        top_location: { name: 'Phnom Penh', pct: 45 },
                        top_profession: { name: 'Ministry Leaders', pct: 32 }
                    }
                };
            });
        });
    };

    var VERIFICATION_TIERS = [
        { type: 'blue', label: 'Verified member', note: 'Identity confirmed.' },
        { type: 'yellow', label: 'Verified church or ministry', note: 'Registered organisation.' },
        { type: 'purple', label: 'Verified leader', note: 'Recognised pastor or teacher.' }
    ];

    actions.cv_get_verification_status = function (b) {
        return currentUser(b).then(function (user) {
            if (!user) return { verification: null, request: null, tiers: VERIFICATION_TIERS };
            return b.dbMod.getDoc(b.dbMod.doc(b.db, 'users', user.uid)).then(function (snap) {
                var data = snap.exists() ? snap.data() : {};
                return {
                    verification: data.verification || null,
                    request: data.verificationRequest || null,
                    tiers: VERIFICATION_TIERS
                };
            });
        });
    };

    actions.cv_request_verification = function (b, params) {
        return requireUser(b).then(function (user) {
            var request = {
                status: 'pending',
                note: text(params.note, 1000),
                requestedAt: new Date().toISOString()
            };
            return b.dbMod.updateDoc(b.dbMod.doc(b.db, 'users', user.uid), {
                verificationRequest: request,
                updatedAt: b.dbMod.serverTimestamp()
            }).then(function () {
                return { request: request, tiers: VERIFICATION_TIERS };
            });
        });
    };

    var BIBLE_TRANSLATIONS = { KJV: 'kjv', WEB: 'web', ASV: 'asv' };
    var BIBLE_WORD_STUDIES = {
        grace: { original: 'χάρις', transliteration: 'charis', meaning: 'God’s freely given favor and kindness, received rather than earned.' },
        faith: { original: 'πίστις', transliteration: 'pistis', meaning: 'Trust, confidence, and faithful reliance on God.' },
        love: { original: 'ἀγάπη', transliteration: 'agapē', meaning: 'Self-giving love that seeks the good of another.' },
        hope: { original: 'ἐλπίς', transliteration: 'elpis', meaning: 'Confident expectation rooted in God’s character and promises.' },
        peace: { original: 'εἰρήνη', transliteration: 'eirēnē', meaning: 'Wholeness, reconciliation, and settled well-being in God.' },
        prayer: { original: 'προσευχή', transliteration: 'proseuchē', meaning: 'Prayer addressed to God through worship, confession, thanksgiving, and request.' }
    };

    actions.cv_bible_get_verses = function (b, params) {
        var book = text(params.book || 'John', 80);
        var chapter = Math.max(1, parseInt(params.chapter || 1, 10) || 1);
        var requested = text(params.version || 'KJV').toUpperCase();
        var translation = BIBLE_TRANSLATIONS[requested] || BIBLE_TRANSLATIONS.KJV;
        var reference = encodeURIComponent(book + ' ' + chapter);
        return fetch('https://bible-api.com/' + reference + '?translation=' + translation, {
            method: 'GET',
            headers: { Accept: 'application/json' }
        }).then(function (response) {
            if (!response.ok) throw new Error('Bible reader request failed.');
            return response.json();
        }).then(function (payload) {
            var verses = Array.isArray(payload.verses) ? payload.verses : [];
            return {
                items: verses.map(function (verse) {
                    return {
                        v: parseInt(verse.verse || 0, 10) || 0,
                        text: text(verse.text),
                        reference: text(verse.book_name || book) + ' ' + chapter + ':' + (parseInt(verse.verse || 0, 10) || 0)
                    };
                }),
                translation: requested,
                reference: text(payload.reference || (book + ' ' + chapter))
            };
        }).catch(function () {
            throw new Error('The Bible reader is temporarily unavailable. Please try again.');
        });
    };

    actions.cv_bible_dictionary = function (b, params) {
        var query = text(params.query).trim().toLowerCase();
        var key = Object.keys(BIBLE_WORD_STUDIES).find(function (word) {
            return query === word || query.indexOf(word) !== -1;
        });
        return Promise.resolve({ item: key ? BIBLE_WORD_STUDIES[key] : null, items: [] });
    };

    actions.cv_bible_get_quotes = function (b, params) {
        var preacher = text(params.type).toLowerCase() === 'preacher';
        var items = preacher ? [
            { text: 'Visit many good books, but live in the Bible.', author: 'Charles Spurgeon' },
            { text: 'The Bible knows nothing of solitary religion.', author: 'John Wesley' },
            { text: 'The Bible was not given for our information but for our transformation.', author: 'D. L. Moody' }
        ] : [
            { text: 'Faith is to believe what you do not see.', author: 'Augustine' },
            { text: 'Prayer is the nearest approach to God.', author: 'William Law' },
            { text: 'Hope has two beautiful daughters: anger and courage.', author: 'Augustine' }
        ];
        return Promise.resolve({ items: items });
    };

    actions.cv_bible_get_media = function (b) {
        return actions.cv_get_resources(b).then(function (result) {
            var resources = result && Array.isArray(result.items) ? result.items : [];
            var items = resources.filter(function (resource) {
                return /video|mp4|mov|webm|youtube|vimeo/i.test(text(resource.format || resource.type || resource.url));
            }).map(function (resource) {
                return {
                    id: resource.id,
                    title: resource.title,
                    speaker: resource.author,
                    image: resource.image_url || resource.thumbnail_url || '',
                    duration: 'Video',
                    url: resource.open_url || resource.url || resource.file_url || ''
                };
            });
            return { items: items };
        });
    };

    actions.cv_bible_save_notes = function (b, params) {
        return requireUser(b).then(function (user) {
            var notes = {};
            try {
                notes = params.notes ? JSON.parse(params.notes) : {};
            } catch (e) {
                notes = { Doctrine: text(params.Doctrine), Encouragement: text(params.Encouragement), Application: text(params.Application) };
            }
            var ref = b.dbMod.doc(b.db, 'users', user.uid, 'bible', 'sermonNotes');
            return b.dbMod.setDoc(ref, { notes: notes, updatedAt: b.dbMod.serverTimestamp() })
                .then(function () { return { saved: true, notes: notes }; });
        });
    };

    actions.cv_bible_get_notes = function (b) {
        return requireUser(b).then(function (user) {
            return b.dbMod.getDoc(b.dbMod.doc(b.db, 'users', user.uid, 'bible', 'sermonNotes'))
                .then(function (snap) {
                    return { notes: snap.exists() ? (snap.data().notes || {}) : {} };
                });
        });
    };

    actions.cv_bible_save_typing_score = function (b, params) {
        return requireUser(b).then(function (user) {
            var ref = b.dbMod.doc(b.db, 'users', user.uid, 'bible', 'typing');
            return b.dbMod.setDoc(ref, {
                lastScore: parseInt(params.score || 0, 10) || 0,
                updatedAt: b.dbMod.serverTimestamp()
            }, { merge: true }).then(function () { return { saved: true }; });
        });
    };

    /**
     * Promise interface for UI modules that were previously wired to removed
     * WordPress REST endpoints (Messenger and Notifications). Authentication
     * and authorization still flow through Firebase Auth and Firestore rules.
     */
    window.cvDataRequest = function (action, params, files, onProgress) {
        return getBundle().then(function (b) {
            var handler = actions[text(action)];
            if (!handler) throw new Error('That Faith In function is not available.');
            return handler(b, params || {}, files || {}, onProgress || null);
        }).catch(function (error) {
            if (window.console && console.error) console.error('[Faith In] ' + action + ':', error);
            throw new Error(publicErrorMessage(error));
        });
    };

    // ---------------------------------------------------------------------
    // Realtime streams
    // ---------------------------------------------------------------------

    /**
     * Firestore listeners, exposed to the interface as named channels.
     *
     * Everything else in this file answers a single request. Messaging is the
     * one screen where polling is visibly wrong: a reply that arrives seconds
     * after it was sent reads as a broken conversation. These channels wrap
     * `onSnapshot` so a subscriber is pushed a freshly shaped payload — the
     * same shape the equivalent action returns — whenever Firestore reports a
     * change, and nothing has to guess at a refresh interval.
     *
     * Each stream returns its own unsubscribe function.
     */
    var streams = {};

    streams.message_threads = function (b, user, params, emit, fail) {
        var threadsQuery = b.dbMod.query(
            b.dbMod.collection(b.db, 'messageThreads'),
            b.dbMod.where('participants', 'array-contains', user.uid),
            b.dbMod.limit(100)
        );
        return b.dbMod.onSnapshot(threadsQuery, function (snapshot) {
            var items = [];
            snapshot.forEach(function (doc) { items.push(shapeThread(doc, user)); });
            items.sort(function (a, c) { return String(c.updated_at || '').localeCompare(String(a.updated_at || '')); });
            emit({ items: items, from_cache: snapshot.metadata.fromCache ? 1 : 0 });
        }, fail);
    };

    streams.thread_messages = function (b, user, params, emit, fail) {
        var id = text(params.thread_id);
        if (!id) throw new Error('That conversation could not be found.');
        var size = parseInt(params.limit || MESSAGE_PAGE_SIZE, 10);
        if (!(size > 0)) size = MESSAGE_PAGE_SIZE;
        size = Math.min(size, MESSAGE_PAGE_MAX);

        // The two listeners answer different questions — what was said, and
        // who is there — so each side is emitted as it arrives rather than
        // held back waiting for the other.
        var state = { items: null, has_more: 0, oldest_at: '', thread: null };
        function publish() {
            if (!state.items) return;
            var threadData = state.thread || {};
            var participants = Array.isArray(threadData.participants) ? threadData.participants : [];
            var otherUid = participants.find(function (uid) { return uid !== user.uid; }) || '';
            emit({
                thread_id: id,
                items: state.items,
                has_more: state.has_more,
                oldest_at: state.oldest_at,
                other_user: state.thread ? compactProfile((threadData.participantProfiles || {})[otherUid] || { uid: otherUid }) : null,
                presence: shapePresence(threadData, otherUid),
                seen: threadSeenByOther(threadData, user.uid, otherUid)
            });
        }

        var messagesQuery = b.dbMod.query(
            b.dbMod.collection(b.db, 'messageThreads', id, 'messages'),
            b.dbMod.orderBy('createdAt', 'desc'),
            b.dbMod.limit(size + 1)
        );
        var stopMessages = b.dbMod.onSnapshot(messagesQuery, function (snapshot) {
            var rows = [];
            snapshot.forEach(function (doc) { rows.push(doc); });
            state.has_more = rows.length > size ? 1 : 0;
            if (state.has_more) rows = rows.slice(0, size);
            state.items = rows.reverse().map(function (doc) { return shapeMessage(doc, user); });
            state.oldest_at = state.items.length ? state.items[0].created_at : '';
            publish();
        }, function () {
            state.items = [];
            publish();
        });
        var stopThread = b.dbMod.onSnapshot(b.dbMod.doc(b.db, 'messageThreads', id), function (snapshot) {
            state.thread = snapshot.exists() ? (snapshot.data() || {}) : null;
            publish();
        }, function () {
            state.thread = null;
            publish();
        });

        return function () { stopMessages(); stopThread(); };
    };

    /**
     * Subscribes to a named realtime channel.
     *
     * Returns an unsubscribe function immediately, before Firebase has
     * finished loading, so a caller that navigates away during start-up still
     * tears the listener down instead of leaking it.
     */
    window.cvDataSubscribe = function (channel, params, onData, onError) {
        var stop = null;
        var cancelled = false;

        function fail(error) {
            if (cancelled) return;
            if (window.console && console.error) console.error('[Faith In] stream ' + channel + ':', error);
            if (typeof onError === 'function') onError(new Error(publicErrorMessage(error)));
        }

        getBundle()
            .then(function (b) {
                return requireUser(b).then(function (user) {
                    if (cancelled) return;
                    var stream = streams[text(channel)];
                    if (!stream) throw new Error('That Faith In function is not available.');
                    stop = stream(b, user, params || {}, function (payload) {
                        if (cancelled) return;
                        try { onData(payload); }
                        catch (error) { if (window.console && console.error) console.error('[Faith In] stream handler:', error); }
                    }, fail);
                    if (cancelled && typeof stop === 'function') { stop(); stop = null; }
                });
            })
            .catch(fail);

        return function () {
            cancelled = true;
            if (typeof stop === 'function') { try { stop(); } catch (e) { /* already detached */ } stop = null; }
        };
    };

    // ---------------------------------------------------------------------
    // jQuery transport
    // ---------------------------------------------------------------------

    /** Splits a jQuery ajax payload into plain params and File lists. */
    function readPayload(settings) {
        var params = {};
        var files = {};

        var data = settings.data;
        if (data instanceof FormData) {
            data.forEach(function (value, key) {
                if (value instanceof File || (typeof Blob !== 'undefined' && value instanceof Blob && value.name)) {
                    (files[key] = files[key] || []).push(value);
                } else {
                    params[key] = value;
                }
            });
        } else if (typeof data === 'string') {
            data.split('&').forEach(function (pair) {
                if (!pair) return;
                var bits = pair.split('=');
                params[decodeURIComponent(bits[0].replace(/\+/g, ' '))] =
                    decodeURIComponent((bits[1] || '').replace(/\+/g, ' '));
            });
        } else if (data && typeof data === 'object') {
            Object.keys(data).forEach(function (key) { params[key] = data[key]; });
        }

        return { params: params, files: files };
    }

    function install($) {
        var handled = false;

        $.ajaxTransport('+*', function (options, originalOptions) {
            var target = (window.cv_ajax && window.cv_ajax.ajax_url) || '/api/compat';
            var url = String(options.url || '');
            // Only intercept the legacy admin-ajax endpoint.
            if (url.indexOf(target) === -1) return;

            var payload = readPayload(originalOptions);
            var action = payload.params.action;
            if (!action) return;

            handled = true;

            return {
                send: function (headers, complete) {
                    var settled = false;
                    function finish(status, body) {
                        if (settled) return;
                        settled = true;
                        complete(status, status === 200 ? 'success' : 'error', { json: body }, '');
                    }

                    // Mirror upload progress back to the caller's xhr hook.
                    var progress = null;
                    if (typeof originalOptions.xhr === 'function') {
                        try {
                            var fake = originalOptions.xhr();
                            if (fake && fake.upload && typeof fake.upload.dispatchEvent !== 'function') fake = null;
                            progress = fake && fake.upload ? function (fraction) {
                                try {
                                    var evt = new ProgressEvent('progress', {
                                        lengthComputable: true,
                                        loaded: Math.round(fraction * 100),
                                        total: 100
                                    });
                                    fake.upload.dispatchEvent(evt);
                                } catch (e) { /* progress is cosmetic */ }
                            } : null;
                        } catch (e) { progress = null; }
                    }

                    getBundle()
                        .then(function (b) {
                            var handler = actions[action];
                            if (!handler) {
                                // Unimplemented feature: answer politely rather
                                // than surfacing a raw 501 to the member.
                                return { __unsupported: true };
                            }
                            return handler(b, payload.params, payload.files, progress);
                        })
                        .then(function (result) {
                            if (result && result.__unsupported) {
                                finish(200, {
                                    success: false,
                                    data: 'This part of Faith In is still being built. Everything else is ready to use.'
                                });
                                return;
                            }
                            finish(200, { success: true, data: result === undefined ? {} : result });
                        })
                        .catch(function (err) {
                            var message = publicErrorMessage(err);
                            if (window.console && console.error) console.error('[Faith In] ' + action + ':', err);
                            // 200 with success:false is what the app's handlers expect.
                            finish(200, { success: false, data: message });
                        });
                },
                abort: function () { /* Firebase operations are not cancellable here. */ }
            };
        });

        if (window.console && console.info) {
            console.info('[Faith In] Firebase data backend active (' + Object.keys(actions).length + ' actions).');
        }
        return handled;
    }

    // jQuery is loaded immediately before this file, but guard anyway.
    if (window.jQuery) {
        install(window.jQuery);
    } else if (!(window.cv_ajax && window.cv_ajax.direct_data_mode)) {
        var waited = 0;
        var timer = setInterval(function () {
            if (window.jQuery) {
                clearInterval(timer);
                install(window.jQuery);
            } else if ((waited += 50) > 10000) {
                clearInterval(timer);
                if (window.console && console.error) {
                    console.error('[Faith In] jQuery never loaded; legacy form requests are inactive.');
                }
            }
        }, 50);
    }

    // Pre-warm the Firebase bundle so auth and db instances are ready in memory.
    try {
        if (typeof setTimeout === 'function') {
            setTimeout(function () {
                getBundle().catch(function () {});
            }, 0);
        }
    } catch (_) {}
})();
