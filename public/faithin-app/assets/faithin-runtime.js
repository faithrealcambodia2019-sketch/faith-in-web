/* Faith In — production runtime configuration for the new interface. */
window.cv_ajax = window.cv_ajax || {
  direct_data_mode: true,
  ajax_url: '/api/compat',
  nonce: 'firebase',
  rest_root: '/api/resources',
  rest_faithin_root: '/api/community',
  rest_nonce: 'firebase',
  asset_base_url: '/',
  auth: {
    mode: 'firebase',
    backend_mode: 'firebase',
    allowed_domain: 'faithin.co',
    site_domain: 'faithin.co',
    site_origin: 'https://faithin.co',
    firebase_config: {
      apiKey: 'AIzaSyDJNCX00QsByyUG_1293fzjXJ-LhEbA-a4',
      authDomain: 'faith-app-98a5f.firebaseapp.com',
      projectId: 'faith-app-98a5f',
      storageBucket: 'faith-app-98a5f.firebasestorage.app',
      messagingSenderId: '218141432536',
      appId: '1:218141432536:web:6aedbcc4477093135315ad',
      measurementId: 'G-RP7DL9K5BH'
    }
  }
};

(() => {
  const CACHE_PREFIX = 'faithin:data:';
  const pending = new Map();
  const memory = new Map();
  let cacheEpoch = 0;
  const readTtl = {
    cv_get_session: 10 * 60 * 1000,
    cv_get_posts: 30 * 1000,
    cv_get_jobs: 60 * 1000,
    cv_get_resources: 60 * 1000,
    cv_get_suggested_users: 60 * 1000,
    cv_get_prayers: 20 * 1000,
    cv_get_bookmarks: 30 * 1000,
    cv_get_post_comments: 15 * 1000,
    cv_social_get_followers: 60 * 1000,
    cv_social_get_following: 60 * 1000,
    cv_social_get_notifications: 20 * 1000,
    cv_social_get_notification_count: 15 * 1000,
    cv_social_get_message_threads: 15 * 1000,
    cv_social_get_message_thread: 10 * 1000,
    cv_bible_get_verses: 24 * 60 * 60 * 1000
  };

  function keyFor(action, params) { return `${CACHE_PREFIX}${action}:${JSON.stringify(params || {})}`; }
  function readRecord(key) {
    if (memory.has(key)) return memory.get(key);
    try { const value = JSON.parse(sessionStorage.getItem(key)); if (value) memory.set(key, value); return value; } catch (_) { return null; }
  }
  function writeRecord(key, value) {
    const record = { savedAt: Date.now(), value };
    memory.set(key, record);
    try { sessionStorage.setItem(key, JSON.stringify(record)); } catch (_) {}
    return value;
  }
  function clearRecords() {
    cacheEpoch += 1;
    memory.clear();
    pending.clear();
    try { Object.keys(sessionStorage).filter(key => key.startsWith(CACHE_PREFIX)).forEach(key => sessionStorage.removeItem(key)); } catch (_) {}
  }

  function requestNetwork(action, params, files, onProgress, key) {
    if (pending.has(key)) return pending.get(key);
    if (typeof window.cvDataRequest !== 'function') {
      return Promise.reject(new Error('Faith In is still connecting. Please refresh and try again.'));
    }
    const uploads = files && Object.values(files).some(list => list && list.length);
    const wait = action === 'cv_get_session' ? 8000 : (uploads ? 120000 : (readTtl[action] ? 12000 : 30000));
    const operation = window.cvDataRequest(action, params || {}, files || {}, onProgress || null);
    let timer;
    const deadline = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Faith In took too long to respond. Please try again.')), wait); });
    const result = Promise.race([operation, deadline]).finally(() => { clearTimeout(timer); if (pending.get(key) === result) pending.delete(key); });
    pending.set(key, result);
    return result;
  }

  window.FIData = {
    request(action, params, files, onProgress) {
      const values = params || {};
      const key = keyFor(action, values);
      const ttl = readTtl[action] || 0;
      const cached = ttl ? readRecord(key) : null;
      const sessionTtl = action === 'cv_get_session' && cached?.value?.logged_in === false ? 10000 : ttl;
      const fresh = cached && Date.now() - cached.savedAt < sessionTtl;

      if (fresh) {
        if (action !== 'cv_get_session') return Promise.resolve(cached.value);
        const epoch = cacheEpoch;
        requestNetwork(action, values, files, onProgress, key)
          .then(value => { if (epoch === cacheEpoch) writeRecord(key, value); })
          .catch(() => {});
        return Promise.resolve(cached.value);
      }

      // Real read data remains useful while it is refreshed. Rendering the
      // last successful response immediately avoids an empty feed whenever a
      // short TTL expires or Firestore is reconnecting.
      if (ttl && action !== 'cv_get_session' && cached && Date.now() - cached.savedAt < 24 * 60 * 60 * 1000) {
        const epoch = cacheEpoch;
        requestNetwork(action, values, files, onProgress, key)
          .then(value => { if (epoch === cacheEpoch) writeRecord(key, value); })
          .catch(() => {});
        return Promise.resolve(cached.value);
      }

      if (!ttl) clearRecords();
      const epoch = cacheEpoch;
      return requestNetwork(action, values, files, onProgress, key)
        .then(value => {
          if (ttl && epoch === cacheEpoch) writeRecord(key, value);
          if (/^cv_(google|email)_sign_/.test(action)) writeRecord(keyFor('cv_get_session', {}), value);
          if (action === 'cv_logout') clearRecords();
          return value;
        })
        .catch(error => {
          // A recent real response is safer and more useful than an empty
          // screen during a brief Firebase interruption.
          if (cached && Date.now() - cached.savedAt < 24 * 60 * 60 * 1000) return cached.value;
          throw error;
        });
    },
    session() { return this.request('cv_get_session'); },
    clearCache: clearRecords,
    initials(name) {
      return String(name || 'Faith In Member').split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'FI';
    }
  };
})();
