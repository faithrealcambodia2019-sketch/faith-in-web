/* Faith In — live home feed, composers, prayers, members and engagement. */
(() => {
  'use strict';
  const { $, $$, esc, toast, closeModal } = window.FI;
  const api = window.FIData;
  const feed = $('#posts');
  const needUser = () => window.FILive.requireUser();
  let loadedPosts = [], feedQuery = '', sortMode = 'Top', followingIds = new Set();

  function busy(button, active, label) {
    if (!button) return;
    if (active) { button.dataset.oldLabel = button.innerHTML; button.disabled = true; button.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>${label}`; }
    else { button.disabled = false; button.innerHTML = button.dataset.oldLabel || label; }
  }

  function mediaHTML(post) {
    const media = Array.isArray(post.media_items) ? post.media_items : [];
    const items = media.length ? media : (post.cover_image_url ? [{ type: 'image', url: post.cover_image_url }] : []);
    if (!items.length) return '';
    return `<div class="border-y border-line bg-raised grid gap-1 ${items.length > 1 ? 'grid-cols-2' : ''}" data-media>${items.slice(0, 4).map(item => {
      const url = esc(item.url || item.preview_url || item.local_url || '');
      // preload="none": with metadata preloading, every feed render opened a
      // range request against Blob for every video on the page, and a video
      // whose blob is failing gets retried by the browser over and over. Wait
      // for an actual play. Use a poster when the item carries one.
      if (item.type === 'video') {
        const poster = esc(item.thumbnail_url || item.poster_url || '');
        return `<video class="fi-feed-video" controls playsinline preload="none"${poster ? ` poster="${poster}"` : ''} src="${url}"></video>`;
      }
      if (item.type === 'audio') return `<div class="p-5"><audio class="w-full" controls src="${url}"></audio></div>`;
      return `<img class="w-full max-h-[620px] object-cover" src="${url}" alt="Shared media" loading="lazy" decoding="async">`;
    }).join('')}</div>`;
  }

  // When media fails to load — a blocked or over-quota Blob store answers 403,
  // a deleted file 404 — the browser's own fallback is a broken-image glyph or
  // a dead black player, which reads as "the site is broken". Swap in a calm
  // placeholder instead. error does not bubble, so listen in the capture phase.
  function mediaFallback(kind) {
    const node = document.createElement('div');
    node.className = 'grid place-items-center p-8 text-center text-muted text-[13px] bg-raised';
    node.setAttribute('data-media-failed', kind);
    // Only icons that ship in Font Awesome 6 Free — image-slash is Pro, and a
    // missing glyph would render as the same empty box this is meant to avoid.
    const icon = kind === 'video' ? 'fa-video' : 'fa-image';
    node.innerHTML = `<span><i class="fa-solid ${icon} text-[20px] block mb-2 text-faint"></i>${kind === 'video' ? 'This video' : 'This image'} couldn’t be loaded.</span>`;
    return node;
  }

  feed?.addEventListener('error', event => {
    const el = event.target;
    if (!el || !el.tagName) return;
    const tag = el.tagName.toLowerCase();
    if (tag !== 'img' && tag !== 'video') return;
    if (!el.closest('[data-media]')) return;
    if (el.dataset.mediaFailed) return;
    el.dataset.mediaFailed = '1';
    el.replaceWith(mediaFallback(tag === 'video' ? 'video' : 'image'));
  }, true);

  function postHTML(post) {
    const author = post.author || { name: post.author_name || 'Faith In Member', uid: post.author_uid || '' };
    const name = author.name || author.displayName || 'Faith In Member';
    const current = window.FILive.user;
    const avatar = author.uid && author.uid === current?.uid ? (current.avatar_url || current.avatar || current.photo_url || author.avatar_url || author.avatar || '') : (author.avatar_url || author.avatar || '');
    const reacted = !!(post.user_reaction || post.current_user_reaction);
    const saved = !!post.bookmarked;
    const owner = !!post.can_delete;
    const body = post.content || post.excerpt || post.article_excerpt || '';
    return `<article class="card overflow-hidden animate-fade-up" data-post-id="${esc(post.id)}" data-author-uid="${esc(author.uid || '')}">
      <header class="flex items-start gap-3 p-4 pb-2.5">
        ${avatar ? `<img class="avatar w-11 h-11 object-cover" src="${esc(avatar)}" alt="${esc(name)}">` : `<span class="avatar w-11 h-11 text-[14px]">${esc(api.initials(name))}</span>`}
        <div class="min-w-0 flex-1"><div class="flex items-center gap-2 flex-wrap"><a href="/profile?uid=${encodeURIComponent(author.uid || '')}" class="text-[14.5px] font-semibold hover:text-brand">${esc(name)}</a>${post.type && post.type !== 'post' ? `<span class="text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-soft text-brand-strong">${esc(post.type)}</span>` : ''}</div><p class="text-[12px] text-muted mt-0.5">${esc(post.time || 'just now')} · ${esc(post.visibility || 'Public')}</p></div>
        ${!owner && author.uid ? `<button class="btn btn-outline !py-1 !px-3 !text-[13px]" data-live-follow><i class="fa-solid fa-plus text-[11px]"></i>Follow</button>` : ''}
        ${owner ? `<button class="icon-btn" data-live-delete aria-label="Delete post"><i class="fa-regular fa-trash-can"></i></button>` : ''}
      </header>
      ${post.article_title ? `<div class="px-4 pt-1"><h3 class="font-serif text-[22px] font-semibold">${esc(post.article_title)}</h3></div>` : ''}
      ${body ? `<div class="px-4 pb-3"><p class="text-[14.5px] leading-relaxed whitespace-pre-wrap">${esc(body)}</p></div>` : ''}
      ${mediaHTML(post)}
      <div class="px-4 py-2 flex items-center justify-between text-[12px] text-muted border-b border-line"><span class="flex items-center gap-1.5"><span class="w-[18px] h-[18px] rounded-full bg-brand text-white grid place-items-center text-[9px]"><i class="fa-solid fa-hands-praying"></i></span><span data-likecount>${Number(post.reaction_count || 0)}</span></span><span class="flex gap-3"><button type="button" data-comment-toggle>${Number(post.comment_count || 0)} comments</button><span data-sharecount>${Number(post.share_count || 0)} shares</span></span></div>
      <div class="flex items-center gap-1 px-2 py-1"><button type="button" class="action-btn ${reacted ? '!text-brand' : ''}" data-live-like aria-pressed="${reacted}"><i class="fa-solid fa-hands-praying"></i>Amen</button><button type="button" class="action-btn" data-comment-toggle><i class="fa-regular fa-comment"></i>Comment</button><button type="button" class="action-btn" data-live-share><i class="fa-solid fa-share-nodes"></i>Share</button><button type="button" class="action-btn ${saved ? '!text-brand' : ''}" data-live-save aria-pressed="${saved}"><i class="fa-${saved ? 'solid' : 'regular'} fa-bookmark"></i><span class="hidden sm:inline">Save</span></button></div>
      <div class="hidden border-t border-line p-3.5" data-comments><div class="space-y-2 mb-3" data-comment-list></div><form class="flex items-center gap-2.5" data-comment-form>${window.FILive.avatarMarkup(current || { name: 'Me' }, 'avatar w-9 h-9 text-[11px] object-cover')}<input name="content" class="field !rounded-pill" placeholder="Write a thoughtful comment…" required><button class="icon-btn text-brand"><i class="fa-solid fa-paper-plane"></i></button></form></div>
    </article>`;
  }

  function renderFeed() {
    let items = loadedPosts.filter(post => !feedQuery || [post.content, post.title, post.article_title, post.author?.name].some(value => String(value || '').toLowerCase().includes(feedQuery)));
    if (sortMode === 'Recent') items.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
    if (sortMode === 'Top') items.sort((a, b) => (Number(b.reaction_count || 0) + Number(b.comment_count || 0) + Number(b.share_count || 0)) - (Number(a.reaction_count || 0) + Number(a.comment_count || 0) + Number(a.share_count || 0)));
    if (sortMode === 'Following') items = items.filter(post => followingIds.has(post.author?.uid) || post.author?.uid === window.FILive.user?.uid);
    feed.innerHTML = items.length ? items.map(postHTML).join('') : `<section class="card p-8 text-center"><h2 class="font-bold">${feedQuery || sortMode === 'Following' ? 'No matching posts' : 'Your community feed is ready'}</h2><p class="text-muted text-[13.5px] mt-1">${sortMode === 'Following' ? 'Follow members from Network to build this feed.' : 'Be the first to share a blessing or testimony.'}</p></section>`;
  }

  async function loadPosts() {
    feed.innerHTML = `<section class="card p-8 text-center text-muted"><i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Loading your community…</section>`;
    try {
      const result = await api.request('cv_get_posts');
      loadedPosts = result.items || []; renderFeed(); renderBlessings(loadedPosts);
    } catch (error) { feed.innerHTML = `<section class="card p-6 text-rose">${esc(error.message)}</section>`; }
    $('#load-more')?.classList.add('hidden');
  }

  function renderBlessings(items) {
    const rail = $('[data-rail]'); if (!rail) return;
    const blessings = items.filter(post => post.type === 'blessing').slice(0, 8);
    const current = window.FILive.user || { name: 'Me' };
    const currentPhoto = current.avatar_url || current.avatar || current.photo_url || '';
    const addVisual = currentPhoto ? `<img class="w-full h-full object-cover" src="${esc(currentPhoto)}" alt="${esc(current.name || 'Your profile')}">` : window.FILive.avatarMarkup(current, 'avatar w-14 h-14 text-[15px] object-cover');
    const add = `<button class="snap-start shrink-0 w-[112px] h-[172px] rounded-card overflow-hidden card text-left" data-modal-open="modal-blessing"><div class="h-[108px] bg-brand-soft grid place-items-center overflow-hidden">${addVisual}</div><div class="h-[64px] grid place-items-center text-[12.5px] font-semibold">+ Add Blessing</div></button>`;
    rail.innerHTML = add + blessings.map((post, index) => {
      const author = post.author || {};
      const colors = ['#3730a3','#065f46','#92400e','#6b21a8','#1e40af'];
      const media = Array.isArray(post.media_items) ? post.media_items.find(item => item.type === 'image') : null;
      const blessingImage = media?.url || media?.preview_url || post.cover_image_url || '';
      const authorPhoto = author.uid === current.uid ? currentPhoto : (author.avatar_url || author.avatar || '');
      const avatar = authorPhoto ? `<img class="absolute top-2.5 left-2.5 avatar w-9 h-9 object-cover ring-[3px] ring-white/80" src="${esc(authorPhoto)}" alt="${esc(author.name || 'Faith In member')}">` : `<span class="absolute top-2.5 left-2.5 avatar w-9 h-9 text-[11px] ring-[3px] ring-white/80">${esc(api.initials(author.name))}</span>`;
      return `<button class="snap-start shrink-0 w-[112px] h-[172px] rounded-card overflow-hidden relative text-left text-white" style="background:linear-gradient(180deg,${colors[index % colors.length]},#111827)" data-blessing-post="${esc(post.id)}">${blessingImage ? `<img class="absolute inset-0 w-full h-full object-cover" src="${esc(blessingImage)}" alt="Blessing image"><span class="absolute inset-0" style="background:linear-gradient(180deg,rgba(0,0,0,.2),rgba(0,0,0,.35) 48%,rgba(0,0,0,.78))"></span>` : ''}${avatar}<span class="absolute inset-x-3 top-1/2 -translate-y-1/2 text-center font-serif italic text-[13px] line-clamp-4">${esc(post.content || 'Shared a blessing')}</span><span class="absolute bottom-2.5 left-3 right-3 text-[11.5px] font-semibold truncate">${esc(author.name || 'Faith In Member')}</span></button>`;
    }).join('');
  }

  async function loadMembers() {
    const list = $('#contacts'); if (!list) return;
    try {
      const result = await api.request('cv_get_suggested_users');
      list.innerHTML = (result.items || []).slice(0, 6).map(user => `<li class="flex items-start gap-3 p-2 rounded-xl hover:bg-raised" data-user-uid="${esc(user.uid)}">${window.FILive.avatarMarkup(user)}<span class="min-w-0 flex-1"><a href="/profile?uid=${encodeURIComponent(user.uid)}" class="block text-[13.5px] font-semibold truncate">${esc(user.name)}</a><span class="block text-[12px] text-muted truncate">${esc(user.role || user.church || user.location || 'Faith In member')}</span></span><button class="btn btn-ghost !px-3 !py-1 !text-[12.5px] border border-line" data-live-message>Message</button></li>`).join('') || '<li class="text-[13px] text-muted p-2">No other members yet.</li>';
    } catch (_) { list.innerHTML = '<li class="text-[13px] text-muted p-2">Sign in to see members.</li>'; }
  }

  async function loadPrayers() {
    const heading = $$('#main h2').find(el => el.textContent.trim() === 'Prayer Wall');
    const section = heading?.closest('section'); if (!section) return;
    try {
      const result = await api.request('cv_get_prayers'), items = (result.items || []).slice(0, 3);
      const intro = $('p', section); if (intro) intro.textContent = `${result.items?.length || 0} requests waiting for prayer today.`;
      const prayerLink = $$('a', $('#main > aside')).find(link => /Prayer Wall/.test(link.textContent)); const badge = prayerLink ? $('span', prayerLink) : null; if (badge) badge.textContent = result.items?.length || 0;
      const holder = $('.space-y-2\\.5', section); if (holder) holder.innerHTML = items.map(prayer => `<div class="rounded-xl bg-raised border border-line p-3" data-prayer-id="${esc(prayer.id)}"><p class="text-[13px]">${esc(prayer.content)}</p><div class="mt-2 flex items-center justify-between"><span class="text-[11.5px] text-muted">${esc(prayer.author)} · ${esc(prayer.time)}</span><span class="flex items-center gap-2"><button class="text-[12px] font-semibold ${prayer.has_prayed ? 'text-rose' : 'text-brand'}" data-live-pray>${prayer.has_prayed ? '🙏 Praying' : '🙏 Pray'} ${prayer.prayed_count || ''}</button>${prayer.can_delete ? '<button class="text-rose" data-prayer-delete aria-label="Delete prayer"><i class="fa-regular fa-trash-can"></i></button>' : ''}</span></div></div>`).join('') || '<p class="text-[13px] text-muted">No prayer requests yet.</p>';
    } catch (error) { const holder = $('.space-y-2\\.5', section); if (holder) holder.innerHTML = `<p class="text-[13px] text-muted">Sign in to see community prayer requests.</p>`; }
  }

  const ta = $('#blessing-text'), postBtn = $('#blessing-post'), count = $('#blessing-count');
  const blessingImageInput = $('#blessing-image-input'), blessingVideoInput = $('#blessing-video-input');
  const blessingPreviewWrap = $('#blessing-media-preview-wrap'), blessingPreview = $('#blessing-media-preview');
  let blessingMediaFiles = [], blessingPreviewUrls = [];
  function updateBlessingButton() { if (postBtn) postBtn.disabled = !ta?.value.trim() && !blessingMediaFiles.length; }
  function clearBlessingMedia() {
    blessingPreviewUrls.forEach(url => URL.revokeObjectURL(url)); blessingPreviewUrls = []; blessingMediaFiles = [];
    if (blessingImageInput) blessingImageInput.value = '';
    if (blessingVideoInput) blessingVideoInput.value = '';
    blessingPreviewWrap?.classList.add('hidden');
    if (blessingPreview) blessingPreview.innerHTML = '';
    updateBlessingButton();
  }
  function selectBlessingMedia(files, mode) {
    const chosen = [...files].slice(0, mode === 'video' ? 1 : 10);
    if (!chosen.length) return clearBlessingMedia();
    const oversize = chosen.find(file => file.size > 250 * 1024 * 1024);
    if (oversize) return toast(`${oversize.name} is larger than 250MB.`);
    clearBlessingMedia(); blessingMediaFiles = chosen;
    blessingPreview.classList.toggle('is-video', mode === 'video');
    blessingPreview.classList.toggle('is-gallery', mode !== 'video');
    chosen.forEach(file => {
      const url = URL.createObjectURL(file); blessingPreviewUrls.push(url);
      const element = document.createElement(mode === 'video' ? 'video' : 'img');
      element.src = url;
      if (mode === 'video') { element.controls = true; element.playsInline = true; element.preload = 'metadata'; }
      else element.alt = 'Blessing image preview';
      blessingPreview.appendChild(element);
    });
    blessingPreviewWrap.classList.remove('hidden'); updateBlessingButton();
  }
  ta?.addEventListener('input', () => { count.textContent = `${ta.value.length}/600`; updateBlessingButton(); });
  blessingImageInput?.addEventListener('change', () => selectBlessingMedia(blessingImageInput.files || [], 'image'));
  blessingVideoInput?.addEventListener('change', () => selectBlessingMedia(blessingVideoInput.files || [], 'video'));
  $('#blessing-media-remove')?.addEventListener('click', clearBlessingMedia);
  $$('[data-chip]').forEach(chip => chip.addEventListener('click', () => { ta.value = `${ta.value.trim()} ${chip.textContent} `.trimStart(); ta.dispatchEvent(new Event('input')); ta.focus(); }));
  postBtn?.addEventListener('click', async () => { if (!needUser()) return; busy(postBtn, true, blessingMediaFiles.length ? 'Uploading' : 'Posting'); try { const files = blessingMediaFiles.length ? { 'post_media[]': blessingMediaFiles } : {}; await api.request('cv_create_post', { content: ta.value.trim(), type: 'blessing', visibility: 'public' }, files); ta.value = ''; clearBlessingMedia(); closeModal(); toast('Your blessing is live 🕊️'); await loadPosts(); } catch (error) { toast(error.message); } finally { busy(postBtn, false, 'Post'); ta.dispatchEvent(new Event('input')); } });

  const fileInput = $('#file-input'), preview = $('#preview'), dropzone = $('#dropzone');
  const mediaPickerTitle = $('#media-picker-title'), mediaPickerHelp = $('#media-picker-help'), mediaPickerIcon = $('#media-picker-icon');
  let selectedFiles = [], mediaMode = 'image', previewUrls = [];
  function isVideo(file) { return /^video\//i.test(file?.type || '') || /\.(mp4|m4v|mov|qt|webm|ogv)$/i.test(file?.name || ''); }
  function clearPreviewUrls() { previewUrls.forEach(url => URL.revokeObjectURL(url)); previewUrls = []; }
  function setMediaMode(mode) {
    mediaMode = mode === 'video' ? 'video' : 'image';
    if (!fileInput) return;
    fileInput.value = '';
    fileInput.accept = mediaMode === 'video' ? 'video/*,.mp4,.m4v,.mov,.qt,.webm,.ogv' : 'image/*';
    fileInput.multiple = mediaMode !== 'video';
    if (mediaPickerTitle) mediaPickerTitle.textContent = mediaMode === 'video' ? 'Select a video to share' : 'Select photos to share';
    if (mediaPickerHelp) mediaPickerHelp.textContent = mediaMode === 'video' ? 'Portrait, square, or landscape · maximum 250MB' : 'JPG, PNG, GIF, WebP, or HEIC · up to 10 images';
    if (mediaPickerIcon) mediaPickerIcon.className = mediaMode === 'video' ? 'fa-solid fa-video text-3xl text-rose mb-3' : 'fa-regular fa-images text-3xl text-faint mb-3';
    showFiles([]);
  }
  function showFiles(files) {
    const incoming = [...files];
    const videoFiles = incoming.filter(isVideo);
    const imageFiles = incoming.filter(file => !isVideo(file) && /^image\//i.test(file.type || ''));
    if (videoFiles.length && imageFiles.length) { toast('Choose either photos or one video, not both.'); return; }
    if (videoFiles.length > 1) { toast('Choose one video per post.'); return; }
    const chosen = videoFiles.length ? videoFiles.slice(0, 1) : imageFiles.slice(0, 10);
    const oversize = chosen.find(file => file.size > 250 * 1024 * 1024);
    if (oversize) { toast(`${oversize.name} is larger than 250MB.`); return; }
    mediaMode = videoFiles.length ? 'video' : mediaMode;
    selectedFiles = chosen;
    clearPreviewUrls();
    preview.innerHTML = '';
    preview.classList.toggle('hidden', !selectedFiles.length);
    preview.classList.toggle('grid-cols-4', mediaMode !== 'video');
    preview.classList.toggle('grid-cols-1', mediaMode === 'video');
    selectedFiles.forEach(file => {
      const url = URL.createObjectURL(file); previewUrls.push(url);
      const element = document.createElement(isVideo(file) ? 'video' : 'img');
      element.className = isVideo(file) ? 'fi-video-preview rounded-lg border border-line' : 'w-full aspect-square object-cover rounded-lg border border-line';
      element.src = url;
      if (isVideo(file)) { element.controls = true; element.playsInline = true; element.preload = 'metadata'; }
      else element.alt = 'Selected image preview';
      preview.appendChild(element);
    });
  }
  $$('[data-media-mode]').forEach(button => button.addEventListener('click', () => setMediaMode(button.dataset.mediaMode)));
  fileInput?.addEventListener('change', () => showFiles(fileInput.files));
  ['dragover','dragleave','drop'].forEach(type => dropzone?.addEventListener(type, event => { event.preventDefault(); dropzone.classList.toggle('border-brand', type === 'dragover'); if (type === 'drop') showFiles(event.dataTransfer.files); }));
  const photoDone = $$('#modal-photo button').find(button => button.textContent.trim() === 'Done');
  photoDone?.addEventListener('click', async () => { if (!needUser()) return; if (!selectedFiles.length) return toast(mediaMode === 'video' ? 'Choose a video.' : 'Choose at least one photo.'); busy(photoDone, true, 'Uploading'); try { await api.request('cv_create_post', { type: mediaMode === 'video' ? 'video' : 'post', visibility: 'public' }, { 'post_media[]': selectedFiles }); closeModal(); toast(mediaMode === 'video' ? 'Video shared' : 'Photos shared'); showFiles([]); await loadPosts(); } catch (error) { toast(error.message); } finally { busy(photoDone, false, 'Done'); } });

  const prayerButton = $$('#modal-prayer button').find(button => /request prayer/i.test(button.textContent));
  prayerButton?.removeAttribute('data-toast');
  prayerButton?.addEventListener('click', async event => { event.stopPropagation(); if (!needUser()) return; const modal = $('#modal-prayer'), title = $('input[type="text"]', modal).value.trim(), body = $('textarea', modal).value.trim(); if (!body) return toast('Write your prayer request first.'); busy(prayerButton, true, 'Sharing'); try { await api.request('cv_create_prayer', { content: title ? `${title}\n${body}` : body }); closeModal(); toast('Prayer request shared 🙏'); $('textarea', modal).value = ''; await loadPrayers(); } catch (error) { toast(error.message); } finally { busy(prayerButton, false, 'Request Prayer'); } });

  $$('#editor-tools [data-cmd]').forEach(button => button.addEventListener('mousedown', event => { event.preventDefault(); document.execCommand(button.dataset.cmd, false, button.dataset.arg || null); $('#article-body').focus(); }));
  const articleButton = $$('#modal-article button').find(button => /publish/i.test(button.textContent));
  articleButton?.removeAttribute('data-toast');
  articleButton?.addEventListener('click', async event => { event.stopPropagation(); if (!needUser()) return; const modal = $('#modal-article'), title = $('input', modal).value.trim(), text = $('#article-body').textContent.trim(); if (!title || !text) return toast('Add a headline and article text.'); busy(articleButton, true, 'Publishing'); try { await api.request('cv_create_post', { type: 'article', title, article_title: title, article_body: $('#article-body').innerHTML, content: text, visibility: 'public' }); closeModal(); toast('Article published ✨'); await loadPosts(); } catch (error) { toast(error.message); } finally { busy(articleButton, false, 'Publish'); } });

  // Patch a single post in place. Reloading the whole feed after a tap blanks
  // the list behind a "Loading your community…" spinner, loses scroll position
  // and re-requests every image and video in the feed, so we never do that for
  // an action whose response already tells us the new state.
  function patchPost(id, changes) {
    const post = loadedPosts.find(item => String(item.id) === String(id));
    if (post) Object.assign(post, changes);
    return post;
  }

  function paintReaction(article, reacted, count) {
    const button = $('[data-live-like]', article);
    if (button) {
      button.classList.toggle('!text-brand', reacted);
      button.setAttribute('aria-pressed', String(reacted));
    }
    const counter = $('[data-likecount]', article);
    if (counter && count != null) counter.textContent = String(count);
  }

  function paintSaved(article, saved) {
    const button = $('[data-live-save]', article);
    if (!button) return;
    button.classList.toggle('!text-brand', saved);
    button.setAttribute('aria-pressed', String(saved));
    const icon = $('i', button);
    if (icon) icon.className = saved ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
  }

  feed?.addEventListener('click', async event => {
    const article = event.target.closest('[data-post-id]'); if (!article) return; const id = article.dataset.postId;
    if (event.target.closest('[data-live-like]')) {
      if (!needUser()) return;
      const button = event.target.closest('[data-live-like]');
      if (button.dataset.busy) return;
      const post = loadedPosts.find(item => String(item.id) === String(id));
      const wasReacted = !!(post?.user_reaction || post?.current_user_reaction);
      const wasCount = Number(post?.reaction_count || 0);
      // Optimistic flip so the button responds on the tap, then reconcile with
      // the authoritative counts the server sends back.
      button.dataset.busy = '1';
      paintReaction(article, !wasReacted, Math.max(0, wasCount + (wasReacted ? -1 : 1)));
      try {
        const result = await api.request('cv_like_post', { post_id: id, reaction: 'like' });
        const reaction = result?.user_reaction || result?.current_user_reaction || null;
        const count = Number(result?.reaction_count ?? result?.likes ?? 0);
        patchPost(id, { user_reaction: reaction, current_user_reaction: reaction, reaction_count: count });
        paintReaction(article, !!reaction, count);
      } catch (error) {
        paintReaction(article, wasReacted, wasCount);
        toast(error.message);
      } finally {
        delete button.dataset.busy;
      }
      return;
    }
    if (event.target.closest('[data-comment-toggle]')) { event.preventDefault(); const box = $('[data-comments]', article); box.classList.toggle('hidden'); if (!box.classList.contains('hidden')) { $('input', box).focus(); try { const result = await api.request('cv_get_post_comments', { post_id: id }); $('[data-comment-list]', box).innerHTML = (result.items || []).map(comment => `<div class="rounded-xl bg-raised p-2.5"><strong class="text-[12.5px]">${esc(comment.author?.name || comment.author_name || 'Member')}</strong><p class="text-[13px] mt-1">${esc(comment.content)}</p></div>`).join(''); } catch (_) {} } return; }
    if (event.target.closest('[data-live-share]')) {
      if (!needUser()) return;
      try {
        const result = await api.request('cv_share_post', { post_id: id });
        const count = Number(result?.share_count ?? 0);
        patchPost(id, { share_count: count });
        const label = $('[data-sharecount]', article);
        if (label) label.textContent = `${count} shares`;
        try { await navigator.clipboard.writeText(`${location.origin}/?post=${id}`); } catch (_) {}
        toast('Post link copied');
      } catch (error) { toast(error.message); }
      return;
    }
    if (event.target.closest('[data-live-save]')) {
      if (!needUser()) return;
      const button = event.target.closest('[data-live-save]');
      if (button.dataset.busy) return;
      const wasSaved = button.getAttribute('aria-pressed') === 'true';
      button.dataset.busy = '1';
      paintSaved(article, !wasSaved);
      try {
        const result = await api.request('cv_toggle_bookmark', { object_id: id, object_type: 'post' });
        const saved = result?.bookmarked !== undefined ? !!result.bookmarked : !wasSaved;
        patchPost(id, { bookmarked: saved });
        paintSaved(article, saved);
        toast(saved ? 'Saved' : 'Removed from saved');
      } catch (error) {
        paintSaved(article, wasSaved);
        toast(error.message);
      } finally {
        delete button.dataset.busy;
      }
      return;
    }
    if (event.target.closest('[data-live-follow]')) { event.stopPropagation(); if (!needUser()) return; await api.request('cv_social_follow_user', { target_uid: article.dataset.authorUid }); toast('Following'); event.target.closest('[data-live-follow]').remove(); return; }
    if (event.target.closest('[data-live-delete]')) { if (!needUser() || !confirm('Delete this post?')) return; await api.request('cv_delete_post', { post_id: id }); article.remove(); toast('Post deleted'); }
  });
  feed?.addEventListener('submit', async event => { const form = event.target.closest('[data-comment-form]'); if (!form) return; event.preventDefault(); if (!needUser()) return; const article = form.closest('[data-post-id]'), input = $('input', form); try { await api.request('cv_create_post_comment', { post_id: article.dataset.postId, content: input.value.trim() }); input.value = ''; toast('Comment posted'); } catch (error) { toast(error.message); } });

  document.addEventListener('click', async event => {
    const removePrayer = event.target.closest('[data-prayer-delete]'); if (removePrayer) { if (!needUser() || !confirm('Delete this prayer request?')) return; try { await api.request('cv_delete_prayer', { prayer_id: removePrayer.closest('[data-prayer-id]').dataset.prayerId }); await loadPrayers(); toast('Prayer request deleted'); } catch (error) { toast(error.message); } return; }
    const pray = event.target.closest('[data-live-pray]'); if (pray) { if (!needUser()) return; try { await api.request('cv_update_prayer', { prayer_id: pray.closest('[data-prayer-id]').dataset.prayerId }); await loadPrayers(); } catch (error) { toast(error.message); } }
    const message = event.target.closest('[data-live-message]'); if (message) { if (!needUser()) return; location.href = `/network?message=${encodeURIComponent(message.closest('[data-user-uid]').dataset.userUid)}`; }
  });

  $('[data-copy-verse]')?.addEventListener('click', async () => { try { await navigator.clipboard.writeText('For God so loved the world, that he gave his only begotten Son. — John 3:16'); toast('Verse copied'); } catch (_) { toast('Copy unavailable'); } });
  $('[data-share-verse]')?.addEventListener('click', async () => { const text = 'For God so loved the world, that he gave his only begotten Son. — John 3:16'; try { if (navigator.share) await navigator.share({ title: 'Verse of the Day', text, url: location.origin + '/bible-study?passage=John%203%3A16' }); else { await navigator.clipboard.writeText(text); toast('Verse copied to share'); } } catch (_) {} });
  $('[data-save-verse]')?.addEventListener('click', async event => { if (!needUser()) return; try { await api.request('cv_toggle_bookmark', { object_id: 'John-3-16', object_type: 'verse' }); event.currentTarget.classList.toggle('!text-brand'); const icon = $('i', event.currentTarget); if (icon) icon.className = event.currentTarget.classList.contains('!text-brand') ? 'fa-solid fa-bookmark mr-1.5' : 'fa-regular fa-bookmark mr-1.5'; toast(event.currentTarget.classList.contains('!text-brand') ? 'Verse saved' : 'Verse removed'); } catch (error) { toast(error.message); } });
  $('[data-show-contacts]')?.addEventListener('click', () => { location.href = '/network'; });
  $('[data-search-contacts]')?.addEventListener('click', () => { location.href = '/network'; });
  $('[data-add-verse]')?.addEventListener('click', () => { if (ta) { ta.value += `${ta.value ? '\n' : ''}John 3:16 — “For God so loved the world…”`; ta.dispatchEvent(new Event('input')); ta.focus(); } });
  $('[data-add-emoji]')?.addEventListener('click', () => { if (ta) { ta.value += ' 🙏'; ta.dispatchEvent(new Event('input')); ta.focus(); } });
  $$('[data-prayer-category]').forEach(button => button.addEventListener('click', () => { const title = $('#modal-prayer input[type="text"]'); if (title) { title.value = button.textContent.trim(); title.focus(); } }));
  $$('[data-sort]').forEach(button => button.addEventListener('click', () => { sortMode = button.dataset.sort; $('[data-sort-label]').textContent = sortMode; renderFeed(); }));
  document.addEventListener('fi:search', event => { feedQuery = event.detail.query.toLowerCase(); renderFeed(); });
  document.addEventListener('click', event => { const blessing = event.target.closest('[data-blessing-post]'); if (!blessing) return; const post = $(`[data-post-id="${CSS.escape(blessing.dataset.blessingPost)}"]`, feed); if (post) { post.scrollIntoView({ behavior: 'smooth', block: 'center' }); post.classList.add('ring-2', 'ring-brand'); setTimeout(() => post.classList.remove('ring-2', 'ring-brand'), 1600); } });
  document.addEventListener('fi:session', event => { const user = event.detail.user; const left = $('#main > aside'); if (left) { const metrics = $$('a span:last-child', left); metrics.filter(node => /^\d/.test(node.textContent.trim())).forEach(node => { if (/480/.test(node.textContent)) node.textContent = '0'; }); left.querySelector('section:last-child')?.remove(); if (user) { const name = $$('a', left).find(link => link.textContent.trim() === 'Faith In Member' || link.textContent.trim() === 'Hun Chet'); if (name) name.textContent = user.name; } } if (user) { loadPosts(); loadMembers(); loadPrayers(); } else { feed.innerHTML = `<section class="card p-8 text-center"><i class="fa-solid fa-lock text-2xl text-faint"></i><h2 class="font-bold mt-3">Sign in to open your community</h2><p class="text-muted text-[13.5px] mt-1">Your real posts, prayers, members, and messages appear here.</p><button class="btn btn-primary mt-3" data-open-auth>Sign in</button></section>`; $('#load-more')?.classList.add('hidden'); renderBlessings([]); const contacts = $('#contacts'); if (contacts) contacts.innerHTML = '<li class="text-[13px] text-muted p-2">Sign in to see members.</li>'; const prayer = $$('#main h2').find(node => node.textContent.trim() === 'Prayer Wall')?.closest('section'); if (prayer) { const intro = $('p', prayer); if (intro) intro.textContent = 'Sign in to see real prayer requests.'; const holder = $('.space-y-2\\.5', prayer); if (holder) holder.innerHTML = ''; } } });
  async function loadVerse() { try { const result = await api.request('cv_bible_get_verses', { book: 'John', chapter: 3, version: 'KJV' }); const verse = (result.items || []).find(item => item.v === 16); if (!verse) return; const card = $$('#main h2').find(node => node.textContent.trim() === 'Verse of the Day')?.closest('section'); const english = card ? $$('blockquote p', card)[1] : null; if (english) english.textContent = `“${verse.text.trim()}”`; } catch (_) {} }
  document.addEventListener('click', event => { if (event.target.closest('[data-open-auth]')) window.FI.openAuth(); });
  // Start real home data in parallel with session initialization. FIData
  // de-duplicates the request when the session event fires moments later.
  if (feed) { loadPosts(); loadMembers(); loadPrayers(); api.request('cv_social_get_following').then(result => { followingIds = new Set((result.items || []).map(item => item.uid)); if (sortMode === 'Following') renderFeed(); }).catch(() => {}); }
  loadVerse();
})();
