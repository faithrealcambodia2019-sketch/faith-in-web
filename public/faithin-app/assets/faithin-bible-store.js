/*
 * Faith In — Bible Studio store (browser client)
 * ==============================================
 *
 * One object, `window.BibleStore`, that every Bible Studio tool uses to keep
 * a member's work: sermon notes, saved Scripture cards, Scripture Memory
 * progress, typing scores, verse bookmarks, reader preferences and the
 * reading streak.
 *
 * How it behaves
 * --------------
 *  - Signed in  → writes to /api/bible/* with the member's Firebase ID token,
 *                 which persists to Supabase. A mirror copy is kept in local
 *                 storage so the page still renders instantly on next load and
 *                 keeps working offline.
 *  - Signed out → local storage only, exactly as the Studio behaved before.
 *  - Server down or migration not run yet → the route answers
 *                 `persisted: false`; the local copy is authoritative and the
 *                 member sees no error.
 *
 * Nothing here replaces an existing function. The Firestore path in
 * faith-in-backend.js is untouched and still available through
 * window.cvDataRequest.
 *
 * Load order: after faith-in-backend.js (it needs window.cvIdToken).
 */
(function () {
  'use strict';

  var LOCAL_PREFIX = 'faithin:bible:';
  var SAVE_DEBOUNCE_MS = 900;

  // -------------------------------------------------------------------------
  // Local mirror
  // -------------------------------------------------------------------------

  function readLocal(key, fallback) {
    try {
      var raw = localStorage.getItem(LOCAL_PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeLocal(key, value) {
    try {
      localStorage.setItem(LOCAL_PREFIX + key, JSON.stringify(value));
    } catch {
      /* Private browsing, or the quota is full. Not worth interrupting for. */
    }
  }

  function removeLocal(key) {
    try {
      localStorage.removeItem(LOCAL_PREFIX + key);
    } catch {}
  }

  // -------------------------------------------------------------------------
  // Transport
  // -------------------------------------------------------------------------

  function idToken() {
    if (typeof window.cvIdToken === 'function') return window.cvIdToken();
    return Promise.resolve('');
  }

  /**
   * Every response is normalised to { ok, persisted, data, reason } so callers
   * never have to tell a network failure apart from a signed-out response.
   */
  function call(path, options) {
    var settings = options || {};
    return idToken().then(function (token) {
      var headers = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;
      if (settings.body != null) headers['Content-Type'] = 'application/json';

      return fetch(path, {
        method: settings.method || 'GET',
        headers: headers,
        body: settings.body != null ? JSON.stringify(settings.body) : undefined,
        credentials: 'same-origin',
        cache: 'no-store'
      })
        .then(function (response) {
          return response.json().catch(function () { return null; });
        })
        .then(function (payload) {
          if (!payload) return { ok: false, persisted: false, data: null, reason: 'No response' };
          return {
            ok: payload.success !== false,
            persisted: payload.persisted === true,
            data: payload.data,
            reason: payload.reason || (payload.success === false ? payload.data : '')
          };
        })
        .catch(function (error) {
          return { ok: false, persisted: false, data: null, reason: (error && error.message) || 'Offline' };
        });
    });
  }

  function debounce(fn, wait) {
    var timer = null;
    var trailing = null;
    return function () {
      trailing = Array.prototype.slice.call(arguments);
      clearTimeout(timer);
      timer = setTimeout(function () {
        timer = null;
        fn.apply(null, trailing);
      }, wait);
    };
  }

  // -------------------------------------------------------------------------
  // Public store
  // -------------------------------------------------------------------------

  var signedIn = null; // null = not checked yet

  var store = {
    /** Resolves true when a member is signed in, so callers can show state. */
    isSignedIn: function () {
      if (signedIn !== null) return Promise.resolve(signedIn);
      return idToken().then(function (token) {
        signedIn = Boolean(token);
        return signedIn;
      });
    },

    // --- Sermon notes ------------------------------------------------------

    EMPTY_NOTES: { Doctrine: '', Encouragement: '', Application: '' },

    /** Local copy first so the tab renders instantly, then the server copy. */
    localNotes: function () {
      // The pre-backend key is honoured so nobody loses notes on upgrade.
      var legacy = null;
      try {
        var raw = localStorage.getItem('faithin_sermon_notes');
        legacy = raw ? JSON.parse(raw) : null;
      } catch {}
      return readLocal('notes', legacy) || { Doctrine: '', Encouragement: '', Application: '' };
    },

    loadNotes: function () {
      var local = store.localNotes();
      return call('/api/bible/notes').then(function (result) {
        if (!result.persisted || !result.data || !result.data.notes) {
          return { notes: local, persisted: false, history: [] };
        }
        var remote = result.data.notes;
        var remoteEmpty = !remote.Doctrine && !remote.Encouragement && !remote.Application;
        var localHasContent = local.Doctrine || local.Encouragement || local.Application;

        // First sign-in after the upgrade: push the local draft up rather than
        // letting an empty server row wipe work the member can see on screen.
        if (remoteEmpty && localHasContent) {
          store.saveNotes(local);
          return { notes: local, persisted: true, history: result.data.history || [] };
        }
        writeLocal('notes', remote);
        return { notes: remote, persisted: true, history: result.data.history || [] };
      });
    },

    saveNotes: function (notes, meta) {
      writeLocal('notes', notes);
      try { localStorage.setItem('faithin_sermon_notes', JSON.stringify(notes)); } catch {}
      var body = { notes: notes };
      if (meta && meta.title) body.title = meta.title;
      if (meta && meta.reference) body.reference = meta.reference;
      return call('/api/bible/notes', { method: 'POST', body: body });
    },

    archiveNotes: function (title) {
      return call('/api/bible/notes', { method: 'POST', body: { action: 'archive', title: title || '' } })
        .then(function (result) {
          if (result.persisted) {
            writeLocal('notes', { Doctrine: '', Encouragement: '', Application: '' });
          }
          return result;
        });
    },

    listNoteHistory: function () {
      return call('/api/bible/notes?history=1').then(function (result) {
        return (result.data && result.data.history) || [];
      });
    },

    deleteNote: function (id) {
      return call('/api/bible/notes?id=' + encodeURIComponent(id), { method: 'DELETE' });
    },

    // --- Saved Scripture cards --------------------------------------------

    listCards: function () {
      return call('/api/bible/cards').then(function (result) {
        var cards = (result.data && result.data.cards) || [];
        if (result.persisted) writeLocal('cards', cards);
        else cards = readLocal('cards', []);
        return { cards: cards, persisted: result.persisted, reason: result.reason };
      });
    },

    saveCard: function (card) {
      return call('/api/bible/cards', { method: 'POST', body: card }).then(function (result) {
        if (!result.persisted) {
          // Keep it locally so a signed-out member does not lose the design.
          var cards = readLocal('cards', []);
          cards.unshift({
            id: 'local-' + Date.now(),
            title: card.title || 'Scripture card',
            reference: card.reference || '',
            aspectRatio: card.aspectRatio || '1:1',
            design: card.design || {},
            thumbnailUrl: '',
            updatedAt: new Date().toISOString(),
            local: true
          });
          writeLocal('cards', cards.slice(0, 60));
        }
        return result;
      });
    },

    deleteCard: function (id) {
      if (String(id).indexOf('local-') === 0) {
        writeLocal('cards', readLocal('cards', []).filter(function (card) { return card.id !== id; }));
        return Promise.resolve({ ok: true, persisted: false });
      }
      return call('/api/bible/cards?id=' + encodeURIComponent(id), { method: 'DELETE' });
    },

    // --- Scripture Memory progress ----------------------------------------

    loadMemoryProgress: function () {
      return call('/api/bible/memory/progress').then(function (result) {
        var progress = (result.data && result.data.progress) || [];
        if (result.persisted) writeLocal('memory', progress);
        else progress = readLocal('memory', []);
        return {
          progress: progress,
          summary: (result.data && result.data.summary) || null,
          persisted: result.persisted
        };
      });
    },

    saveMemoryProgress: function (entry) {
      var local = readLocal('memory', []).filter(function (item) {
        return item.passageId !== entry.passageId;
      });
      local.unshift(Object.assign({ lastReviewAt: new Date().toISOString() }, entry));
      writeLocal('memory', local.slice(0, 200));
      return call('/api/bible/memory/progress', { method: 'POST', body: entry });
    },

    // --- Typing scores -----------------------------------------------------

    loadTypingScores: function () {
      return call('/api/bible/typing').then(function (result) {
        var scores = (result.data && result.data.scores) || [];
        if (result.persisted) writeLocal('typing', scores);
        else scores = readLocal('typing', []);
        return { scores: scores, bestWpm: bestOf(scores), persisted: result.persisted };
      });
    },

    saveTypingScore: function (score) {
      var scores = readLocal('typing', []);
      scores.unshift(Object.assign({ createdAt: new Date().toISOString() }, score));
      writeLocal('typing', scores.slice(0, 50));
      return call('/api/bible/typing', { method: 'POST', body: score });
    },

    // --- Bookmarks ---------------------------------------------------------

    loadBookmarks: function () {
      return call('/api/bible/bookmarks').then(function (result) {
        var bookmarks = (result.data && result.data.bookmarks) || [];
        if (result.persisted) writeLocal('bookmarks', bookmarks);
        else bookmarks = readLocal('bookmarks', []);
        return { bookmarks: bookmarks, persisted: result.persisted };
      });
    },

    saveBookmark: function (bookmark) {
      var list = readLocal('bookmarks', []).filter(function (item) {
        return !(item.book === bookmark.book && item.chapter === bookmark.chapter && item.verse === bookmark.verse);
      });
      list.unshift(Object.assign({ createdAt: new Date().toISOString() }, bookmark));
      writeLocal('bookmarks', list.slice(0, 200));
      return call('/api/bible/bookmarks', { method: 'POST', body: bookmark });
    },

    deleteBookmark: function (bookmark) {
      writeLocal('bookmarks', readLocal('bookmarks', []).filter(function (item) {
        if (bookmark.id) return item.id !== bookmark.id;
        return !(item.book === bookmark.book && item.chapter === bookmark.chapter && item.verse === bookmark.verse);
      }));
      var query = Object.keys(bookmark)
        .filter(function (key) { return bookmark[key] !== undefined && bookmark[key] !== ''; })
        .map(function (key) { return key + '=' + encodeURIComponent(bookmark[key]); })
        .join('&');
      return call('/api/bible/bookmarks?' + query, { method: 'DELETE' });
    },

    // --- Preferences -------------------------------------------------------

    localPreferences: function () {
      return readLocal('preferences', null);
    },

    loadPreferences: function () {
      return call('/api/bible/preferences').then(function (result) {
        var preferences = result.data && result.data.preferences;
        if (result.persisted && preferences) {
          writeLocal('preferences', preferences);
          return { preferences: preferences, persisted: true };
        }
        return { preferences: readLocal('preferences', null), persisted: false };
      });
    },

    savePreferences: debounce(function (preferences) {
      writeLocal('preferences', preferences);
      call('/api/bible/preferences', { method: 'POST', body: preferences });
    }, SAVE_DEBOUNCE_MS),

    // --- Reading streak ----------------------------------------------------

    recordReading: function (entry) {
      return call('/api/bible/progress', { method: 'POST', body: entry });
    },

    loadProgress: function () {
      return call('/api/bible/progress').then(function (result) {
        return result.data || { streak: 0, chaptersRead: 0, recent: [] };
      });
    },

    // --- Whole-studio hydration -------------------------------------------

    loadStudio: function () {
      return call('/api/bible/studio').then(function (result) {
        return { studio: result.data, persisted: result.persisted, reason: result.reason };
      });
    },

    /** Exposed so tools can clear a member's local mirror on sign-out. */
    clearLocal: function () {
      ['notes', 'cards', 'memory', 'typing', 'bookmarks', 'preferences'].forEach(removeLocal);
      signedIn = null;
    }
  };

  function bestOf(scores) {
    return scores.reduce(function (best, score) { return Math.max(best, score.wpm || 0); }, 0);
  }

  /*
   * A debounced preference save must still land when the member leaves.
   * visibilitychange fires while the page can still run async work, which
   * sendBeacon could not help with here — a beacon cannot carry the
   * Authorization header, so the server would read it as a signed-out call.
   */
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'hidden') return;
    var preferences = readLocal('preferences', null);
    if (!preferences) return;
    call('/api/bible/preferences', { method: 'POST', body: preferences });
  });

  window.BibleStore = store;
})();
