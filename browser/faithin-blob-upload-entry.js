import { upload } from '@vercel/blob/client';

function safeName(name) {
  return (name || 'upload').replace(/[^\w.\-]+/g, '_').slice(-80);
}

function kindOf(type) {
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  return 'file';
}

function memberUid(idToken) {
  const encoded = String(idToken || '').split('.')[1];
  if (!encoded) throw new Error('Your session could not be verified. Please log in again.');
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  const payload = JSON.parse(atob(padded));
  if (!payload.sub || typeof payload.sub !== 'string') {
    throw new Error('Your session could not be verified. Please log in again.');
  }
  return payload.sub;
}

window.cvBlobUpload = async function cvBlobUpload(file, idToken, onProgress) {
  const uid = memberUid(idToken);
  const blob = await upload(`faith-in/${uid}/${safeName(file.name)}`, file, {
    access: 'public',
    handleUploadUrl: '/api/upload',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'x-faith-in-blob-token-request': '1',
    },
    contentType: file.type,
    multipart: file.size > 100 * 1024 * 1024,
    onUploadProgress: ({ percentage }) => onProgress?.(percentage / 100),
  });

  onProgress?.(1);
  return {
    url: blob.url,
    local_url: blob.url,
    preview_url: blob.url,
    drive_url: '',
    type: kindOf(file.type),
    mime: file.type,
    name: file.name,
    size: file.size,
    path: blob.pathname,
  };
};
