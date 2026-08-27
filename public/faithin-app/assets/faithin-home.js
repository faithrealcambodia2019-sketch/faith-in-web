/* Faith In — Home feed behaviour (composer, stories, feed, article editor). */
(() => {
  'use strict';
  const { $, $$, esc, toast, openModal, closeModal } = window.FI;

  /* ── sort ───────────────────────────────────────────────────────────────── */
  $$('[data-sort]').forEach(b => b.addEventListener('click', () => {
    $('[data-sort-label]').textContent = b.dataset.sort;
    toast('Feed sorted by ' + b.dataset.sort);
  }));

  /* ── blessing composer ──────────────────────────────────────────────────── */
  const ta = $('#blessing-text'), postBtn = $('#blessing-post'), count = $('#blessing-count');
  ta.addEventListener('input', () => {
    count.textContent = `${ta.value.length}/600`;
    postBtn.disabled = ta.value.trim().length === 0;
  });
  $$('[data-chip]').forEach(c => c.addEventListener('click', () => {
    ta.value = (ta.value.trim() + ' ' + c.textContent).trim() + ' ';
    ta.dispatchEvent(new Event('input')); ta.focus();
  }));
  postBtn.addEventListener('click', () => {
    prependPost({
      name: 'Hun Chet', initials: 'HC', grad: 'linear-gradient(135deg,#2f5bea,#1e40af)',
      meta: 'Just now', text: ta.value.trim(), likes: 0, comments: 0, shares: 0, badge: 'Blessing'
    });
    ta.value = ''; ta.dispatchEvent(new Event('input'));
    closeModal(); toast('Your blessing is live 🕊️');
  });

  /* ── photo dropzone ─────────────────────────────────────────────────────── */
  const dz = $('#dropzone'), fi = $('#file-input'), pv = $('#preview');
  function showFiles(files) {
    pv.innerHTML = ''; if (!files.length) return;
    pv.classList.remove('hidden');
    [...files].slice(0, 8).forEach(f => {
      const img = document.createElement('img');
      img.className = 'w-full aspect-square object-cover rounded-lg border border-line';
      img.src = URL.createObjectURL(f); img.alt = f.name;
      pv.appendChild(img);
    });
  }
  fi.addEventListener('change', () => showFiles(fi.files));
  ['dragover', 'dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => {
    e.preventDefault();
    dz.classList.toggle('border-brand', ev === 'dragover');
    if (ev === 'drop') showFiles(e.dataTransfer.files);
  }));

  /* ── article toolbar ────────────────────────────────────────────────────── */
  $$('#editor-tools [data-cmd]').forEach(b => b.addEventListener('mousedown', e => {
    e.preventDefault();
    document.execCommand(b.dataset.cmd, false, b.dataset.arg || null);
    $('#article-body').focus();
  }));

  /* ── story viewer ───────────────────────────────────────────────────────── */
  let storyTimer;
  document.addEventListener('fi:modalclose', () => clearInterval(storyTimer));
  $$('[data-story]').forEach(b => b.addEventListener('click', () => {
    const [text, name] = b.dataset.story.split('|');
    const el = $('#story-text');
    el.textContent = text;
    el.className = el.className.replace(/font-(khmer|serif)/, /[ក-៿]/.test(text) ? 'font-khmer' : 'font-serif');
    $('#story-name').textContent = name;
    $('#story-initials').textContent = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    $('#story-canvas').style.background = b.style.background;
    openModal('modal-story');
    const bar = $('#story-bar'); let p = 0; bar.style.width = '0%';
    clearInterval(storyTimer);
    storyTimer = setInterval(() => {
      p += 1.2; bar.style.width = p + '%';
      if (p >= 100) { clearInterval(storyTimer); closeModal(); }
    }, 60);
  }));

  /* ── blessings rail ─────────────────────────────────────────────────────── */
  const rail = $('[data-rail]');
  $('[data-rail-next]')?.addEventListener('click', () => rail.scrollBy({ left: 240, behavior: 'smooth' }));

  /* ── verse copy ─────────────────────────────────────────────────────────── */
  $('[data-copy-verse]')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('"For God so loved the world, that he gave his only begotten Son." — John 3:16');
      toast('Verse copied');
    } catch { toast('Copy not available here'); }
  });

  /* ── prayer wall ────────────────────────────────────────────────────────── */
  $$('[data-pray]').forEach(b => b.addEventListener('click', () => {
    b.textContent = '🙏 Praying'; b.classList.add('text-rose'); b.disabled = true; toast('Thank you for praying');
  }));

  /* ── contacts ───────────────────────────────────────────────────────────── */
  const contacts = [
    { name: 'Hun Chet',    role: 'Christian creator',          initials: 'HC', color: '#2f5bea', online: true },
    { name: 'Sophea Lim',  role: 'Worship leader · Siem Reap', initials: 'SL', color: '#0f766e', online: true },
    { name: 'Bible Verse', role: 'Daily scripture',            initials: 'BV', color: '#7c3aed', online: false },
    { name: 'Dara Nou',    role: 'Youth pastor',               initials: 'DN', color: '#b45309', online: false }
  ];
  $('#contacts').innerHTML = contacts.map(c => `
    <li class="flex items-start gap-3 p-2 rounded-xl hover:bg-raised transition">
      <span class="relative shrink-0">
        <span class="avatar w-10 h-10 text-[12px]" style="background:${c.color}">${esc(c.initials)}</span>
        ${c.online ? '<span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-surface"></span>' : ''}
      </span>
      <span class="min-w-0 flex-1">
        <a href="#" class="block text-[13.5px] font-semibold truncate hover:text-brand hover:underline">${esc(c.name)}</a>
        <span class="block text-[12px] text-muted truncate">${esc(c.role)}</span>
      </span>
      <button class="btn btn-ghost !px-3 !py-1 !text-[12.5px] border border-line shrink-0"><i class="fa-regular fa-paper-plane text-[10px]"></i>Message</button>
    </li>`).join('');

  /* ── feed ───────────────────────────────────────────────────────────────── */
  const posts = [
    {
      name: 'Hun Chet', initials: 'HC', grad: 'linear-gradient(135deg,#2f5bea,#1e40af)', meta: 'Aug 15 · Public',
      badge: 'Testimony',
      text: 'Sharing some thoughts and blessings today. God has been faithful through a long season of waiting — the job came through this week.',
      image: true, imageText: 'ព្រះគុណនៃព្រះ', likes: 24, comments: 5, shares: 2, follow: true
    },
    {
      name: 'Sophea Lim', initials: 'SL', grad: 'linear-gradient(135deg,#0f766e,#052e2b)', meta: '6h · Public',
      badge: 'Verse',
      verse: {
        km: '«ព្រះអម្ចាស់ជាអ្នកគង្វាលរបស់ខ្ញុំ ខ្ញុំមិនខ្វះអ្វីឡើយ»',
        en: '"The Lord is my shepherd; I shall not want."',
        ref: 'ទំនុកតម្កើង ២៣:១ · Psalm 23:1'
      },
      text: 'Praying this over everyone starting a hard week.', likes: 112, comments: 18, shares: 9, follow: false
    },
    {
      name: 'Dara Nou', initials: 'DN', grad: 'linear-gradient(135deg,#b45309,#451a03)', meta: 'Yesterday · Public',
      badge: 'Prayer',
      text: 'Our youth group in Battambang is praying for 40 days. If you have a request, drop it below and we will carry it with you. 🙏',
      likes: 58, comments: 31, shares: 4, follow: true
    }
  ];

  function postHTML(p) {
    const badge = p.badge ? `<span class="text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-soft text-brand-strong">${esc(p.badge)}</span>` : '';
    const media = p.verse ? `
      <div class="mx-4 mb-3 rounded-xl border border-line bg-raised p-4 space-y-2.5">
        <p class="font-khmer text-[14px] leading-[1.9]">${esc(p.verse.km)}</p>
        <p class="font-serif italic text-[14.5px]">${esc(p.verse.en)}</p>
        <p class="text-[11px] font-bold uppercase tracking-wide text-muted">${esc(p.verse.ref)}</p>
      </div>` : (p.image ? `
      <div class="media-plate border-y border-line grid place-items-center h-[280px]">
        <span class="font-khmer text-[22px] opacity-70">${esc(p.imageText || '')}</span>
      </div>` : '');

    return `
    <article class="card overflow-hidden animate-fade-up">
      <header class="flex items-start gap-3 p-4 pb-2.5">
        <span class="avatar w-11 h-11 text-[14px]" style="background:${p.grad}">${esc(p.initials)}</span>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <a href="#" class="text-[14.5px] font-semibold hover:text-brand hover:underline">${esc(p.name)}</a>
            ${badge}
          </div>
          <p class="text-[12px] text-muted mt-0.5">${esc(p.meta)}</p>
        </div>
        ${p.follow ? '<button class="btn btn-outline !py-1 !px-3 !text-[13px]" data-follow="Following"><i class="fa-solid fa-plus text-[11px]"></i>Follow</button>' : ''}
        <button class="icon-btn" aria-label="Post options"><i class="fa-solid fa-ellipsis"></i></button>
      </header>
      <div class="px-4 pb-3"><p class="text-[14.5px] leading-relaxed text-ink/90">${esc(p.text)}</p></div>
      ${media}
      <div class="px-4 py-2 flex items-center justify-between text-[12px] text-muted border-b border-line">
        <span class="flex items-center gap-1.5">
          <span class="w-[18px] h-[18px] rounded-full bg-brand text-white dark:text-[#0b1120] grid place-items-center text-[9px]"><i class="fa-solid fa-hands-praying"></i></span>
          <span data-likecount>${p.likes}</span>
        </span>
        <span class="flex gap-3">
          <a href="#" class="hover:text-brand hover:underline">${p.comments} comments</a>
          <a href="#" class="hover:text-brand hover:underline">${p.shares} shares</a>
        </span>
      </div>
      <div class="flex items-center gap-1 px-2 py-1">
        <button class="action-btn" data-like><i class="fa-regular fa-hands-praying"></i>Amen</button>
        <button class="action-btn" data-comment-toggle><i class="fa-regular fa-comment"></i>Comment</button>
        <button class="action-btn" data-toast="Link copied to clipboard"><i class="fa-solid fa-share-nodes"></i>Share</button>
        <button class="action-btn" data-save><i class="fa-regular fa-bookmark"></i><span class="hidden sm:inline">Save</span></button>
      </div>
      <div class="hidden border-t border-line p-3.5" data-comments>
        <div class="flex items-center gap-2.5">
          <span class="avatar w-9 h-9 text-[11px]" style="background:linear-gradient(135deg,#2f5bea,#1e40af)">HC</span>
          <input class="field !rounded-pill" placeholder="Write a thoughtful comment…">
        </div>
      </div>
    </article>`;
  }

  const feed = $('#posts');
  feed.innerHTML = posts.map(postHTML).join('');

  function prependPost(p) {
    feed.insertAdjacentHTML('afterbegin', postHTML(Object.assign({ meta: 'Just now', follow: false }, p)));
  }

  feed.addEventListener('click', e => {
    const like = e.target.closest('[data-like]');
    if (like) {
      const n = $('[data-likecount]', like.closest('article'));
      const on = like.classList.toggle('is-on');
      $('i', like).className = on ? 'fa-solid fa-hands-praying animate-heart' : 'fa-regular fa-hands-praying';
      n.textContent = Number(n.textContent) + (on ? 1 : -1);
      return;
    }
    const ct = e.target.closest('[data-comment-toggle]');
    if (ct) {
      const box = $('[data-comments]', ct.closest('article'));
      box.classList.toggle('hidden');
      if (!box.classList.contains('hidden')) $('input', box).focus();
    }
  });

  /* ── load more ──────────────────────────────────────────────────────────── */
  $('#load-more').addEventListener('click', function () {
    this.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-[12px]"></i> Loading';
    setTimeout(() => {
      feed.insertAdjacentHTML('beforeend', posts.map(p => postHTML(Object.assign({}, p, { meta: 'Last week · Public' }))).join(''));
      this.innerHTML = '<i class="fa-solid fa-arrow-down text-[12px]"></i> Load more posts';
    }, 700);
  });
})();
