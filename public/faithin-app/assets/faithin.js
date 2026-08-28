/* ==========================================================================
   Faith In — shared chrome and behaviour
   Mounts the header, the mobile tab bar and the toast host, then wires the
   interactions every page shares: theme, dropdowns, modals, shortcuts.

   Each page declares itself on <body>:
     data-page   = home | library | network | jobs | notifications
     data-search = placeholder text for the header search field
   Exposes window.FI for page-specific scripts.
   ========================================================================== */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const page   = document.body.dataset.page || 'home';
  const search = document.body.dataset.search || 'Search Faith In';

  const NAV = [
    { id: 'home',    href: '/home',          icon: 'fa-house',       label: 'Home' },
    { id: 'library', href: '/library',        icon: 'fa-book-open',   label: 'Library' },
    { id: 'network', href: '/network',        icon: 'fa-user-group',  label: 'Network' },
    { id: 'jobs',    href: '/jobs',           icon: 'fa-briefcase',   label: 'Jobs' }
  ];

  /* ── theme ──────────────────────────────────────────────────────────────────
     Three modes: 'system' (default), 'light', 'dark'. Held in memory only —
     persist it server-side with the user's account preferences.
     ------------------------------------------------------------------------ */
  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  let themeMode = 'system';

  function applyTheme() {
    const dark = themeMode === 'dark' || (themeMode === 'system' && prefersDark.matches);
    root.classList.toggle('dark', dark);
    document.dispatchEvent(new CustomEvent('fi:theme', { detail: { mode: themeMode, dark } }));
  }
  function setTheme(mode) { themeMode = mode; applyTheme(); }
  prefersDark.addEventListener('change', () => { if (themeMode === 'system') applyTheme(); });
  applyTheme();

  /* ── header + mobile tab bar + toast host ───────────────────────────────── */
  function mountChrome() {
    const topNav = NAV.map(n => `
      <a href="${n.href}" class="top-link"${n.id === page ? ' aria-current="page"' : ''}>
        <i class="fa-solid ${n.icon}"></i>${n.label}
      </a>`).join('');

    const bellActive = page === 'notifications';

    const header = document.createElement('header');
    header.className = 'sticky top-0 z-50 bg-surface/85 backdrop-blur-xl border-b border-line';
    header.innerHTML = `
      <div class="max-w-[1200px] mx-auto h-[56px] px-3 sm:px-4 flex items-center gap-3">

        <a href="/home" class="flex items-center gap-1.5 shrink-0 text-brand" aria-label="Faith In home">
          <span class="text-[22px] font-extrabold tracking-tight leading-none">FaithIn</span>
          <i class="fa-solid fa-globe text-[15px]"></i>
        </a>

        <div class="relative flex-1 max-w-[320px] hidden md:block">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-faint pointer-events-none"></i>
          <input id="search" type="search" placeholder="${esc(search)}"
                 class="w-full pl-10 pr-11 py-2 text-[14px] rounded-pill bg-raised border border-line placeholder:text-faint focus:bg-surface focus:border-brand outline-none transition">
          <kbd class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-faint bg-surface border border-line rounded px-1.5 py-0.5 pointer-events-none">/</kbd>
        </div>

        <nav class="hidden lg:flex items-stretch h-[56px] mx-auto" aria-label="Primary">${topNav}</nav>

        <div class="flex items-center gap-1 ml-auto lg:ml-0">
          <button class="icon-btn md:hidden" data-search-toggle aria-label="Search"><i class="fa-solid fa-magnifying-glass"></i></button>
          <button class="icon-btn" id="theme-toggle" aria-label="Toggle dark mode">
            <i class="fa-solid fa-moon dark:hidden"></i><i class="fa-solid fa-sun hidden dark:inline"></i>
          </button>
          <button class="icon-btn hidden sm:inline-flex" aria-label="Apps"><i class="fa-solid fa-table-cells"></i></button>
          <a href="/messages" class="icon-btn relative${page === 'messaging' ? ' !bg-brand !text-white dark:!text-[#0b1120]' : ''}" aria-label="Messages"${page === 'messaging' ? ' aria-current="page"' : ''}>
            <i class="fa-${page === 'messaging' ? 'solid' : 'regular'} fa-comment-dots"></i>
            <span class="hidden absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose text-white text-[10px] font-bold grid place-items-center ring-2 ring-surface" data-msg-badge>0</span>
          </a>
          <a href="/notifications" class="icon-btn relative ${bellActive ? '!bg-brand !text-white dark:!text-[#0b1120]' : ''}" aria-label="Notifications, 3 unread"${bellActive ? ' aria-current="page"' : ''}>
            <i class="fa-${bellActive ? 'solid' : 'regular'} fa-bell"></i>
            <span class="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose text-white text-[10px] font-bold grid place-items-center ring-2 ring-surface">3</span>
          </a>

          <div class="relative ml-1" data-menu-root>
            <button class="flex items-center gap-1.5 rounded-pill p-0.5 pr-1.5 hover:bg-raised transition${['profile','settings'].includes(page) ? ' ring-2 ring-brand ring-offset-2 ring-offset-surface' : ''}" data-menu-btn aria-haspopup="menu" aria-expanded="false">
              <span class="avatar w-8 h-8 text-[12px]" style="background:linear-gradient(135deg,#2f5bea,#1e40af)">HC</span>
              <i class="fa-solid fa-chevron-down text-[10px] text-faint"></i>
            </button>
            <div class="absolute right-0 mt-2 w-60 card shadow-pop p-1.5 hidden animate-pop-in" data-menu role="menu">
              <div class="px-3 py-2.5 flex items-center gap-3 border-b border-line mb-1.5">
                <span class="avatar w-10 h-10 text-[13px]" style="background:linear-gradient(135deg,#2f5bea,#1e40af)">HC</span>
                <div class="min-w-0">
                  <p class="text-[14px] font-semibold truncate">Hun Chet</p>
                  <p class="text-[12px] text-muted truncate">Faith In member</p>
                </div>
              </div>
              <a href="/profile" class="side-link${page === 'profile' ? ' is-active' : ''}" role="menuitem"><i class="fa-regular fa-user"></i>View profile</a>
              <a href="/library?view=saved" class="side-link" role="menuitem"><i class="fa-solid fa-bookmark"></i>Saved items</a>
              <a href="/settings" class="side-link${page === 'settings' ? ' is-active' : ''}" role="menuitem"><i class="fa-solid fa-gear"></i>Settings</a>
              <div class="my-1.5 border-t border-line"></div>
              <a href="/home" class="side-link" role="menuitem"><i class="fa-solid fa-arrow-right-from-bracket"></i>Sign out</a>
            </div>
          </div>
        </div>
      </div>

      <div class="md:hidden hidden px-3 pb-3" data-search-panel>
        <div class="relative">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-faint"></i>
          <input type="search" placeholder="${esc(search)}" class="w-full pl-10 pr-3 py-2.5 text-[14px] rounded-pill bg-raised border border-line outline-none focus:border-brand">
        </div>
      </div>`;

    const tabs = document.createElement('nav');
    tabs.className = 'lg:hidden fixed bottom-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-line pb-[env(safe-area-inset-bottom)]';
    tabs.setAttribute('aria-label', 'Mobile');
    tabs.innerHTML = `
      <div class="grid grid-cols-5 h-14">
        <a href="/home" class="top-link min-w-0"${page === 'home' ? ' aria-current="page"' : ''}><i class="fa-solid fa-house"></i>Home</a>
        <a href="/network" class="top-link min-w-0"${page === 'network' ? ' aria-current="page"' : ''}><i class="fa-solid fa-user-group"></i>Network</a>
        <button class="grid place-items-center" data-modal-open="modal-blessing" data-fallback="/home" aria-label="Add blessing">
          <span class="w-11 h-11 rounded-full bg-brand text-white dark:text-[#0b1120] grid place-items-center shadow-lift"><i class="fa-solid fa-plus"></i></span>
        </button>
        <a href="/jobs" class="top-link min-w-0"${page === 'jobs' ? ' aria-current="page"' : ''}><i class="fa-solid fa-briefcase"></i>Jobs</a>
        <a href="/library" class="top-link min-w-0"${page === 'library' ? ' aria-current="page"' : ''}><i class="fa-solid fa-book-open"></i>Library</a>
      </div>`;

    const toasts = document.createElement('div');
    toasts.id = 'toasts';
    toasts.className = 'fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[150] flex flex-col items-center gap-2 pointer-events-none';

    const skip = document.createElement('a');
    skip.href = '#main';
    skip.className = 'sr-only focus:not-sr-only focus:fixed focus:z-[200] focus:top-3 focus:left-3 focus:bg-surface focus:text-ink focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-pop';
    skip.textContent = 'Skip to content';

    document.body.prepend(skip, header);
    document.body.append(tabs, toasts);
  }

  mountChrome();

  /* Warm clean page documents before navigation without blocking this page. */
  const warmedPages = new Set();
  function warmPage(link) {
    if (!link || link.origin !== location.origin || warmedPages.has(link.pathname)) return;
    if (!['/home','/jobs','/library','/network','/messages','/notifications','/profile','/settings'].includes(link.pathname)) return;
    warmedPages.add(link.pathname);
    const hint = document.createElement('link'); hint.rel = 'prefetch'; hint.href = link.pathname; hint.as = 'document'; document.head.appendChild(hint);
  }
  document.addEventListener('pointerover', event => { const anchor = event.target.closest('a[href]'); if (anchor) warmPage(anchor); }, { passive: true });
  document.addEventListener('touchstart', event => { const anchor = event.target.closest('a[href]'); if (anchor) warmPage(anchor); }, { passive: true });
  const idle = window.requestIdleCallback || (callback => setTimeout(callback, 800));
  idle(() => NAV.filter(item => item.id !== page).forEach(item => warmPage(new URL(item.href, location.origin))));

  /* ── toasts ─────────────────────────────────────────────────────────────── */
  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'animate-fade-up px-4 py-2.5 rounded-pill bg-ink text-surface text-[13.5px] font-medium shadow-pop';
    el.textContent = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity .3s, transform .3s'; el.style.opacity = 0; el.style.transform = 'translateY(6px)'; }, 2200);
    setTimeout(() => el.remove(), 2600);
  }

  /* ── theme toggle ───────────────────────────────────────────────────────── */
  $('#theme-toggle').addEventListener('click', () => setTheme(root.classList.contains('dark') ? 'light' : 'dark'));

  /* ── dropdown menus ─────────────────────────────────────────────────────── */
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-menu-btn]');
    $$('[data-menu-root]').forEach(r => {
      const open = btn && r.contains(btn) && $('[data-menu]', r).classList.contains('hidden');
      $('[data-menu]', r).classList.toggle('hidden', !open);
      $('[data-menu-btn]', r).setAttribute('aria-expanded', String(!!open));
    });
  });

  /* ── modals ─────────────────────────────────────────────────────────────── */
  const backdrop = $('#backdrop');
  let lastFocus = null;

  function openModal(id) {
    if (!backdrop || !$('#' + id)) return false;
    lastFocus = document.activeElement;
    backdrop.classList.remove('hidden'); backdrop.classList.add('flex');
    $$('.modal').forEach(m => m.classList.toggle('hidden', m.id !== id));
    document.body.style.overflow = 'hidden';
    const f = $(`#${id} input, #${id} textarea, #${id} [contenteditable], #${id} button`);
    f && f.focus({ preventScroll: true });
    return true;
  }
  function closeModal() {
    if (!backdrop) return;
    backdrop.classList.add('hidden'); backdrop.classList.remove('flex');
    $$('.modal').forEach(m => m.classList.add('hidden'));
    document.body.style.overflow = '';
    document.dispatchEvent(new CustomEvent('fi:modalclose'));
    lastFocus && lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener('click', e => {
    const open = e.target.closest('[data-modal-open]');
    if (open) {
      if (!openModal(open.dataset.modalOpen) && open.dataset.fallback) location.href = open.dataset.fallback;
      return;
    }
    if (e.target.closest('[data-close]') || (backdrop && e.target === backdrop)) closeModal();
    const t = e.target.closest('[data-toast]');
    if (t) { toast(t.dataset.toast); closeModal(); }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && backdrop && !backdrop.classList.contains('hidden')) closeModal();
    if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
      e.preventDefault(); $('#search').focus();
    }
  });

  if (backdrop) {
    backdrop.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const m = $$('.modal').find(x => !x.classList.contains('hidden'));
      if (!m) return;
      const f = $$('a[href],button:not([disabled]),input,textarea,[contenteditable],[tabindex]:not([tabindex="-1"])', m)
        .filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ── mobile search ──────────────────────────────────────────────────────── */
  $('[data-search-toggle]').addEventListener('click', () => {
    const p = $('[data-search-panel]');
    p.classList.toggle('hidden');
    if (!p.classList.contains('hidden')) $('input', p).focus();
  });

  function submitPageSearch(input) {
    const query = input.value.trim();
    document.dispatchEvent(new CustomEvent('fi:search', { detail: { query } }));
  }
  $$('#search, [data-search-panel] input[type="search"]').forEach(input => {
    input.addEventListener('keydown', event => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      submitPageSearch(input);
    });
  });
  $('[aria-label="Apps"]')?.addEventListener('click', () => { location.href = '/bible-study'; });

  /* ── shared micro-interactions ──────────────────────────────────────────── */
  document.addEventListener('click', e => {
    // Follow / Connect / Join → confirmed state
    const f = e.target.closest('[data-follow]');
    if (f) {
      const done = f.dataset.follow || 'Following';
      f.outerHTML = `<span class="text-[13px] font-semibold text-muted px-3 py-1.5 inline-flex items-center gap-1.5"><i class="fa-solid fa-check text-[11px]"></i>${esc(done)}</span>`;
      toast(done);
      return;
    }
    // Dismiss a suggestion card
    const d = e.target.closest('[data-dismiss]');
    if (d) {
      const card = d.closest('[data-dismissable]');
      if (card) {
        card.style.transition = 'opacity .2s, transform .2s';
        card.style.opacity = 0; card.style.transform = 'scale(.97)';
        setTimeout(() => card.remove(), 200);
        toast('Suggestion hidden');
      }
      return;
    }
    // Bookmark / save toggle
    const s = e.target.closest('[data-save]');
    if (s) {
      const on = s.classList.toggle('is-on');
      const i = $('i', s);
      if (i) i.className = i.className.replace(/fa-(solid|regular)/, on ? 'fa-solid' : 'fa-regular');
      s.classList.toggle('!text-brand', on);
      toast(on ? 'Saved to your items' : 'Removed from saved');
      return;
    }
    // Accept / ignore an invitation
    const inv = e.target.closest('[data-invite]');
    if (inv) {
      const row = inv.closest('[data-invite-row]');
      const accepted = inv.dataset.invite === 'accept';
      if (row) {
        row.innerHTML = `<p class="py-2 text-[14px] text-muted"><i class="fa-solid ${accepted ? 'fa-check text-emerald-500' : 'fa-xmark'} mr-2"></i>${accepted ? 'Invitation accepted' : 'Invitation ignored'}</p>`;
      }
      return;
    }
    // Single-select chip groups
    const chip = e.target.closest('[data-chip-group] .chip');
    if (chip) {
      $$('.chip', chip.closest('[data-chip-group]')).forEach(c => c.classList.remove('is-on'));
      chip.classList.add('is-on');
    }
  });

  /* ── horizontal rails ───────────────────────────────────────────────────── */
  $$('[data-rail-prev],[data-rail-next]').forEach(btn => btn.addEventListener('click', () => {
    const rail = $(btn.dataset.railPrev || btn.dataset.railNext);
    if (rail) rail.scrollBy({ left: btn.hasAttribute('data-rail-prev') ? -260 : 260, behavior: 'smooth' });
  }));

  window.FI = { $, $$, esc, toast, openModal, closeModal, setTheme, getTheme: () => themeMode };
})();
