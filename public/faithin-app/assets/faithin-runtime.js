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

window.FIData = {
  request(action, params, files, onProgress) {
    if (typeof window.cvDataRequest !== 'function') {
      return Promise.reject(new Error('Faith In is still connecting. Please refresh and try again.'));
    }
    const uploads = files && Object.values(files).some(list => list && list.length);
    const wait = action === 'cv_get_session' ? 12000 : (uploads ? 120000 : 20000);
    const operation = window.cvDataRequest(action, params || {}, files || {}, onProgress || null);
    let timer;
    const deadline = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Faith In took too long to respond. Please try again.')), wait); });
    return Promise.race([operation, deadline]).finally(() => clearTimeout(timer));
  },
  session() { return this.request('cv_get_session'); },
  initials(name) {
    return String(name || 'Faith In Member').split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'FI';
  }
};
