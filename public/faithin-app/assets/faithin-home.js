/* eslint-disable @typescript-eslint/no-unused-vars, @next/next/no-location-assign-relative-destination */
/* Faith In — live home feed, composers, prayers, members and engagement. */
(() => {
  'use strict';
  const { $, $$, esc, toast, closeModal } = window.FI;
  const api = window.FIData;
  const feed = $('#posts');
  const needUser = () => window.FILive.requireUser();
  // Whatever the member chose as their default audience in Settings is what a
  // new post gets, unless the composer asks for something specific.
  const defaultAudience = () => (window.FILive && window.FILive.user && window.FILive.user.settings
    && window.FILive.user.settings.default_post_audience) || 'public';
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
    return `<div class="border-y border-line bg-raised grid gap-1 ${items.length > 1 ? 'grid-cols-2' : ''}" data-media>${items.slice(0, 4).map((item, itemIndex) => {
      const url = esc(mediaUrl(item.url || item.preview_url || item.local_url || ''));
      const hook = `data-media-item data-media-index="${itemIndex}" data-media-type="${esc(item.type || 'image')}" data-media-url="${url}"`;
      // preload="none": with metadata preloading, every feed render opened a
      // range request against Blob for every video on the page, and a video
      // whose blob is failing gets retried by the browser over and over. Wait
      // for an actual play. Use a poster when the item carries one.
      if (item.type === 'video') {
        const poster = esc(mediaUrl(item.thumbnail_url || item.poster_url || ''));
        return `<div class="fi-media-cell" ${hook}><video class="fi-feed-video" controls playsinline preload="none"${poster ? ` poster="${poster}"` : ''} src="${url}"></video><button type="button" class="fi-media-expand" data-media-open aria-label="Open video full screen"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></button></div>`;
      }
      if (item.type === 'audio') return `<div class="p-5"><audio class="w-full" controls src="${url}"></audio></div>`;
      return `<div class="fi-media-cell" ${hook}><img class="w-full max-h-[620px] object-cover" src="${url}" alt="Shared media" loading="lazy" decoding="async" data-media-open tabindex="0" role="button" aria-label="Open image full screen"></div>`;
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

  // ── media viewer ─────────────────────────────────────────────────────────
  // Facebook opens a photo by growing it out of the thumbnail rather than
  // fading a fresh panel over the top, so the eye keeps hold of which picture
  // it clicked. Same here: measure the thumbnail, measure where the full-size
  // media lands, animate between the two. Reduced-motion gets a plain fade.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function mediaFileName(url) {
    try {
      const name = decodeURIComponent(new URL(url, window.location.href).pathname.split('/').pop() || '');
      return /\.[a-z0-9]{2,5}$/i.test(name) ? name : '';
    } catch (_) { return ''; }
  }

  // A same-origin <a download> is not enough: this media lives on another
  // host, and a cross-origin download attribute is ignored — the browser
  // navigates instead. Pull the bytes down and hand over a blob so the file
  // saves under its own name. A store that refuses cross-origin reads can't
  // be blobbed, so fall back to opening it rather than failing silently.
  async function saveMedia(url, button) {
    const label = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Saving';
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error(String(response.status));
      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = mediaFileName(url) || ('faithin-' + Date.now());
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(href), 10000);
      button.innerHTML = '<i class="fa-solid fa-check"></i>Saved';
    } catch (_) {
      window.open(url, '_blank', 'noopener');
      button.innerHTML = '<i class="fa-solid fa-arrow-up-right-from-square"></i>Opened';
    }
    setTimeout(() => { button.disabled = false; button.innerHTML = label; }, 2200);
  }

  function openMediaViewer(items, startIndex, originCell) {
    if (!items.length) return;
    let index = Math.min(Math.max(startIndex, 0), items.length - 1);

    const view = document.createElement('div');
    view.className = 'fi-viewer';
    view.setAttribute('role', 'dialog');
    view.setAttribute('aria-modal', 'true');
    view.setAttribute('aria-label', 'Media viewer');
    view.innerHTML =
        '<div class="fi-viewer-bar">'
      +   '<span class="fi-viewer-count" data-viewer-count></span>'
      +   '<div class="fi-viewer-actions">'
      +     '<button type="button" class="fi-viewer-btn" data-viewer-save><i class="fa-solid fa-download"></i>Download</button>'
      +     '<button type="button" class="fi-viewer-btn is-icon" data-viewer-close aria-label="Close viewer"><i class="fa-solid fa-xmark"></i></button>'
      +   '</div>'
      + '</div>'
      + '<button type="button" class="fi-viewer-nav is-prev" data-viewer-prev aria-label="Previous"><i class="fa-solid fa-chevron-left"></i></button>'
      + '<div class="fi-viewer-stage" data-viewer-stage></div>'
      + '<button type="button" class="fi-viewer-nav is-next" data-viewer-next aria-label="Next"><i class="fa-solid fa-chevron-right"></i></button>';

    const stage = view.querySelector('[data-viewer-stage]');
    const counter = view.querySelector('[data-viewer-count]');
    const prevBtn = view.querySelector('[data-viewer-prev]');
    const nextBtn = view.querySelector('[data-viewer-next]');
    const saveBtn = view.querySelector('[data-viewer-save]');
    const scrollLock = document.body.style.overflow;

    function grow(el, fromNode) {
      if (reducedMotion.matches || !fromNode || !el.animate) return;
      const from = fromNode.getBoundingClientRect();
      const to = el.getBoundingClientRect();
      if (!from.width || !to.width) return;
      el.animate([
        {
          transform: 'translate(' + ((from.left + from.width / 2) - (to.left + to.width / 2)) + 'px,'
            + ((from.top + from.height / 2) - (to.top + to.height / 2)) + 'px) '
            + 'scale(' + (from.width / to.width) + ',' + (from.height / to.height) + ')',
          opacity: 0.35
        },
        { transform: 'none', opacity: 1 }
      ], { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' });
    }

    function render(fromNode) {
      const item = items[index];
      stage.innerHTML = item.type === 'video'
        ? '<video class="fi-viewer-media" controls autoplay playsinline src="' + esc(item.url) + '"></video>'
        : '<img class="fi-viewer-media" src="' + esc(item.url) + '" alt="Shared media">';
      counter.textContent = items.length > 1 ? (index + 1) + ' / ' + items.length : '';
      prevBtn.hidden = nextBtn.hidden = items.length < 2;
      const el = stage.firstElementChild;
      if (el.tagName === 'IMG' && !el.complete) el.addEventListener('load', () => grow(el, fromNode), { once: true });
      else grow(el, fromNode);
    }

    function step(delta) {
      index = (index + delta + items.length) % items.length;
      render(null);
    }

    function close() {
      const el = stage.firstElementChild;
      const media = stage.querySelector('video');
      if (media) { try { media.pause(); } catch (_) {} }
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = scrollLock;
      const back = items[index] && items[index].cell;
      if (!reducedMotion.matches && el && el.animate && back && back.isConnected) {
        const from = el.getBoundingClientRect();
        const to = back.getBoundingClientRect();
        if (from.width && to.width) {
          el.animate([
            { transform: 'none', opacity: 1 },
            {
              transform: 'translate(' + ((to.left + to.width / 2) - (from.left + from.width / 2)) + 'px,'
                + ((to.top + to.height / 2) - (from.top + from.height / 2)) + 'px) '
                + 'scale(' + (to.width / from.width) + ',' + (to.height / from.height) + ')',
              opacity: 0.2
            }
          ], { duration: 200, easing: 'cubic-bezier(.4,0,.2,1)' });
        }
      }
      view.classList.remove('is-open');
      setTimeout(() => view.remove(), reducedMotion.matches ? 0 : 200);
    }

    function onKey(event) {
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowRight') step(1);
      else if (event.key === 'ArrowLeft') step(-1);
    }

    view.addEventListener('click', event => {
      if (event.target === view || event.target === stage) return close();
      if (event.target.closest('[data-viewer-close]')) return close();
      if (event.target.closest('[data-viewer-prev]')) return step(-1);
      if (event.target.closest('[data-viewer-next]')) return step(1);
      const save = event.target.closest('[data-viewer-save]');
      if (save) saveMedia(items[index].url, save);
    });

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    document.body.appendChild(view);
    requestAnimationFrame(() => view.classList.add('is-open'));
    render(originCell);
    saveBtn.focus({ preventScroll: true });
  }

  function cellsOf(mediaBlock) {
    return Array.from(mediaBlock.querySelectorAll('[data-media-item]'))
      .map(cell => ({ type: cell.dataset.mediaType, url: cell.dataset.mediaUrl, cell }))
      .filter(item => item.url);
  }

  function openFromCell(cell) {
    const block = cell.closest('[data-media]');
    if (!block) return;
    const items = cellsOf(block);
    const at = items.findIndex(item => item.cell === cell);
    if (at < 0) return;
    openMediaViewer(items, at, cell);
  }

  feed?.addEventListener('click', event => {
    const trigger = event.target.closest('[data-media-open]');
    if (!trigger || !feed.contains(trigger)) return;
    const cell = trigger.closest('[data-media-item]');
    if (!cell) return;
    event.preventDefault();
    openFromCell(cell);
  });

  feed?.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const trigger = event.target.closest && event.target.closest('img[data-media-open]');
    if (!trigger) return;
    event.preventDefault();
    const cell = trigger.closest('[data-media-item]');
    if (cell) openFromCell(cell);
  });

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
      <header class="flex items-start gap-3 p-4 pb-2.5">
        <a href="${profileHref}" class="shrink-0 block">${avatar ? `<img class="avatar w-11 h-11 object-cover" src="${esc(avatar)}" alt="${esc(name)}">` : `<span class="avatar w-11 h-11 text-[14px]">${esc(api.initials(name))}</span>`}</a>
        <div class="min-w-0 flex-1"><div class="flex items-center gap-2 flex-wrap"><a href="${profileHref}" class="text-[14.5px] font-semibold hover:text-brand inline-flex items-center">${esc(name)}${window.FILive.verificationBadgeMarkup(author || post)}</a>${post.type && post.type !== 'post' ? `<span class="text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-soft text-brand-strong">${esc(post.type)}</span>` : ''}</div><p class="text-[12px] text-muted mt-0.5">${esc(post.time || 'just now')} · ${esc(post.visibility || 'Public')}</p></div>
        ${!owner && uid ? `<button class="btn ${isFollowing ? 'btn-neutral' : 'btn-outline'} !py-1 !px-3 !text-[13px]" data-live-follow><i class="fa-solid ${isFollowing ? 'fa-check' : 'fa-plus'} text-[11px] mr-1"></i>${isFollowing ? 'Following' : 'Follow'}</button>` : ''}
        ${owner ? `<button class="icon-btn" data-live-delete aria-label="Delete post"><i class="fa-regular fa-trash-can"></i></button>` : ''}
      </header>
      ${post.article_title ? `<div class="px-4 pt-1"><h3 class="font-serif text-[22px] font-semibold">${esc(post.article_title)}</h3></div>` : ''}
      ${body ? `<div class="px-4 pb-3"><p class="text-[14.5px] leading-relaxed whitespace-pre-wrap">${esc(body)}</p></div>` : ''}
      ${mediaHTML(post)}
      <div class="px-4 py-2 flex items-center justify-between text-[12px] text-muted border-b border-line"><span class="flex items-center gap-1.5"><span class="w-[18px] h-[18px] rounded-full bg-brand text-white grid place-items-center text-[9px]"><i class="fa-solid fa-hands-praying"></i></span><span data-likecount>${Number(post.reaction_count || 0)}</span></span><span class="flex gap-3"><button type="button" data-comment-toggle>${Number(post.comment_count || 0)} comments</button><span data-sharecount>${Number(post.share_count || 0)} shares</span></span></div>
      <div class="flex items-center gap-1 px-2 py-1">
        <div class="faith-reaction-wrap" data-faith-reaction-wrap>
          <div class="faith-reaction-popup" role="menu" aria-label="Choose a faith reaction">
            ${Object.entries(faithReactions).map(([key, reaction]) => `<button type="button" class="faith-reaction-option ${reaction.tone} ${selectedReaction === key ? 'is-selected' : ''}" data-live-reaction="${key}" role="menuitem" aria-label="${reaction.label}" aria-pressed="${selectedReaction === key}"><span class="faith-reaction-bubble"><i class="fa-solid ${reaction.icon}"></i></span><span class="faith-reaction-tooltip">${reaction.label}</span></button>`).join('')}
          </div>
          <button type="button" class="action-btn faith-reaction-trigger ${selectedReaction ? `is-on ${selectedMeta.tone}` : ''}" data-live-reaction-trigger data-selected-reaction="${selectedReaction}" aria-pressed="${!!selectedReaction}" aria-haspopup="menu"><i class="fa-solid ${selectedMeta.icon}"></i><span>${selectedReaction ? selectedMeta.label : 'Amen'}</span></button>
        </div>
        <button type="button" class="action-btn" data-comment-toggle><i class="fa-regular fa-comment"></i>Comment</button><button type="button" class="action-btn" data-live-share><i class="fa-solid fa-share-nodes"></i>Share</button><button type="button" class="action-btn ${saved ? '!text-brand' : ''}" data-live-save aria-pressed="${saved}"><i class="fa-${saved ? 'solid' : 'regular'} fa-bookmark"></i><span class="hidden sm:inline">Save</span></button>
      </div>
      <div class="hidden border-t border-line p-3.5" data-comments><div class="space-y-2 mb-3" data-comment-list></div><form class="flex items-center gap-2.5" data-comment-form>${window.FILive.avatarMarkup(current || { name: 'Me' }, 'avatar w-9 h-9 text-[11px] object-cover')}<input name="content" class="field !rounded-pill" placeholder="Write a thoughtful comment…" required><button class="icon-btn text-brand"><i class="fa-solid fa-paper-plane"></i></button></form></div>
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
      const blessingImage = mediaUrl(media?.url || media?.preview_url || post.cover_image_url || '');
      const authorPhoto = author.uid === current.uid ? currentPhoto : (author.avatar_url || author.avatar || '');
      const avatar = authorPhoto ? `<img class="absolute top-2.5 left-2.5 avatar w-9 h-9 object-cover ring-[3px] ring-white/80" src="${esc(authorPhoto)}" alt="${esc(author.name || 'Faith In member')}">` : `<span class="absolute top-2.5 left-2.5 avatar w-9 h-9 text-[11px] ring-[3px] ring-white/80">${esc(api.initials(author.name))}</span>`;
      return `<button class="snap-start shrink-0 w-[112px] h-[172px] rounded-card overflow-hidden relative text-left text-white" style="background:linear-gradient(180deg,${colors[index % colors.length]},#111827)" data-blessing-post="${esc(post.id)}">${blessingImage ? `<img class="absolute inset-0 w-full h-full object-cover" src="${esc(blessingImage)}" alt="Blessing image"><span class="absolute inset-0" style="background:linear-gradient(180deg,rgba(0,0,0,.2),rgba(0,0,0,.35) 48%,rgba(0,0,0,.78))"></span>` : ''}${avatar}<span class="absolute inset-x-3 top-1/2 -translate-y-1/2 text-center font-serif italic text-[13px] line-clamp-4">${esc(post.content || 'Shared a blessing')}</span><span class="absolute bottom-2.5 left-3 right-3 text-[11.5px] font-semibold truncate">${esc(author.name || 'Faith In Member')}</span></button>`;
    }).join('');
    syncRailArrows(rail);
  }

  // The rail's scroll arrows only mean something when there is somewhere to
  // scroll; with one or two blessings they pointed at empty space.
  function syncRailArrows(rail) {
    const arrows = $$('[data-rail-prev],[data-rail-next]');
    if (!arrows.length) return;
    const apply = () => {
      const scrollable = rail.scrollWidth > rail.clientWidth + 4;
      arrows.forEach(button => { button.style.display = scrollable ? '' : 'none'; });
    };
    apply();
    if (!rail.dataset.railArrowsBound) {
      rail.dataset.railArrowsBound = '1';
      window.addEventListener('resize', apply, { passive: true });
    }
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
    const oversize = chosen.find(file => file.size > 50 * 1024 * 1024);
    if (oversize) return toast(`${oversize.name} is larger than the free 50MB limit.`);
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
  postBtn?.addEventListener('click', async () => { if (!needUser()) return; busy(postBtn, true, blessingMediaFiles.length ? 'Uploading' : 'Posting'); try { const files = blessingMediaFiles.length ? { 'post_media[]': blessingMediaFiles } : {}; await api.request('cv_create_post', { content: ta.value.trim(), type: 'blessing', visibility: defaultAudience() }, files); ta.value = ''; clearBlessingMedia(); closeModal(); toast('Your blessing is live 🕊️'); await loadPosts(); } catch (error) { toast(error.message); } finally { busy(postBtn, false, 'Post'); ta.dispatchEvent(new Event('input')); } });

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
  photoDone?.addEventListener('click', async () => { if (!needUser()) return; if (!selectedFiles.length) return toast(mediaMode === 'video' ? 'Choose a video.' : 'Choose at least one photo.'); busy(photoDone, true, 'Uploading'); try { await api.request('cv_create_post', { type: mediaMode === 'video' ? 'video' : 'post', visibility: defaultAudience() }, { 'post_media[]': selectedFiles }); closeModal(); toast(mediaMode === 'video' ? 'Video shared' : 'Photos shared'); showFiles([]); await loadPosts(); } catch (error) { toast(error.message); } finally { busy(photoDone, false, 'Done'); } });

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
        visibility: defaultAudience()
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
  // ── share sheet ──────────────────────────────────────────────────────────
  // Share used to copy a link and stop there, and the link it copied had no
  // preview data on it, so pasting into Facebook produced the generic site
  // card rather than the post. Now it offers the usual destinations and
  // hands each one a permalink carrying the post's own picture.
  //
  // Brand glyphs are inline SVG: the stylesheet names Font Awesome's brand
  // icons but the brands webfont is not bundled, so `fa-brands` renders as
  // empty boxes. Four paths beat shipping a font for four glyphs.
  const SHARE_MARKS = {
    facebook: 'M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.9h-2.33V22c4.78-.79 8.44-4.93 8.44-9.94z',
    x: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.66l7.73-8.84L1.24 2.25h6.83l4.71 6.23 5.46-6.23zm-1.16 17.52h1.83L7.01 4.13H5.05l12.03 15.64z',
    telegram: 'M21.94 4.6 18.6 20.3c-.25 1.1-.9 1.38-1.83.86l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.14 9.36-8.46c.4-.36-.09-.56-.63-.2L5.78 13.2.8 11.65c-1.08-.34-1.1-1.08.23-1.6L20.54 3.02c.9-.33 1.69.2 1.4 1.58z',
    whatsapp: 'M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.5a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.18 4.22-9.4 9.41-9.4a9.34 9.34 0 0 1 6.65 2.76 9.32 9.32 0 0 1 2.75 6.65c0 5.18-4.22 9.4-9.4 9.4zM20.52 3.45A11.28 11.28 0 0 0 12.05 0C5.86 0 .83 5.03.83 11.21c0 1.98.52 3.9 1.5 5.6L.74 24l7.34-1.92a11.2 11.2 0 0 0 3.96.72c6.19 0 11.22-5.03 11.22-11.21 0-3-1.17-5.81-3.29-7.93z'
  };

  const SHARE_TARGETS = [
    { key: 'facebook', label: 'Facebook', tone: '#1877F2',
      href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { key: 'x', label: 'X', tone: '#000000',
      href: (url, text) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
    { key: 'telegram', label: 'Telegram', tone: '#229ED9',
      href: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
    { key: 'whatsapp', label: 'WhatsApp', tone: '#25D366',
      href: (url, text) => `https://api.whatsapp.com/send?text=${encodeURIComponent(text ? `${text}\n${url}` : url)}` }
  ];

  // The permalink carries the post's own media and text, because the crawler
  // that builds the preview cannot read the post itself — Firestore wants a
  // verified member and the server holds no service account. /post/[id]
  // only honours media hosted on FaithIn's own storage.
  function permalinkFor(post) {
    const base = `${location.origin}/post/${encodeURIComponent(post.id)}`;
    const params = new URLSearchParams();
    const media = Array.isArray(post.media_items) ? post.media_items : [];
    const item = media[0] || (post.cover_image_url ? { type: 'image', url: post.cover_image_url } : null);
    if (item) {
      const url = mediaUrl(item.url || item.preview_url || item.local_url || '');
      const poster = mediaUrl(item.thumbnail_url || item.poster_url || '');
      if (url && item.type === 'video') {
        params.set('v', url);
        if (poster) params.set('i', poster);
      } else if (url && item.type !== 'audio') {
        params.set('i', url);
      }
    }
    const text = String(post.content || '').trim();
    if (text) params.set('t', text.slice(0, 300));
    const author = String((post.author && post.author.name) || '').trim();
    if (author) params.set('a', author.slice(0, 60));
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  }

  function countShare(post) {
    api.request('cv_share_post', { post_id: post.id }).then(result => {
      const count = Number(result?.share_count ?? 0);
      patchPost(post.id, { share_count: count });
      const article = $(`[data-post-id="${CSS.escape(String(post.id))}"]`);
      const label = article && $('[data-sharecount]', article);
      if (label) label.textContent = `${count} shares`;
    }).catch(() => {});
  }

  function openShareSheet(post) {
    const url = permalinkFor(post);
    const text = String(post.content || '').trim().slice(0, 160);
    // A followers-only or private post must not get one-click buttons to the
    // open internet. The link still copies, for sending to someone directly.
    const isPublic = String(post.visibility || 'public').toLowerCase() === 'public';

    const sheet = document.createElement('div');
    sheet.className = 'fi-share';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', 'Share this post');
    sheet.innerHTML =
        '<div class="fi-share-card">'
      +   '<div class="fi-share-head"><h2>Share this post</h2>'
      +     '<button type="button" class="fi-share-close" data-share-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div>'
      +   (isPublic
            ? '<div class="fi-share-grid">' + SHARE_TARGETS.map(target =>
                `<button type="button" class="fi-share-target" data-share-to="${target.key}">`
                + `<span class="fi-share-mark" style="background:${target.tone}">`
                + `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${SHARE_MARKS[target.key]}"></path></svg>`
                + `</span><span>${esc(target.label)}</span></button>`).join('') + '</div>'
            : '<p class="fi-share-note"><i class="fa-solid fa-lock"></i>This post is not public, so it has no buttons to the open internet. The link still works for anyone who can already see it.</p>')
      +   '<div class="fi-share-link"><input type="text" readonly value="' + esc(url) + '" data-share-url aria-label="Post link">'
      +     '<button type="button" class="fi-share-copy" data-share-copy>Copy</button></div>'
      +   (navigator.share ? '<button type="button" class="fi-share-native" data-share-native><i class="fa-solid fa-share-nodes"></i>More…</button>' : '')
      + '</div>';

    const scrollLock = document.body.style.overflow;
    function close() {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = scrollLock;
      sheet.remove();
    }
    function onKey(event) { if (event.key === 'Escape') close(); }

    sheet.addEventListener('click', async event => {
      if (event.target === sheet || event.target.closest('[data-share-close]')) return close();

      const target = event.target.closest('[data-share-to]');
      if (target) {
        const spec = SHARE_TARGETS.find(entry => entry.key === target.dataset.shareTo);
        if (spec) {
          window.open(spec.href(url, text), '_blank', 'noopener,width=640,height=640');
          countShare(post);
          close();
        }
        return;
      }

      if (event.target.closest('[data-share-copy]')) {
        try {
          await navigator.clipboard.writeText(url);
          toast('Post link copied');
        } catch (_) {
          $('[data-share-url]', sheet)?.select();
          toast('Press Ctrl+C to copy the link');
        }
        countShare(post);
        return;
      }

      if (event.target.closest('[data-share-native]')) {
        try {
          await navigator.share({ title: 'Faith In', text, url });
          countShare(post);
          close();
        } catch (_) {}
      }
    });

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    document.body.appendChild(sheet);
    requestAnimationFrame(() => sheet.classList.add('is-open'));
  }

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
      trigger.className = `action-btn faith-reaction-trigger${selectedReaction ? ` is-on ${meta.tone}` : ''}`;
      trigger.dataset.selectedReaction = selectedReaction || '';
      trigger.setAttribute('aria-pressed', String(!!selectedReaction));
      trigger.innerHTML = `<i class="fa-solid ${meta.icon}"></i><span>${selectedReaction ? meta.label : 'Amen'}</span>`;
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
      // Count the share when one actually happens, not when the sheet opens.
      openShareSheet(loadedPosts.find(item => String(item.id) === String(id)) || { id });
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
  async function loadVerse() { try { const result = await api.request('cv_bible_get_verses', { book: 'John', chapter: 3, version: 'KJV' }); const verse = (result.items || []).find(item => item.v === 16); if (!verse) return; const card = $$('#main h2').find(node => node.textContent.trim() === 'Verse of the Day')?.closest('section'); const english = card ? $$('blockquote p', card)[1] : null; if (english) english.textContent = `“${verse.text.trim()}”`; } catch (_) {} }
  document.addEventListener('click', event => { if (event.target.closest('[data-open-auth]')) window.FI.openAuth(); });
  // Start real home data in parallel with session initialization. FIData
  // de-duplicates the request when the session event fires moments later.
  if (feed) { loadPosts(); loadMembers(); loadPrayers(); api.request('cv_social_get_following').then(result => { followingIds = new Set((result.items || []).map(item => item.uid)); if (sortMode === 'Following') renderFeed(); }).catch(() => {}); }
  loadVerse();
})();
