/* Faith In — live home feed, composers, prayers, members and engagement. */
(() => {
  'use strict';
  const { $, $$, esc, toast, closeModal } = window.FI;
  const api = window.FIData;
  const feed = $('#posts');
  const needUser = () => window.FILive.requireUser();
  let loadedPosts = [], feedQuery = '', sortMode = 'Top', followingIds = new Set();

  const LEGACY_MEDIA_BASE = 'https://nckvrhdyrikrbpgjlqlw.supabase.co/storage/v1/object/public/faithin-media/migrated/';
  const LEGACY_MEDIA_FILES = [
    [/2026[-_]?08[-_]?15.*19[._-]?51[._-]?25/i, '2026-08-15_19.51.25.jpg'],
    [/2026[-_]?08[-_]?16.*20[._-]?36[._-]?24/i, '2026-08-16_20.36.24.jpg'],
    [/img[_-]?0585/i, 'IMG_0585.jpg'],
    [/img[_-]?0628/i, 'IMG_0628.jpg'],
    [/img[_-]?0637/i, 'IMG_0637.jpg'],
    [/img[_-]?0639/i, 'IMG_0639.jpg'],
    [/img[_-]?0665/i, 'IMG_0665.jpg'],
    [/jesus.*love.*you/i, 'JESUS_LOVE_YOU.png'],
    [/(love.*can.*change|hpF5tGVEuM1rMsqjdfG8rHsnLXRE52|^_[-_])/i, 'LOVE_CAN_CHANGE_EVERYTHING.mp4'],
    [/(peter.*tan.*chi|gather25|ytdown.*mKEiNA6yeII)/i, 'Peter_Tan_Chi_Gather25.mp4'],
    [/strength.*christian.*fellowship/i, 'Strength_in_Christian_fellowship.mp3'],
    [/mhc.*gen.*01/i, 'MHC_Gen_01_1-2.pdf'],
    [/mhc.*preface.*first.*volume/i, 'MHC_Preface_to_the_First_Volume.pdf'],
    [/images[-_]?31998/i, 'images-31998.jpeg'],
    [/images[-_]?5268/i, 'images-5268.jpeg'],
    [/wallpaper[-_]?04/i, 'wallpaper-04.jpg']
  ];

  function mediaUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try {
      const parsed = new URL(raw, window.location.origin);
      if (!/\.blob\.vercel-storage\.com$/i.test(parsed.hostname)) return raw;
      const legacyName = decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || '');
      const match = LEGACY_MEDIA_FILES.find(([pattern]) => pattern.test(legacyName));
      return match ? LEGACY_MEDIA_BASE + encodeURIComponent(match[1]) : raw;
    } catch (_) { return raw; }
  }

  function busy(button, active, label) {
    if (!button) return;
    if (active) { button.dataset.oldLabel = button.innerHTML; button.disabled = true; button.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>${label}`; }
    else { button.disabled = false; button.innerHTML = button.dataset.oldLabel || label; }
  }

  function mediaHTML(post) {
    const media = Array.isArray(post.media_items) ? post.media_items : [];
    const items = media.length ? media : (post.cover_image_url ? [{ type: 'image', url: post.cover_image_url }] : []);
    if (!items.length) return '';
    const isSingle = items.length === 1;
    return `<div class="border-y border-line bg-raised grid gap-1 ${items.length > 1 ? 'grid-cols-2' : ''}" data-media>${items.slice(0, 4).map(item => {
      const url = esc(mediaUrl(item.url || item.preview_url || item.local_url || ''));
      if (item.type === 'video') {
        const poster = esc(mediaUrl(item.thumbnail_url || item.poster_url || ''));
        return `<div class="relative ${isSingle ? 'max-h-[340px] sm:max-h-[400px]' : 'aspect-square'} w-full overflow-hidden bg-black/10">
          <video class="fi-feed-video w-full h-full ${isSingle ? 'max-h-[340px] sm:max-h-[400px]' : ''} object-cover" controls playsinline preload="none"${poster ? ` poster="${poster}"` : ''} src="${url}"></video>
        </div>`;
      }
      if (item.type === 'audio') return `<div class="p-5"><audio class="w-full" controls src="${url}"></audio></div>`;
      return `<div class="fi-post-media-wrap ${isSingle ? 'max-h-[340px] sm:max-h-[400px]' : 'aspect-square'} w-full overflow-hidden cursor-pointer group/media relative bg-black/5 dark:bg-white/5 select-none" data-view-media data-media-url="${url}">
        <img class="w-full h-full ${isSingle ? 'max-h-[340px] sm:max-h-[400px]' : ''} object-cover transition-transform duration-300 ease-out group-hover/media:scale-[1.03]" src="${url}" alt="Shared media" loading="lazy" decoding="async">
        <div class="absolute inset-0 bg-black/0 group-hover/media:bg-black/20 transition-all duration-200 flex items-center justify-center pointer-events-none">
          <span class="w-9 h-9 rounded-full bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover/media:opacity-100 transition-all duration-200 transform scale-90 group-hover/media:scale-100 flex items-center justify-center text-xs shadow-md">
            <i class="fa-solid fa-magnifying-glass-plus"></i>
          </span>
        </div>
      </div>`;
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

  // A blocked Blob store does not always answer: the request can hang, so the
  // img never fires error and never goes complete — it just sits blank forever.
  // Deliberately not gated on IntersectionObserver: an image that has not
  // loaded has no intrinsic size, collapses to zero height, and therefore never
  // reports as intersecting, so an observer would never watch the very images
  // this exists for. There are at most four per post, and the probe below is
  // what actually decides, so a plain timer is both simpler and correct.
  const MEDIA_STALL_MS = 12000;
  function watchForStall(root) {
    root.querySelectorAll('[data-media] img').forEach(img => {
      if (img.dataset.stallWatched) return;
      if (img.complete && img.naturalWidth > 0) return;
      img.dataset.stallWatched = '1';
      const timer = setTimeout(async () => {
        if (img.complete && img.naturalWidth > 0) return;
        if (!img.isConnected || img.dataset.mediaFailed) return;
        // A slow connection also looks like a stall, so confirm the file is
        // genuinely unavailable before replacing anything the user might still
        // be waiting on. Anything inconclusive (including a cross-origin probe
        // the browser refuses) counts as alive and is left alone.
        let dead = false;
        try {
          const probe = await fetch(img.src, { method: 'GET', headers: { Range: 'bytes=0-0' } });
          dead = !probe.ok && probe.status !== 206;
        } catch (_) { dead = false; }
        if (!dead) return;
        if (img.complete && img.naturalWidth > 0) return;
        if (!img.isConnected || img.dataset.mediaFailed) return;
        img.dataset.mediaFailed = '1';
        img.replaceWith(mediaFallback('image'));
      }, MEDIA_STALL_MS);
      const clear = () => clearTimeout(timer);
      img.addEventListener('load', clear, { once: true });
      img.addEventListener('error', clear, { once: true });
    });
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

  const faithReactions = {
    like: { label: 'Amen', icon: 'fa-hands-praying', tone: 'amen' },
    love: { label: 'Love', icon: 'fa-heart', tone: 'love' },
    pray: { label: 'Pray', icon: 'fa-hands-praying', tone: 'pray' },
    celebrate: { label: 'Hallelujah', icon: 'fa-star', tone: 'hallelujah' },
    support: { label: 'Praise', icon: 'fa-dove', tone: 'praise' }
  };

  function faithReactionMeta(key) {
    return faithReactions[key] || faithReactions.like;
  }

  function postHTML(post) {
    const author = post.author || {};
    const uid = author.uid || post.author_uid || post.authorUid || '';
    const name = author.name || author.displayName || post.author_name || post.authorName || 'Faith In Member';
    const current = window.FILive.user;
    const isSelf = !!(
      post.is_self ||
      author.is_self ||
      (current && uid && (uid === current.uid || String(current.id) === String(uid)))
    );
    const isFollowing = !isSelf && !!(post.is_following || author.is_following);
    const avatar = isSelf
      ? (current?.avatar_url || current?.avatar || current?.photo_url || author.avatar_url || author.avatar || '')
      : (author.avatar_url || author.avatar || author.photo_url || post.author_avatar || '');
    const profileHref = uid ? `/profile?uid=${encodeURIComponent(uid)}` : '/profile';
    const selectedReaction = post.user_reaction || post.current_user_reaction || '';
    const selectedMeta = faithReactionMeta(selectedReaction || 'like');
    const saved = !!post.bookmarked;
    const owner = !!(post.can_delete || isSelf);
    const body = post.content || post.excerpt || post.article_excerpt || '';
    return `<article class="card animate-fade-up" data-post-id="${esc(post.id)}" data-author-uid="${esc(uid)}">
      <header class="flex items-start gap-2.5 p-3 pb-2 sm:p-4 sm:pb-2.5">
        <a href="${profileHref}" class="shrink-0 block">${avatar ? `<img class="avatar w-9 h-9 sm:w-11 sm:h-11 object-cover" src="${esc(avatar)}" alt="${esc(name)}">` : `<span class="avatar w-9 h-9 sm:w-11 sm:h-11 text-[13px]">${esc(api.initials(name))}</span>`}</a>
        <div class="min-w-0 flex-1"><div class="flex items-center gap-1.5 flex-wrap"><a href="${profileHref}" class="text-[13.5px] sm:text-[14.5px] font-semibold hover:text-brand inline-flex items-center">${esc(name)}${window.FILive.verificationBadgeMarkup(author || post)}</a>${post.type === 'article' ? `<span class="text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-soft text-brand">Article</span>` : ''}</div><p class="text-[11px] sm:text-[12px] text-muted mt-0.5">${esc(post.time || 'just now')} · ${esc(post.visibility || 'Public')}</p></div>
        ${!owner && uid ? `<button class="btn ${isFollowing ? 'btn-neutral' : 'btn-outline'} !py-0.5 !px-2.5 !text-[12px] sm:!text-[13px]" data-live-follow><i class="fa-solid ${isFollowing ? 'fa-check' : 'fa-plus'} text-[10px] mr-1"></i>${isFollowing ? 'Following' : 'Follow'}</button>` : ''}
        ${owner ? `<button class="icon-btn !w-8 !h-8" data-live-delete aria-label="Delete post"><i class="fa-regular fa-trash-can text-[13px]"></i></button>` : ''}
      </header>
      ${post.article_title ? `<div class="px-3 pt-1 sm:px-4"><h3 class="font-serif text-[18px] sm:text-[22px] font-semibold">${esc(post.article_title)}</h3></div>` : ''}
      ${body ? `<div class="px-3 pb-2 sm:px-4 sm:pb-3"><p class="text-[13.5px] sm:text-[14.5px] leading-relaxed whitespace-pre-wrap">${esc(body)}</p></div>` : ''}
      ${mediaHTML(post)}
      <div class="px-3 py-1.5 sm:px-4 sm:py-2 flex items-center justify-between text-[11px] sm:text-[12px] text-muted border-b border-line">
        <div class="flex items-center gap-1.5">
          <span class="faith-counter-badge ${selectedMeta.tone}" data-reaction-badge>
            <i class="fa-solid ${selectedMeta.icon}"></i>
          </span>
          <span class="font-medium text-ink/80 text-[12px]" data-likecount>${Number(post.reaction_count || 0)}</span>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" class="hover:underline" data-comment-toggle>${Number(post.comment_count || 0)} comments</button>
          <span data-sharecount>${Number(post.share_count || 0)} shares</span>
        </div>
      </div>
      <div class="flex items-center justify-between gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1">
        <div class="faith-reaction-wrap relative flex-1" data-faith-reaction-wrap>
          <div class="faith-reaction-popup" role="menu" aria-label="Choose a faith reaction">
            ${Object.entries(faithReactions).map(([key, reaction]) => `<button type="button" class="faith-reaction-option ${reaction.tone} ${selectedReaction === key ? 'is-selected' : ''}" data-live-reaction="${key}" role="menuitem" aria-label="${reaction.label}" aria-pressed="${selectedReaction === key}"><span class="faith-reaction-bubble"><i class="fa-solid ${reaction.icon}"></i></span><span class="faith-reaction-tooltip">${reaction.label}</span></button>`).join('')}
          </div>
          <button type="button" class="action-btn w-full faith-reaction-trigger !text-[12px] sm:!text-[13px] ${selectedReaction ? `is-on ${selectedMeta.tone}` : ''}" data-live-reaction-trigger data-selected-reaction="${selectedReaction}" aria-pressed="${!!selectedReaction}" aria-haspopup="menu"><i class="fa-solid ${selectedMeta.icon}"></i><span>${selectedReaction ? selectedMeta.label : 'Amen'}</span></button>
        </div>
        <button type="button" class="action-btn flex-1 !text-[12px] sm:!text-[13px]" data-comment-toggle><i class="fa-regular fa-comment"></i><span>Comment</span></button>
        <button type="button" class="action-btn flex-1 !text-[12px] sm:!text-[13px]" data-live-share><i class="fa-solid fa-share-nodes"></i><span>Share</span></button>
        <button type="button" class="action-btn flex-1 !text-[12px] sm:!text-[13px] ${saved ? '!text-brand' : ''}" data-live-save aria-pressed="${saved}"><i class="fa-${saved ? 'solid' : 'regular'} fa-bookmark"></i><span>Save</span></button>
      </div>
      <div class="hidden border-t border-line p-3" data-comments><div class="space-y-2 mb-2.5" data-comment-list></div><form class="flex items-center gap-2" data-comment-form>${window.FILive.avatarMarkup(current || { name: 'Me' }, 'avatar w-8 h-8 text-[10px] object-cover')}<input name="content" class="field !rounded-pill !py-1.5 !text-[13px]" placeholder="Write a thoughtful comment…" required><button class="icon-btn text-brand !w-8 !h-8"><i class="fa-solid fa-paper-plane text-[13px]"></i></button></form></div>
    </article>`;
  }

  function renderFeed() {
    const current = window.FILive.user;
    let items = loadedPosts.filter(post => {
      if (!feedQuery) return true;
      const textFields = [post.content, post.title, post.article_title, post.author?.name, post.author_name];
      return textFields.some(value => String(value || '').toLowerCase().includes(feedQuery.toLowerCase()));
    });

    if (sortMode === 'Recent') {
      items.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
    } else if (sortMode === 'Top') {
      items.sort((a, b) => {
        const aFollowed = (a.is_following || a.author?.is_following || (a.author_uid && followingIds.has(a.author_uid))) ? 1 : 0;
        const bFollowed = (b.is_following || b.author?.is_following || (b.author_uid && followingIds.has(b.author_uid))) ? 1 : 0;
        if (bFollowed !== aFollowed) return bFollowed - aFollowed;
        const bScore = (Number(b.reaction_count || 0) + Number(b.comment_count || 0) + Number(b.share_count || 0));
        const aScore = (Number(a.reaction_count || 0) + Number(a.comment_count || 0) + Number(a.share_count || 0));
        if (bScore !== aScore) return bScore - aScore;
        return String(b.created_at || '').localeCompare(String(a.created_at || ''));
      });
    } else if (sortMode === 'Following') {
      items = items.filter(post => {
        const authorUid = post.author?.uid || post.author_uid || post.authorUid || '';
        const isSelf = !!(current && authorUid && (authorUid === current.uid || String(current.id) === String(authorUid)));
        const isFollowing = !!(post.is_following || post.author?.is_following || (authorUid && followingIds.has(authorUid)));
        return isFollowing || isSelf;
      });
      items.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
    }

    feed.innerHTML = items.length ? items.map(postHTML).join('') : `<section class="card p-8 text-center"><h2 class="font-bold">${feedQuery || sortMode === 'Following' ? 'No matching posts' : 'Your community feed is ready'}</h2><p class="text-muted text-[13.5px] mt-1">${sortMode === 'Following' ? 'Follow members from Network or Contacts to build this feed.' : 'Be the first to share a blessing or testimony.'}</p></section>`;
    watchForStall(feed);

    // Scroll to & highlight target post if coming from a notification
    const targetPostId = new URLSearchParams(location.search).get('post') || location.hash.replace(/^#post-/, '').replace(/^#/, '');
    if (targetPostId) {
      setTimeout(() => {
        const targetCard = feed.querySelector(`[data-post-id="${targetPostId}"]`);
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetCard.classList.add('ring-2', 'ring-brand', 'transition-all');
          setTimeout(() => {
            targetCard.classList.remove('ring-2', 'ring-brand');
          }, 3000);
          if (new URLSearchParams(location.search).get('action') === 'comment') {
            const toggle = targetCard.querySelector('[data-comment-toggle]');
            if (toggle) toggle.click();
          }
        }
      }, 250);
    }
  }

  function getCachedFeed() {
    try {
      const cached = sessionStorage.getItem('FI_FEED_CACHE');
      return cached ? JSON.parse(cached) : null;
    } catch (_) { return null; }
  }

  function setCachedFeed(items) {
    try {
      sessionStorage.setItem('FI_FEED_CACHE', JSON.stringify((items || []).slice(0, 30)));
    } catch (_) {}
  }

  async function loadPosts() {
    // Instant display from session cache if available (0ms load time)
    const cached = getCachedFeed();
    if (cached && cached.length && !loadedPosts.length) {
      loadedPosts = cached;
      renderFeed();
      renderBlessings(loadedPosts);
    } else if (!loadedPosts.length) {
      feed.innerHTML = `
        <div class="card p-4 space-y-3 animate-pulse">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-full bg-raised"></div>
            <div class="space-y-1.5 flex-1">
              <div class="h-3.5 bg-raised rounded w-1/3"></div>
              <div class="h-2.5 bg-raised rounded w-1/4"></div>
            </div>
          </div>
          <div class="h-4 bg-raised rounded w-3/4"></div>
          <div class="h-24 bg-raised rounded w-full"></div>
        </div>`;
    }

    try {
      const [result, followResult] = await Promise.all([
        api.request('cv_get_posts'),
        api.request('cv_social_get_following').catch(() => ({ items: [] }))
      ]);
      if (followResult && Array.isArray(followResult.items)) {
        followResult.items.forEach(item => {
          if (item.uid) followingIds.add(item.uid);
          if (item.id) followingIds.add(String(item.id));
        });
      }
      loadedPosts = result.items || [];
      setCachedFeed(loadedPosts);
      renderFeed();
      renderBlessings(loadedPosts);
    } catch (error) {
      if (!loadedPosts.length) {
        feed.innerHTML = `<section class="card p-6 text-rose">${esc(error.message)}</section>`;
      }
    }
    $('#load-more')?.classList.add('hidden');
  }

  const storyGradients = [
    'linear-gradient(145deg, #1e3a8a, #3b82f6, #06b6d4)',
    'linear-gradient(145deg, #4c1d95, #7c3aed, #ec4899)',
    'linear-gradient(145deg, #065f46, #10b981, #0284c7)',
    'linear-gradient(145deg, #831843, #e11d48, #f59e0b)',
    'linear-gradient(145deg, #312e81, #4f46e5, #9333ea)',
    'linear-gradient(145deg, #1e293b, #334155, #64748b)'
  ];

  function renderBlessings(items) {
    const rail = $('[data-rail]'); if (!rail) return;
    let blessings = (items || []).filter(post => post.type === 'blessing' || (post.content && post.content.length < 240)).slice(0, 10);
    if (!blessings.length && items && items.length) {
      blessings = items.slice(0, 8);
    }
    const current = window.FILive.user || { name: 'Me' };
    const currentPhoto = current.avatar_url || current.avatar || current.photo_url || '';
    const addVisual = currentPhoto ? `<img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${esc(currentPhoto)}" alt="${esc(current.name || 'Your profile')}">` : `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand/20 to-indigo-500/30 text-brand text-xl font-bold">${esc(api.initials(current.name || 'You'))}</div>`;
    
    const add = `<div class="snap-start shrink-0 w-[110px] sm:w-[124px] h-[175px] sm:h-[195px] rounded-2xl overflow-hidden relative border border-line bg-surface flex flex-col group cursor-pointer shadow-xs hover:shadow-md transition-all duration-200 select-none" data-modal-open="modal-blessing">
      <div class="h-[120px] sm:h-[135px] w-full overflow-hidden bg-raised relative flex items-center justify-center">
        ${addVisual}
      </div>
      <div class="flex-1 w-full bg-surface relative flex flex-col items-center justify-end pb-2.5 px-1">
        <span class="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand text-white text-[13px] font-black grid place-items-center ring-3 ring-surface shadow-md group-hover:scale-110 transition-transform">
          <i class="fa-solid fa-plus"></i>
        </span>
        <span class="text-[12px] font-bold text-ink leading-tight text-center truncate w-full">Add Blessing</span>
      </div>
    </div>`;
    
    rail.innerHTML = add + blessings.map((post, index) => {
      const author = post.author || {};
      const authorUid = author.uid || post.author_uid || post.authorUid || '';
      const authorName = author.name || author.displayName || post.author_name || post.authorName || 'Faith In Member';
      const isSelf = !!(current && authorUid && (authorUid === current.uid || String(current.id) === String(authorUid)));
      const authorPhoto = isSelf ? currentPhoto : (author.avatar_url || author.avatar || author.photo_url || post.author_avatar || '');
      const avatar = authorPhoto ? `<img class="w-full h-full object-cover" src="${esc(authorPhoto)}" alt="${esc(authorName)}">` : `<span class="avatar w-full h-full text-[11px] font-bold">${esc(api.initials(authorName))}</span>`;
      
      const mediaItems = Array.isArray(post.media_items) ? post.media_items : [];
      const videoItem = mediaItems.find(item => item.type === 'video');
      const audioItem = mediaItems.find(item => item.type === 'audio');
      const imageItem = mediaItems.find(item => item.type === 'image' || !item.type);
      
      const storyVideo = videoItem ? mediaUrl(videoItem.url || videoItem.preview_url || videoItem.local_url || '') : '';
      const storyAudio = audioItem ? mediaUrl(audioItem.url || audioItem.preview_url || audioItem.local_url || '') : '';
      const storyAudioName = audioItem ? (audioItem.name || 'Worship Music') : '';
      const storyImage = post.cover_image_url || (imageItem ? mediaUrl(imageItem.url || imageItem.preview_url || '') : '');
      const hasImage = !!storyImage && !storyVideo;
      const hasVideo = !!storyVideo;
      const hasAudio = !!storyAudio;
      
      const gradient = post.blessing_bg_color || post.bg_color || storyGradients[index % storyGradients.length];
      const text = post.content || post.excerpt || '';
      
      return `<div class="snap-start shrink-0 w-[110px] sm:w-[124px] h-[175px] sm:h-[195px] rounded-2xl overflow-hidden relative border border-line cursor-pointer group shadow-xs hover:shadow-md transition-all duration-200 select-none" data-blessing-post="${esc(post.id)}" data-story-text="${esc(text)}" data-story-author="${esc(authorName)}" data-story-avatar="${esc(authorPhoto)}" data-story-time="${esc(post.time || 'Today')}" data-story-bg="${esc(storyImage || '')}" data-story-video="${esc(storyVideo)}" data-story-audio="${esc(storyAudio)}" data-story-audio-name="${esc(storyAudioName)}" data-story-gradient="${esc(gradient)}">
        <!-- Background Layer -->
        <div class="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105" style="background:${gradient};">
          ${hasVideo ? `<video class="w-full h-full object-cover" muted playsinline preload="metadata" src="${esc(storyVideo)}"></video>` : (hasImage ? `<img class="w-full h-full object-cover" src="${esc(storyImage)}" alt="Blessing">` : '')}
        </div>
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/85"></div>
        <!-- Top Avatar Ring -->
        <div class="absolute top-2.5 left-2.5 z-10 flex items-center gap-1">
          <div class="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-sm">
            <div class="w-full h-full rounded-full overflow-hidden bg-surface flex items-center justify-center ring-1 ring-white/80">
              ${avatar}
            </div>
          </div>
          ${hasAudio ? `<span class="w-5 h-5 rounded-full bg-purple-600 text-white text-[9px] grid place-items-center shadow-xs ml-0.5"><i class="fa-solid fa-music"></i></span>` : ''}
          ${hasVideo ? `<span class="w-5 h-5 rounded-full bg-rose text-white text-[9px] grid place-items-center shadow-xs ml-0.5"><i class="fa-solid fa-video"></i></span>` : ''}
        </div>
        <!-- Center Excerpt preview if text only -->
        ${!hasImage && !hasVideo && text ? `<p class="absolute inset-x-2.5 top-12 text-[11px] text-white/95 font-medium line-clamp-3 leading-snug drop-shadow-sm" style="font-family:'Koh Santepheap','Inter',sans-serif;">${esc(text)}</p>` : ''}
        <!-- Bottom Name -->
        <div class="absolute bottom-2.5 inset-x-2.5 z-10">
          <span class="block text-[11.5px] font-bold text-white leading-tight drop-shadow truncate">${esc(authorName.split(' ')[0])}</span>
        </div>
      </div>`;
    }).join('');
  }

  function getCachedMembers() {
    try {
      const cached = sessionStorage.getItem('FI_MEMBERS_CACHE');
      return cached ? JSON.parse(cached) : null;
    } catch (_) { return null; }
  }

  function setCachedMembers(items) {
    try {
      sessionStorage.setItem('FI_MEMBERS_CACHE', JSON.stringify((items || []).slice(0, 16)));
    } catch (_) {}
  }

  function getCachedPrayers() {
    try {
      const cached = sessionStorage.getItem('FI_PRAYERS_CACHE');
      return cached ? JSON.parse(cached) : null;
    } catch (_) { return null; }
  }

  function setCachedPrayers(items) {
    try {
      sessionStorage.setItem('FI_PRAYERS_CACHE', JSON.stringify((items || []).slice(0, 8)));
    } catch (_) {}
  }

  function renderMembersList(items) {
    const list = $('#contacts'); if (!list) return;
    if (items.length) {
      list.innerHTML = items.map(user => `<li data-user-uid="${esc(user.uid)}">
        <div class="flex items-center gap-3 min-w-0 flex-1">
          ${window.FILive.avatarMarkup(user, 'avatar')}
          <div class="contact-info">
            <div class="contact-name-row">
              <a href="/profile?uid=${encodeURIComponent(user.uid)}" class="contact-name hover:text-brand transition" title="${esc(user.name)}">${esc(user.name)}</a>
              ${window.FILive.verificationBadgeMarkup(user)}
            </div>
            <span class="contact-subtitle">Faithin</span>
          </div>
        </div>
        <div class="contact-actions">
          <button type="button" class="contact-follow-btn ${user.is_following ? 'is-following' : ''}" data-contact-follow-btn data-following="${user.is_following ? 'true' : 'false'}">
            <i class="fa-solid ${user.is_following ? 'fa-check' : 'fa-plus'} text-[10px] mr-1"></i> ${user.is_following ? 'Following' : 'Follow'}
          </button>
          <button type="button" class="contact-chat-btn" data-live-message aria-label="Message ${esc(user.name)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              <path d="M10 8.5h4" /><path d="M10 12h3" /><path d="M10 8.5v7" />
            </svg>
          </button>
        </div>
      </li>`).join('');
    } else {
      list.innerHTML = '<li class="text-[12.5px] text-muted py-3 px-1 text-center">No other members yet</li>';
    }
  }

  async function loadMembers() {
    const list = $('#contacts'); if (!list) return;
    const current = window.FILive?.user;
    const cached = getCachedMembers();
    if (cached && cached.length) {
      const items = cached.filter(u => !current?.uid || u.uid !== current.uid).slice(0, 8);
      renderMembersList(items);
    }
    try {
      const result = await api.request('cv_find_users');
      const items = (result.items || []).filter(u => !current?.uid || u.uid !== current.uid).slice(0, 8);
      setCachedMembers(result.items || []);
      renderMembersList(items);
    } catch (_) {
      if (!cached || !cached.length) {
        list.innerHTML = '<li class="text-[12.5px] text-muted py-3 px-1 text-center">No other members yet</li>';
      }
    }
  }

  function renderPrayersList(items, section) {
    if (!section) return;
    const intro = $('p', section); if (intro) intro.textContent = `${items.length} requests waiting for prayer today.`;
    const prayerLink = $$('a', $('#main > aside')).find(link => /Prayer Wall/.test(link.textContent)); const badge = prayerLink ? $('span', prayerLink) : null; if (badge) badge.textContent = items.length;
    const holder = $('.space-y-2\\.5', section); if (holder) holder.innerHTML = items.slice(0, 3).map(prayer => `<div class="rounded-xl bg-raised border border-line p-3" data-prayer-id="${esc(prayer.id)}"><p class="text-[13px]">${esc(prayer.content)}</p><div class="mt-2 flex items-center justify-between"><span class="text-[11.5px] text-muted">${esc(prayer.author)} · ${esc(prayer.time)}</span><span class="flex items-center gap-2"><button class="text-[12px] font-semibold ${prayer.has_prayed ? 'text-rose' : 'text-brand'}" data-live-pray>${prayer.has_prayed ? '🙏 Praying' : '🙏 Pray'} ${prayer.prayed_count || ''}</button>${prayer.can_delete ? '<button class="text-rose" data-prayer-delete aria-label="Delete prayer"><i class="fa-regular fa-trash-can"></i></button>' : ''}</span></div></div>`).join('') || '<p class="text-[13px] text-muted">No prayer requests yet.</p>';
  }

  async function loadPrayers() {
    const heading = $$('#main h2').find(el => el.textContent.trim() === 'Prayer Wall');
    const section = heading?.closest('section'); if (!section) return;
    const cached = getCachedPrayers();
    if (cached && cached.length) {
      renderPrayersList(cached, section);
    }
    try {
      const result = await api.request('cv_get_prayers');
      const items = result.items || [];
      setCachedPrayers(items);
      renderPrayersList(items, section);
    } catch (error) {
      if (!cached || !cached.length) {
        const holder = $('.space-y-2\\.5', section);
        if (holder) holder.innerHTML = `<p class="text-[13px] text-muted">Sign in to see community prayer requests.</p>`;
      }
    }
  }

  const ta = $('#blessing-text'), postBtn = $('#blessing-post'), count = $('#blessing-count');
  const blessingImageInput = $('#blessing-image-input'), blessingVideoInput = $('#blessing-video-input'), blessingAudioInput = $('#blessing-audio-input');
  const blessingPreviewWrap = $('#blessing-media-preview-wrap'), blessingMediaBox = $('#blessing-media-preview-box'), blessingPreview = $('#blessing-media-preview');
  const blessingAudioWrap = $('#blessing-audio-preview-wrap'), blessingAudioName = $('#blessing-audio-name'), blessingAudioPlayToggle = $('#blessing-audio-play-toggle');
  const blessingEditorBox = $('#blessing-editor-box');
  
  let blessingMediaFiles = [], blessingAudioFile = null, blessingPreviewUrls = [], blessingAudioUrl = '', blessingAudioEl = null;
  let selectedBlessingTheme = 'linear-gradient(145deg, #1e3a8a, #3b82f6, #06b6d4)';

  function updateBlessingButton() {
    if (postBtn) postBtn.disabled = !ta?.value.trim() && !blessingMediaFiles.length && !blessingAudioFile;
  }

  function clearBlessingMedia() {
    blessingPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    blessingPreviewUrls = [];
    blessingMediaFiles = [];
    if (blessingImageInput) blessingImageInput.value = '';
    if (blessingVideoInput) blessingVideoInput.value = '';
    if (blessingMediaBox) blessingMediaBox.classList.add('hidden');
    if (blessingPreview) blessingPreview.innerHTML = '';
    checkBlessingWrapVisibility();
    updateBlessingButton();
  }

  function clearBlessingAudio() {
    if (blessingAudioUrl) {
      if (blessingAudioEl) { blessingAudioEl.pause(); blessingAudioEl = null; }
      URL.revokeObjectURL(blessingAudioUrl);
      blessingAudioUrl = '';
    }
    blessingAudioFile = null;
    if (blessingAudioInput) blessingAudioInput.value = '';
    if (blessingAudioWrap) blessingAudioWrap.classList.add('hidden');
    if (blessingAudioPlayToggle) blessingAudioPlayToggle.innerHTML = '<i class="fa-solid fa-play text-xs"></i>';
    checkBlessingWrapVisibility();
    updateBlessingButton();
  }

  function checkBlessingWrapVisibility() {
    if (blessingPreviewWrap) {
      const hasMedia = blessingMediaFiles.length > 0;
      const hasAudio = !!blessingAudioFile;
      blessingPreviewWrap.classList.toggle('hidden', !hasMedia && !hasAudio);
    }
  }

  function selectBlessingMedia(files, mode) {
    const chosen = [...files].slice(0, mode === 'video' ? 1 : 10);
    if (!chosen.length) return clearBlessingMedia();
    const oversize = chosen.find(file => file.size > 50 * 1024 * 1024);
    if (oversize) return toast(`${oversize.name} is larger than the 50MB limit.`);
    clearBlessingMedia();
    blessingMediaFiles = chosen;
    if (blessingMediaBox) blessingMediaBox.classList.remove('hidden');
    blessingPreview.classList.toggle('is-video', mode === 'video');
    blessingPreview.classList.toggle('is-gallery', mode !== 'video');
    chosen.forEach(file => {
      const url = URL.createObjectURL(file);
      blessingPreviewUrls.push(url);
      const element = document.createElement(mode === 'video' ? 'video' : 'img');
      element.src = url;
      if (mode === 'video') { element.controls = true; element.playsInline = true; element.preload = 'metadata'; }
      else element.alt = 'Blessing image preview';
      blessingPreview.appendChild(element);
    });
    checkBlessingWrapVisibility();
    updateBlessingButton();
  }

  function selectBlessingAudio(files) {
    const file = files[0];
    if (!file) return clearBlessingAudio();
    if (file.size > 30 * 1024 * 1024) return toast(`${file.name} is larger than the 30MB audio limit.`);
    clearBlessingAudio();
    blessingAudioFile = file;
    blessingAudioUrl = URL.createObjectURL(file);
    if (blessingAudioName) blessingAudioName.textContent = file.name || 'Worship Music';
    if (blessingAudioWrap) {
      blessingAudioWrap.classList.remove('hidden');
      blessingAudioWrap.classList.add('flex');
    }
    checkBlessingWrapVisibility();
    updateBlessingButton();
  }

  ta?.addEventListener('input', () => {
    if (count) count.textContent = `${ta.value.length}/600`;
    updateBlessingButton();
  });

  blessingImageInput?.addEventListener('change', () => selectBlessingMedia(blessingImageInput.files || [], 'image'));
  blessingVideoInput?.addEventListener('change', () => selectBlessingMedia(blessingVideoInput.files || [], 'video'));
  blessingAudioInput?.addEventListener('change', () => selectBlessingAudio(blessingAudioInput.files || []));
  
  $('#blessing-media-remove')?.addEventListener('click', clearBlessingMedia);
  $('#blessing-audio-remove')?.addEventListener('click', clearBlessingAudio);

  blessingAudioPlayToggle?.addEventListener('click', () => {
    if (!blessingAudioUrl) return;
    if (!blessingAudioEl) {
      blessingAudioEl = new Audio(blessingAudioUrl);
      blessingAudioEl.onended = () => {
        blessingAudioPlayToggle.innerHTML = '<i class="fa-solid fa-play text-xs"></i>';
      };
    }
    if (blessingAudioEl.paused) {
      blessingAudioEl.play();
      blessingAudioPlayToggle.innerHTML = '<i class="fa-solid fa-pause text-xs"></i>';
    } else {
      blessingAudioEl.pause();
      blessingAudioPlayToggle.innerHTML = '<i class="fa-solid fa-play text-xs"></i>';
    }
  });

  // Story theme gradient picker
  $$('#blessing-themes [data-story-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedBlessingTheme = btn.dataset.storyTheme;
      if (blessingEditorBox) blessingEditorBox.style.background = selectedBlessingTheme;
      $$('#blessing-themes [data-story-theme]').forEach(b => {
        b.classList.remove('ring-2', 'ring-brand', 'scale-110');
        b.classList.add('ring-1', 'ring-white/20');
      });
      btn.classList.add('ring-2', 'ring-brand', 'scale-110');
      btn.classList.remove('ring-1', 'ring-white/20');
    });
  });

  // Quick Scripture Insertion
  $$('[data-verse-insert]').forEach(btn => {
    btn.addEventListener('click', () => {
      const verse = btn.dataset.verseInsert;
      if (verse && ta) {
        ta.value = ta.value ? `${ta.value.trim()}\n\n${verse}` : verse;
        ta.dispatchEvent(new Event('input'));
        ta.focus();
      }
    });
  });

  $$('[data-chip]').forEach(chip => chip.addEventListener('click', () => {
    if (ta) {
      ta.value = `${ta.value.trim()} ${chip.textContent} `.trimStart();
      ta.dispatchEvent(new Event('input'));
      ta.focus();
    }
  }));

  postBtn?.addEventListener('click', async () => {
    if (!needUser()) return;
    const isUploading = blessingMediaFiles.length || blessingAudioFile;
    busy(postBtn, true, isUploading ? 'Uploading' : 'Posting');
    try {
      const files = {};
      if (blessingMediaFiles.length) files['post_media[]'] = blessingMediaFiles;
      if (blessingAudioFile) files.blessing_music = [blessingAudioFile];
      
      await api.request('cv_create_post', {
        content: ta.value.trim(),
        type: 'blessing',
        visibility: 'public',
        blessing_bg_color: selectedBlessingTheme
      }, files);
      
      ta.value = '';
      clearBlessingMedia();
      clearBlessingAudio();
      closeModal();
      toast('Your blessing story is live 🕊️');
      await loadPosts();
    } catch (error) {
      toast(error.message);
    } finally {
      busy(postBtn, false, 'Share Story');
      ta.dispatchEvent(new Event('input'));
    }
  });

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
    if (mediaPickerHelp) mediaPickerHelp.textContent = mediaMode === 'video' ? 'Portrait, square, or landscape · maximum 50MB' : 'JPG, PNG, GIF, WebP, or HEIC · up to 10 images';
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
    const oversize = chosen.find(file => file.size > 50 * 1024 * 1024);
    if (oversize) { toast(`${oversize.name} is larger than the free 50MB limit.`); return; }
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

  // Article composer
  const headlineEl = $('#article-headline');
  const bodyEl = $('#article-body');
  const coverInput = $('#article-cover-input');
  const coverPreview = $('#article-cover-preview');
  const coverPrompt = $('#article-cover-prompt');
  const authorNameEl = $('#article-author-name');
  const authorAvatarEl = $('#article-author-avatar');
  const saveIcon = $('#save-icon');
  const saveStatus = $('#save-status');
  let pendingArticleCoverFile = null;

  function refreshArticleAuthor() {
    const user = window.FILive?.user || null;
    if (user && authorNameEl) authorNameEl.textContent = `By ${user.name || user.displayName || 'You'}`;
    if (user && authorAvatarEl) {
      const avatarUrl = user.avatar_url || user.avatar || user.photo_url;
      if (avatarUrl) {
        authorAvatarEl.innerHTML = `<img src="${esc(avatarUrl)}" class="w-full h-full object-cover rounded-full" alt="Author" />`;
      } else {
        authorAvatarEl.textContent = api.initials(user.name || 'You');
      }
    }
  }

  document.addEventListener('click', e => {
    if (e.target.closest('[data-modal-open="modal-article"]')) {
      refreshArticleAuthor();
      setTimeout(() => headlineEl?.focus(), 100);
    }
  });

  if (coverInput && coverPreview) {
    coverInput.addEventListener('change', function() {
      const file = this.files && this.files[0];
      if (file) {
        pendingArticleCoverFile = file;
        coverPreview.src = URL.createObjectURL(file);
        coverPreview.classList.remove('hidden');
        if (coverPrompt) coverPrompt.classList.add('hidden');
      }
    });
  }

  $$('#editor-tools [data-cmd]').forEach(button => {
    button.addEventListener('mousedown', event => {
      event.preventDefault();
      document.execCommand(button.dataset.cmd, false, button.dataset.arg || null);
      bodyEl?.focus();
      button.classList.toggle('active');
    });
  });

  $('[data-insert-link]')?.addEventListener('mousedown', event => {
    event.preventDefault();
    const url = prompt('Enter link URL (e.g. https://example.com):');
    if (url) {
      document.execCommand('createLink', false, url);
      bodyEl?.focus();
    }
  });

  $('[data-insert-image]')?.addEventListener('mousedown', event => {
    event.preventDefault();
    coverInput?.click();
  });

  let saveTimeout;
  const triggerSaveStatus = () => {
    if (!saveStatus || !saveIcon) return;
    saveStatus.textContent = 'Saving…';
    saveIcon.className = 'fa-solid fa-spinner fa-spin text-muted';
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveStatus.textContent = 'Saved to draft';
      saveIcon.className = 'fa-solid fa-cloud text-emerald-500';
      setTimeout(() => {
        if (saveIcon) saveIcon.className = 'fa-solid fa-cloud text-muted';
      }, 2000);
    }, 800);
  };

  [headlineEl, bodyEl].filter(Boolean).forEach(el => {
    el.addEventListener('input', triggerSaveStatus);
  });

  const editView = $('#article-edit-view');
  const previewView = $('#article-preview-view');
  const pvTitle = $('#pv-title');
  const pvBody = $('#pv-body');
  const pvCover = $('#pv-cover');
  const pvCoverWrap = $('#pv-cover-wrap');
  const pvAuthorName = $('#pv-author-name');
  const pvAuthorAvatar = $('#pv-author-avatar');

  function showArticlePreview() {
    const title = (headlineEl?.innerText || headlineEl?.textContent || '').trim();
    const bodyHtml = bodyEl ? bodyEl.innerHTML : '';
    const bodyText = (bodyEl?.innerText || bodyEl?.textContent || '').trim();
    if (!title && !bodyText) {
      return toast('Write a headline or some text first to preview.');
    }

    if (pvTitle) pvTitle.textContent = title || 'Untitled Article';
    if (pvBody) pvBody.innerHTML = bodyHtml || `<p class="text-muted">No content written yet.</p>`;

    const user = window.FILive?.user || null;
    if (user && pvAuthorName) pvAuthorName.textContent = `By ${user.name || user.displayName || 'You'}`;
    if (user && pvAuthorAvatar) {
      const avatarUrl = user.avatar_url || user.avatar || user.photo_url;
      if (avatarUrl) {
        pvAuthorAvatar.innerHTML = `<img src="${esc(avatarUrl)}" class="w-full h-full object-cover rounded-full" alt="Author" />`;
      } else {
        pvAuthorAvatar.textContent = api.initials(user.name || 'You');
      }
    }

    if (pendingArticleCoverFile && coverPreview && coverPreview.src) {
      if (pvCover) pvCover.src = coverPreview.src;
      pvCoverWrap?.classList.remove('hidden');
    } else {
      pvCoverWrap?.classList.add('hidden');
    }

    if (editView && previewView) {
      editView.classList.add('hidden');
      previewView.classList.remove('hidden');
    }
  }

  function hideArticlePreview() {
    if (editView && previewView) {
      previewView.classList.add('hidden');
      editView.classList.remove('hidden');
      headlineEl?.focus();
    }
  }

  $('#article-preview-btn')?.addEventListener('click', showArticlePreview);
  $('#article-back-to-edit')?.addEventListener('click', hideArticlePreview);

  document.addEventListener('fi:modalclose', () => {
    hideArticlePreview();
  });

  const publishArticle = async (btn) => {
    if (!needUser()) return;
    const title = (headlineEl?.innerText || headlineEl?.textContent || '').trim();
    const text = (bodyEl?.innerText || bodyEl?.textContent || '').trim();
    if (!title && !text) return toast('Add a headline and article text.');
    busy(btn, true, 'Publishing');
    try {
      const files = pendingArticleCoverFile ? { 'post_media[]': [pendingArticleCoverFile] } : {};
      await api.request('cv_create_post', {
        type: 'article',
        title: title || 'Untitled Article',
        article_title: title || 'Untitled Article',
        article_body: bodyEl ? bodyEl.innerHTML : text,
        content: text || title,
        visibility: 'public'
      }, files);
      closeModal();
      hideArticlePreview();
      toast('Article published ✨');
      if (headlineEl) headlineEl.innerText = '';
      if (bodyEl) bodyEl.innerHTML = '';
      if (coverPreview) { coverPreview.src = ''; coverPreview.classList.add('hidden'); }
      if (coverPrompt) coverPrompt.classList.remove('hidden');
      pendingArticleCoverFile = null;
      await loadPosts();
    } catch (error) {
      toast(error.message);
    } finally {
      busy(btn, false, 'Publish');
    }
  };

  const articleButton = $('#article-publish-btn');
  articleButton?.removeAttribute('data-toast');
  articleButton?.addEventListener('click', (e) => { e.stopPropagation(); publishArticle(articleButton); });

  const previewPublishBtn = $('#article-preview-publish-btn');
  previewPublishBtn?.addEventListener('click', (e) => { e.stopPropagation(); publishArticle(previewPublishBtn); });

  // Patch a single post in place. Reloading the whole feed after a tap blanks
  // the list behind a "Loading your community…" spinner, loses scroll position
  // and re-requests every image and video in the feed, so we never do that for
  // an action whose response already tells us the new state.
  function patchPost(id, changes) {
    const post = loadedPosts.find(item => String(item.id) === String(id));
    if (post) Object.assign(post, changes);
    return post;
  }

  function paintReaction(article, selectedReaction, count) {
    $$('[data-live-reaction]', article).forEach(button => {
      const active = !!selectedReaction && button.dataset.liveReaction === selectedReaction;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const trigger = $('[data-live-reaction-trigger]', article);
    if (trigger) {
      const meta = faithReactionMeta(selectedReaction || 'like');
      trigger.className = `action-btn w-full faith-reaction-trigger${selectedReaction ? ` is-on ${meta.tone}` : ''}`;
      trigger.dataset.selectedReaction = selectedReaction || '';
      trigger.setAttribute('aria-pressed', String(!!selectedReaction));
      trigger.innerHTML = `<i class="fa-solid ${meta.icon}"></i><span>${selectedReaction ? meta.label : 'Amen'}</span>`;
    }
    const badge = $('[data-reaction-badge]', article);
    if (badge) {
      const meta = faithReactionMeta(selectedReaction || 'like');
      badge.className = `faith-counter-badge ${meta.tone}`;
      badge.innerHTML = `<i class="fa-solid ${meta.icon}"></i>`;
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

  let reactionHoldTimer = null;

  feed?.addEventListener('pointerdown', event => {
    const trigger = event.target.closest('[data-live-reaction-trigger]');
    if (!trigger) return;
    clearTimeout(reactionHoldTimer);
    reactionHoldTimer = setTimeout(() => {
      const wrap = trigger.closest('[data-faith-reaction-wrap]');
      if (wrap) wrap.classList.add('is-open');
      trigger.dataset.holdOpened = '1';
    }, 420);
  });

  ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => feed?.addEventListener(type, () => clearTimeout(reactionHoldTimer), true));

  feed?.addEventListener('click', async event => {
    const article = event.target.closest('[data-post-id]'); if (!article) return; const id = article.dataset.postId;
    const reactionChoice = event.target.closest('[data-live-reaction]');
    const reactionTrigger = event.target.closest('[data-live-reaction-trigger]');
    if (reactionChoice || reactionTrigger) {
      if (reactionTrigger?.dataset.holdOpened === '1') {
        delete reactionTrigger.dataset.holdOpened;
        event.preventDefault();
        return;
      }
      if (!needUser()) return;
      const button = reactionChoice || reactionTrigger;
      if (button.dataset.busy) return;
      const post = loadedPosts.find(item => String(item.id) === String(id));
      const previousReaction = post?.user_reaction || post?.current_user_reaction || '';
      const requestedReaction = reactionChoice?.dataset.liveReaction || previousReaction || 'like';
      const wasCount = Number(post?.reaction_count || 0);
      const optimisticReaction = previousReaction === requestedReaction ? '' : requestedReaction;
      const optimisticCount = Math.max(0, wasCount + (!previousReaction ? 1 : (optimisticReaction ? 0 : -1)));
      button.dataset.busy = '1';
      paintReaction(article, optimisticReaction, optimisticCount);
      try {
        const result = await api.request('cv_like_post', { post_id: id, reaction: requestedReaction });
        const reaction = result?.user_reaction || result?.current_user_reaction || null;
        const count = Number(result?.reaction_count ?? result?.likes ?? 0);
        patchPost(id, { user_reaction: reaction, current_user_reaction: reaction, reaction_count: count });
        paintReaction(article, reaction, count);
        article.querySelector('[data-faith-reaction-wrap]')?.classList.remove('is-open');
      } catch (error) {
        paintReaction(article, previousReaction, wasCount);
        toast(error.message);
      } finally {
        delete button.dataset.busy;
      }
      return;
    }
    if (event.target.closest('[data-comment-toggle]')) { event.preventDefault(); const box = $('[data-comments]', article); box.classList.toggle('hidden'); if (!box.classList.contains('hidden')) { $('input', box).focus(); try { const result = await api.request('cv_get_post_comments', { post_id: id }); $('[data-comment-list]', box).innerHTML = (result.items || []).map(comment => `<div class="rounded-xl bg-raised p-2.5 flex items-start gap-2.5"><a href="/profile?uid=${encodeURIComponent(comment.author?.uid || comment.author_uid || '')}" class="shrink-0 block mt-0.5">${window.FILive.avatarMarkup(comment.author || { name: comment.author_name || 'Member' }, 'avatar w-7 h-7 text-[10px] object-cover')}</a><div class="min-w-0 flex-1"><a href="/profile?uid=${encodeURIComponent(comment.author?.uid || comment.author_uid || '')}" class="text-[12.5px] font-semibold hover:text-brand">${esc(comment.author?.name || comment.author_name || 'Member')}</a><p class="text-[13px] mt-0.5 text-ink/90">${esc(comment.content)}</p></div></div>`).join(''); } catch (_) {} } return; }
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
    if (event.target.closest('[data-live-follow]')) {
      event.stopPropagation();
      if (!needUser()) return;
      const btn = event.target.closest('[data-live-follow]');
      const targetUid = article.dataset.authorUid;
      if (!targetUid) return;
      const isFollowing = /following/i.test(btn.textContent);
      btn.disabled = true;
      try {
        await api.request(isFollowing ? 'cv_social_unfollow_user' : 'cv_social_follow_user', { target_uid: targetUid });
        const nowFollowing = !isFollowing;
        btn.innerHTML = `<i class="fa-solid ${nowFollowing ? 'fa-check' : 'fa-plus'} text-[11px] mr-1"></i>${nowFollowing ? 'Following' : 'Follow'}`;
        btn.className = `btn ${nowFollowing ? 'btn-neutral' : 'btn-outline'} !py-1 !px-3 !text-[13px]`;
        toast(nowFollowing ? 'Following' : 'Unfollowed');
      } catch (err) {
        toast(err.message);
      } finally {
        btn.disabled = false;
      }
      return;
    }
    if (event.target.closest('[data-live-delete]')) { if (!needUser() || !confirm('Delete this post?')) return; await api.request('cv_delete_post', { post_id: id }); article.remove(); toast('Post deleted'); }
  });
  feed?.addEventListener('submit', async event => {
    const form = event.target.closest('[data-comment-form]');
    if (!form) return;
    event.preventDefault();
    if (!needUser()) return;
    const article = form.closest('[data-post-id]'), input = $('input', form);
    const text = input.value.trim();
    if (!text) return;
    try {
      const result = await api.request('cv_create_post_comment', { post_id: article.dataset.postId, content: text });
      input.value = '';
      const countBtn = $('[data-comment-toggle]', article);
      if (countBtn && result.comment_count !== undefined) {
        countBtn.textContent = `${result.comment_count} comments`;
      }
      const list = $('[data-comment-list]', article);
      if (list && result.comment) {
        const c = result.comment;
        const commentDiv = document.createElement('div');
        commentDiv.className = 'rounded-xl bg-raised p-2.5 flex items-start gap-2.5 animate-fade-up';
        commentDiv.innerHTML = `
          <a href="/profile?uid=${encodeURIComponent(c.author?.uid || c.author_uid || '')}" class="shrink-0 block mt-0.5">
            ${window.FILive.avatarMarkup(c.author || { name: c.author_name || 'Member' }, 'avatar w-7 h-7 text-[10px] object-cover')}
          </a>
          <div class="min-w-0 flex-1">
            <a href="/profile?uid=${encodeURIComponent(c.author?.uid || c.author_uid || '')}" class="text-[12.5px] font-semibold hover:text-brand inline-flex items-center">
              ${esc(c.author?.name || c.author_name || 'Member')}${window.FILive.verificationBadgeMarkup(c.author)}
            </a>
            <p class="text-[13px] mt-0.5 text-ink/90">${esc(c.content)}</p>
          </div>
        `;
        list.appendChild(commentDiv);
      }
      toast('Comment posted');
    } catch (error) {
      toast(error.message);
    }
  });

  document.addEventListener('click', async event => {
    const removePrayer = event.target.closest('[data-prayer-delete]'); if (removePrayer) { if (!needUser() || !confirm('Delete this prayer request?')) return; try { await api.request('cv_delete_prayer', { prayer_id: removePrayer.closest('[data-prayer-id]').dataset.prayerId }); await loadPrayers(); toast('Prayer request deleted'); } catch (error) { toast(error.message); } return; }
    const pray = event.target.closest('[data-live-pray]'); if (pray) { if (!needUser()) return; try { await api.request('cv_update_prayer', { prayer_id: pray.closest('[data-prayer-id]').dataset.prayerId }); await loadPrayers(); } catch (error) { toast(error.message); } return; }
    const contactFollow = event.target.closest('[data-contact-follow]');
    if (contactFollow) {
      if (!needUser()) return;
      const row = contactFollow.closest('[data-user-uid]');
      const targetUid = row?.dataset.userUid;
      if (!targetUid) return;
      const isFollowing = /following/i.test(contactFollow.textContent);
      contactFollow.disabled = true;
      try {
        await api.request(isFollowing ? 'cv_social_unfollow_user' : 'cv_social_follow_user', { target_uid: targetUid });
        const nowFollowing = !isFollowing;
        contactFollow.innerHTML = `<i class="fa-solid ${nowFollowing ? 'fa-check' : 'fa-plus'} text-[10px] mr-1"></i>${nowFollowing ? 'Following' : 'Follow'}`;
        contactFollow.className = `btn ${nowFollowing ? 'btn-neutral' : 'btn-outline'} !px-2.5 !py-1 !text-[12px]`;
        toast(nowFollowing ? 'Following' : 'Unfollowed');
      } catch (err) {
        toast(err.message);
      } finally {
        contactFollow.disabled = false;
      }
      return;
    }
    const message = event.target.closest('[data-live-message]'); if (message) { if (!needUser()) return; location.href = `/messages?to=${encodeURIComponent(message.closest('[data-user-uid]').dataset.userUid)}`; }
  });

  $('[data-copy-verse]')?.addEventListener('click', async () => { try { await navigator.clipboard.writeText('For God so loved the world, that he gave his only begotten Son. — John 3:16'); toast('Verse copied'); } catch (_) { toast('Copy unavailable'); } });
  $('[data-share-verse]')?.addEventListener('click', async () => { const text = 'For God so loved the world, that he gave his only begotten Son. — John 3:16'; try { if (navigator.share) await navigator.share({ title: 'Verse of the Day', text, url: location.origin + '/bible-study?passage=John%203%3A16' }); else { await navigator.clipboard.writeText(text); toast('Verse copied to share'); } } catch (_) {} });
  $('[data-save-verse]')?.addEventListener('click', async event => { if (!needUser()) return; try { await api.request('cv_toggle_bookmark', { object_id: 'John-3-16', object_type: 'verse' }); event.currentTarget.classList.toggle('!text-brand'); const icon = $('i', event.currentTarget); if (icon) icon.className = event.currentTarget.classList.contains('!text-brand') ? 'fa-solid fa-bookmark mr-1.5' : 'fa-regular fa-bookmark mr-1.5'; toast(event.currentTarget.classList.contains('!text-brand') ? 'Verse saved' : 'Verse removed'); } catch (error) { toast(error.message); } });
  $('[data-show-contacts]')?.addEventListener('click', () => { location.href = '/network'; });
  $('[data-search-contacts]')?.addEventListener('click', () => {
    const wrap = $('#contacts-search-wrap');
    if (wrap) {
      wrap.classList.toggle('hidden');
      if (!wrap.classList.contains('hidden')) $('#contacts-search-input')?.focus();
    }
  });
  $('#contacts-search-input')?.addEventListener('input', (e) => {
    const q = (e.target.value || '').toLowerCase().trim();
    $$('#contacts > li').forEach(li => {
      const text = li.textContent.toLowerCase();
      li.style.display = !q || text.includes(q) ? 'flex' : 'none';
    });
  });
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-contact-follow-btn]');
    if (!btn) return;
    const isFollowing = btn.dataset.following === 'true';
    const nextState = !isFollowing;
    btn.dataset.following = nextState ? 'true' : 'false';
    if (nextState) {
      btn.className = 'flex items-center justify-center min-w-[84px] h-[30px] px-3 rounded-full font-semibold text-[12.5px] transition-all border border-line text-muted hover:bg-raised';
      btn.innerHTML = '<i class="fa-solid fa-check text-[10px] mr-1"></i> Following';
      toast('Following');
    } else {
      btn.className = 'flex items-center justify-center min-w-[84px] h-[30px] px-3 rounded-full font-semibold text-[12.5px] transition-all border border-[#2554D7] text-[#2554D7] hover:bg-blue-50/70';
      btn.innerHTML = '<i class="fa-solid fa-plus text-[10px] mr-1"></i> Follow';
      toast('Unfollowed');
    }
  });
  $('[data-add-verse]')?.addEventListener('click', () => { if (ta) { ta.value += `${ta.value ? '\n' : ''}John 3:16 — “For God so loved the world…”`; ta.dispatchEvent(new Event('input')); ta.focus(); } });
  $('[data-add-emoji]')?.addEventListener('click', () => { if (ta) { ta.value += ' 🙏'; ta.dispatchEvent(new Event('input')); ta.focus(); } });
  $$('[data-prayer-category]').forEach(button => button.addEventListener('click', () => { const title = $('#modal-prayer input[type="text"]'); if (title) { title.value = button.textContent.trim(); title.focus(); } }));
  $$('[data-sort]').forEach(button => button.addEventListener('click', () => { sortMode = button.dataset.sort; $('[data-sort-label]').textContent = sortMode; renderFeed(); }));
  document.addEventListener('fi:search', event => { feedQuery = event.detail.query.toLowerCase(); renderFeed(); });
  document.addEventListener('fi:session', event => {
    const user = event.detail.user;
    const left = $('#main > aside');
    if (left && user) {
      const name = $$('a', left).find(link => link.textContent.trim() === 'Faith In Member' || link.textContent.trim() === 'Hun Chet' || link.hasAttribute('data-current-user-name'));
      if (name) name.innerHTML = esc(user.name) + window.FILive.verificationBadgeMarkup(user);
    }
    if (user && loadedPosts.length) {
      renderBlessings(loadedPosts);
    }
  });
  document.addEventListener('click', event => {
    const mediaWrap = event.target.closest('[data-view-media]');
    if (mediaWrap) {
      event.preventDefault();
      event.stopPropagation();
      const url = mediaWrap.dataset.mediaUrl;
      if (!url) return;
      const modal = $('#modal-media-viewer');
      const img = $('#media-viewer-img');
      const openBtn = $('#media-viewer-open');
      const downloadBtn = $('#media-viewer-download');
      if (img) {
        img.src = url;
      }
      if (openBtn) {
        openBtn.href = url;
      }
      if (downloadBtn) {
        downloadBtn.onclick = (e) => {
          e.preventDefault();
          const cleanName = (url.split('/').pop() || 'faithin-photo').split('?')[0];
          const filename = cleanName.includes('.') ? cleanName : `${cleanName}.jpg`;
          fetch(url)
            .then(res => res.blob())
            .then(blob => {
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              a.remove();
              setTimeout(() => URL.revokeObjectURL(a.href), 1500);
            })
            .catch(() => {
              window.open(url, '_blank');
            });
        };
      }
      if (window.FI && typeof window.FI.openModal === 'function') {
        window.FI.openModal('modal-media-viewer');
      } else {
        const backdrop = $('#backdrop');
        if (backdrop && modal) {
          backdrop.classList.remove('hidden');
          backdrop.classList.add('flex');
          $$('.modal').forEach(m => m.classList.toggle('hidden', m.id !== 'modal-media-viewer'));
          document.body.style.overflow = 'hidden';
        }
      }
    }
  });
  let storyTimer = null;
  const storyAudio = $('#story-audio');
  const storyVideo = $('#story-video');
  const storyMusicBadge = $('#story-music-badge');
  const storyMusicName = $('#story-music-name');
  const storySoundToggle = $('#story-sound-toggle');
  let isStoryMuted = false;

  function stopStoryMedia() {
    if (storyTimer) { clearTimeout(storyTimer); storyTimer = null; }
    if (storyAudio) {
      storyAudio.pause();
      storyAudio.src = '';
    }
    if (storyVideo) {
      storyVideo.pause();
      storyVideo.src = '';
      storyVideo.classList.add('hidden');
    }
    if (storyMusicBadge) storyMusicBadge.classList.add('hidden');
    if (storySoundToggle) storySoundToggle.classList.add('hidden');
  }

  // Intercept modal close to stop media
  document.addEventListener('click', event => {
    if (event.target.closest('[data-close]') || event.target.id === 'backdrop') {
      const modalStory = $('#modal-story');
      if (modalStory && !modalStory.classList.contains('hidden')) {
        stopStoryMedia();
      }
    }
  });

  storySoundToggle?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    isStoryMuted = !isStoryMuted;
    if (storyAudio) storyAudio.muted = isStoryMuted;
    if (storyVideo) storyVideo.muted = isStoryMuted;
    storySoundToggle.innerHTML = isStoryMuted ? '<i class="fa-solid fa-volume-xmark text-xs"></i>' : '<i class="fa-solid fa-volume-high text-xs"></i>';
  });

  document.addEventListener('click', event => {
    const storyCard = event.target.closest('[data-blessing-post]');
    if (storyCard) {
      event.preventDefault();
      event.stopPropagation();
      stopStoryMedia();

      const text = storyCard.dataset.storyText || '';
      const author = storyCard.dataset.storyAuthor || 'Member';
      const avatar = storyCard.dataset.storyAvatar || '';
      const time = storyCard.dataset.storyTime || 'Blessing';
      const bg = storyCard.dataset.storyBg || '';
      const video = storyCard.dataset.storyVideo || '';
      const audio = storyCard.dataset.storyAudio || '';
      const audioName = storyCard.dataset.storyAudioName || 'Worship Music';
      const gradient = storyCard.dataset.storyGradient || 'linear-gradient(180deg,#3157d5,#1e1b4b)';
      
      const modal = $('#modal-story');
      const canvas = $('#story-canvas');
      const textEl = $('#story-text');
      const textWrap = $('#story-text-wrap');
      const nameEl = $('#story-name');
      const timeEl = $('#story-time');
      const bgImg = $('#story-bg-img');
      const avatarWrap = $('#story-avatar-wrap');
      const bar = $('#story-bar');
      
      if (textEl) textEl.textContent = text || '';
      if (textWrap) textWrap.classList.toggle('hidden', !text && (!!video || !!bg));
      if (nameEl) nameEl.textContent = author;
      if (timeEl) timeEl.textContent = time;
      
      if (avatarWrap) {
        avatarWrap.innerHTML = avatar ? `<img class="w-full h-full object-cover" src="${esc(avatar)}" alt="${esc(author)}">` : `<span class="avatar w-full h-full text-[12px] font-bold" style="background:#2f5bea">${esc(api.initials(author))}</span>`;
      }

      // Handle Video
      if (video) {
        if (storyVideo) {
          storyVideo.src = video;
          storyVideo.classList.remove('hidden');
          storyVideo.muted = isStoryMuted;
          storyVideo.play().catch(() => {});
        }
        if (bgImg) bgImg.classList.add('hidden');
        if (canvas) canvas.style.background = '#000000';
        if (storySoundToggle) {
          storySoundToggle.classList.remove('hidden');
          storySoundToggle.innerHTML = isStoryMuted ? '<i class="fa-solid fa-volume-xmark text-xs"></i>' : '<i class="fa-solid fa-volume-high text-xs"></i>';
        }
      } 
      // Handle Image Background
      else if (bg && (bg.startsWith('http') || bg.startsWith('/'))) {
        if (storyVideo) { storyVideo.classList.add('hidden'); storyVideo.src = ''; }
        if (bgImg) {
          bgImg.src = bg;
          bgImg.classList.remove('hidden');
        }
        if (canvas) canvas.style.background = '#0b1120';
      } 
      // Handle Spiritual Gradient Backdrop
      else {
        if (storyVideo) { storyVideo.classList.add('hidden'); storyVideo.src = ''; }
        if (bgImg) {
          bgImg.src = '';
          bgImg.classList.add('hidden');
        }
        if (canvas) canvas.style.background = gradient;
      }

      // Handle Background Music / Audio
      if (audio) {
        if (storyAudio) {
          storyAudio.src = audio;
          storyAudio.muted = isStoryMuted;
          storyAudio.play().catch(() => {});
        }
        if (storyMusicBadge) {
          storyMusicBadge.classList.remove('hidden');
          storyMusicBadge.classList.add('flex');
        }
        if (storyMusicName) storyMusicName.textContent = audioName;
        if (storySoundToggle) {
          storySoundToggle.classList.remove('hidden');
          storySoundToggle.innerHTML = isStoryMuted ? '<i class="fa-solid fa-volume-xmark text-xs"></i>' : '<i class="fa-solid fa-volume-high text-xs"></i>';
        }
      } else if (!video) {
        if (storyMusicBadge) storyMusicBadge.classList.add('hidden');
        if (storySoundToggle) storySoundToggle.classList.add('hidden');
      }
      
      // Animate Story Progress Bar (7s duration)
      if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0%';
        setTimeout(() => {
          bar.style.transition = 'width 7s linear';
          bar.style.width = '100%';
        }, 50);
      }
      
      storyTimer = setTimeout(() => {
        stopStoryMedia();
        if (window.FI && typeof window.FI.closeModal === 'function') {
          window.FI.closeModal();
        }
      }, 7100);
      
      if (window.FI && typeof window.FI.openModal === 'function') {
        window.FI.openModal('modal-story');
      } else {
        const backdrop = $('#backdrop');
        if (backdrop && modal) {
          backdrop.classList.remove('hidden');
          backdrop.classList.add('flex');
          $$('.modal').forEach(m => m.classList.toggle('hidden', m.id !== 'modal-story'));
          document.body.style.overflow = 'hidden';
        }
      }
    }
  });

  $('#story-reply-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#story-reply-input');
    if (input && input.value.trim()) {
      input.value = '';
      stopStoryMedia();
      if (window.FI && typeof window.FI.closeModal === 'function') window.FI.closeModal();
      toast('Encouragement sent 🙏');
    }
  });

  async function loadVerse() { try { const result = await api.request('cv_bible_get_verses', { book: 'John', chapter: 3, version: 'KJV' }); const verse = (result.items || []).find(item => item.v === 16); if (!verse) return; const card = $$('#main h2').find(node => node.textContent.trim() === 'Verse of the Day')?.closest('section'); const english = card ? $$('blockquote p', card)[1] : null; if (english) english.textContent = `“${verse.text.trim()}”`; } catch (_) {} }
  document.addEventListener('click', event => { if (event.target.closest('[data-open-auth]')) window.FI.openAuth(); });
  // Start real home data in parallel with session initialization. FIData
  // de-duplicates the request when the session event fires moments later.
  if (feed) { loadPosts(); loadMembers(); loadPrayers(); api.request('cv_social_get_following').then(result => { followingIds = new Set((result.items || []).map(item => item.uid)); if (sortMode === 'Following') renderFeed(); }).catch(() => {}); }
  loadVerse();
})();
