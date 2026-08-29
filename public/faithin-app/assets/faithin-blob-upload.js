/* Faith In — authenticated resumable uploads to Firebase Cloud Storage. */
(() => {
  'use strict';

  const SDK = '10.14.1';
  let bundlePromise;

  function config() {
    return window.cv_ajax?.auth?.firebase_config || null;
  }

  function safeName(name) {
    return String(name || 'upload')
      .replace(/[^\w.\-]+/g, '_')
      .slice(-80);
  }

  function mediaType(mime) {
    const value = String(mime || '');
    if (value.startsWith('image/')) return 'image';
    if (value.startsWith('video/')) return 'video';
    if (value.startsWith('audio/')) return 'audio';
    return 'file';
  }

  function uidFromToken(token) {
    const payload = String(token || '').split('.')[1];
    if (!payload) throw new Error('Your session could not be verified. Please log in again.');
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
    const decoded = JSON.parse(atob(padded));
    if (!decoded.sub || typeof decoded.sub !== 'string') {
      throw new Error('Your session could not be verified. Please log in again.');
    }
    return decoded.sub;
  }

  async function bundle() {
    if (bundlePromise) return bundlePromise;
    const firebaseConfig = config();
    if (!firebaseConfig?.apiKey || !firebaseConfig?.projectId || !firebaseConfig?.storageBucket) {
      throw new Error('Firebase Storage is not configured yet. Please try again shortly.');
    }
    bundlePromise = Promise.all([
      import('https://www.gstatic.com/firebasejs/' + SDK + '/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/' + SDK + '/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/' + SDK + '/firebase-storage.js')
    ]).then(([appMod, authMod, storageMod]) => {
      const name = 'faith-in-auth';
      const app = appMod.getApps().find(candidate => candidate.name === name)
        || appMod.initializeApp(firebaseConfig, name);
      return {
        auth: authMod.getAuth(app),
        authMod,
        storage: storageMod.getStorage(app),
        storageMod
      };
    });
    bundlePromise.catch(() => { bundlePromise = null; });
    return bundlePromise;
  }

  function settledUser(auth, authMod) {
    if (auth.currentUser) return Promise.resolve(auth.currentUser);
    return new Promise(resolve => {
      let finished = false;
      const finish = user => {
        if (finished) return;
        finished = true;
        resolve(user || null);
      };
      const stop = authMod.onAuthStateChanged(auth, user => {
        stop();
        finish(user);
      });
      setTimeout(() => finish(auth.currentUser), 8000);
    });
  }

  window.cvBlobUpload = async function uploadToFirebase(file, idToken, onProgress) {
    if (!(file instanceof File)) throw new Error('Please choose a valid file.');
    const tokenUid = uidFromToken(idToken);
    const { auth, authMod, storage, storageMod } = await bundle();
    const user = await settledUser(auth, authMod);
    if (!user || user.uid !== tokenUid) {
      throw new Error('Your session could not be verified. Please log in again.');
    }

    const unique = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
    const pathname = `faith-in-uploads/${user.uid}/${Date.now()}-${unique}-${safeName(file.name)}`;
    const objectRef = storageMod.ref(storage, pathname);
    const task = storageMod.uploadBytesResumable(objectRef, file, {
      contentType: file.type || 'application/octet-stream',
      customMetadata: { originalName: file.name || 'upload' }
    });

    const snapshot = await new Promise((resolve, reject) => {
      task.on('state_changed', state => {
        const total = Number(state.totalBytes || 0);
        onProgress?.(total > 0 ? state.bytesTransferred / total : 0);
      }, reject, () => resolve(task.snapshot));
    });

    const url = await storageMod.getDownloadURL(snapshot.ref);
    onProgress?.(1);
    return {
      url,
      local_url: url,
      preview_url: url,
      drive_url: '',
      type: mediaType(file.type),
      mime: file.type,
      name: file.name,
      size: file.size,
      path: pathname,
      storage: 'firebase'
    };
  };
})();
