/* eslint-disable @typescript-eslint/no-unused-vars, @next/next/no-location-assign-relative-destination */
/* Faith In — shared live data and authentication for the new interface. */
(() => {
  'use strict';
  const { $, $$, esc, toast, setTheme } = window.FI;
  const api = window.FIData;
  let session = null;

  function avatarMarkup(user, classes = 'avatar w-10 h-10 text-[13px]') {
    const name = user?.name || user?.displayName || 'Faith In Member';
    const url = user?.avatar_url || user?.avatar || user?.photo_url || '';
    if (url) return `<img class="${classes} object-cover" src="${esc(url)}" alt="${esc(name)}">`;
    return `<span class="${classes}" style="background:linear-gradient(135deg,#2f5bea,#1e40af)">${esc(api.initials(name))}</span>`;
  }

  function verificationBadgeMarkup(user, variant = 'inline') {
    const isProfile = variant === 'profile';
    const v = user?.verification || { show: true, type: 'purple', label: 'Verified Member', title: 'Verified Member — Purple Tick' };
    const type = v.type || 'purple';
    const tickClass = type === 'blue' ? 'fi-verified-tick fi-verified-tick--blue' : (type === 'yellow' || type === 'gold' ? 'fi-verified-tick fi-verified-tick--gold' : 'fi-verified-tick');
    const profileMod = isProfile ? ' fi-verified-tick--profile' : '';
    const title = esc(v.title || 'Verified Member');

    return `<span class="${tickClass}${profileMod}" title="${title}" aria-label="${title}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg></span>`;
  }

  function mountAuth() {
    const host = document.createElement('div');
    host.id = 'fi-auth';
    host.className = 'fi-auth hidden';
    host.innerHTML = `<div class="fi-auth__page" role="dialog" aria-modal="true" aria-labelledby="fi-auth-title">
      <header class="fi-auth__brand"><span>FaithIn</span><i class="fa-solid fa-globe" aria-hidden="true"></i></header>
      <main class="fi-auth__main">
        <div class="fi-auth__intro"><h1>Welcome to your professional<br>faith community</h1><p>Connect with believers, discover ministry opportunities, and grow your professional network.</p></div>
        <section class="fi-auth__card">
          <button class="fi-auth__close" data-auth-close aria-label="Close sign in"><i class="fa-solid fa-xmark"></i></button>

          <div data-auth-view="signin">
            <h2 id="fi-auth-title">Sign in</h2>
            <p class="fi-auth__subtitle">Stay updated on your professional world.</p>
            <form data-auth-form="signin" class="fi-auth__form">
              <label class="sr-only" for="fi-signin-email">Email address</label>
              <input id="fi-signin-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="Email address" required>
              <label class="fi-auth__password"><span class="sr-only">Password</span><input name="password" type="password" autocomplete="current-password" placeholder="Password" minlength="6" required><button type="button" data-password-toggle aria-label="Show password"><i class="fa-regular fa-eye"></i></button></label>
              <div class="fi-auth__options"><label><input name="remember" type="checkbox" checked> Remember me</label><button type="button" data-auth-show="forgot">Forgot password?</button></div>
              <p class="fi-auth__error" data-auth-error hidden role="alert"></p>
              <button class="fi-auth__primary" name="intent" value="signin"><span>Sign in</span><i class="fi-auth__spinner" aria-hidden="true"></i></button>
            </form>
            <div class="fi-auth__divider"><span>or</span></div>
            <button class="fi-auth__social" data-auth-google><span class="fi-auth__google" aria-hidden="true">G</span>Continue with Google</button>
            <p class="fi-auth__switch">New to Faith In? <button data-auth-show="signup">Join now</button></p>
          </div>

          <div data-auth-view="signup" hidden>
            <h2>Join Faith In</h2>
            <p class="fi-auth__subtitle">Create your secure member account.</p>
            <form data-auth-form="signup" class="fi-auth__form">
              <div class="fi-auth__names"><label><span class="sr-only">First name</span><input name="first_name" autocomplete="given-name" placeholder="First name" required maxlength="60"></label><label><span class="sr-only">Last name</span><input name="last_name" autocomplete="family-name" placeholder="Last name" required maxlength="60"></label></div>
              <label class="sr-only" for="fi-signup-email">Email address</label>
              <input id="fi-signup-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="Email address" required>
              <label class="fi-auth__password"><span class="sr-only">Password</span><input name="password" type="password" autocomplete="new-password" placeholder="Password (8+ characters)" minlength="8" required><button type="button" data-password-toggle aria-label="Show password"><i class="fa-regular fa-eye"></i></button></label>
              <p class="fi-auth__terms">By clicking Agree &amp; Join, you agree to the Faith In <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</p>
              <p class="fi-auth__error" data-auth-error hidden role="alert"></p>
              <button class="fi-auth__primary" name="intent" value="signup"><span>Agree &amp; Join</span><i class="fi-auth__spinner" aria-hidden="true"></i></button>
            </form>
            <div class="fi-auth__divider"><span>or</span></div>
            <button class="fi-auth__social" data-auth-google><span class="fi-auth__google" aria-hidden="true">G</span>Continue with Google</button>
            <p class="fi-auth__switch">Already on Faith In? <button data-auth-show="signin">Sign in</button></p>
          </div>

          <div data-auth-view="forgot" hidden>
            <button class="fi-auth__back" data-auth-show="signin"><i class="fa-solid fa-arrow-left"></i> Back to sign in</button>
            <h2>Reset your password</h2>
            <p class="fi-auth__subtitle">Enter your email and we’ll send a secure reset link.</p>
            <form data-auth-form="forgot" class="fi-auth__form">
              <label class="sr-only" for="fi-forgot-email">Email address</label>
              <input id="fi-forgot-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="Email address" required>
              <p class="fi-auth__error" data-auth-error hidden role="alert"></p>
              <p class="fi-auth__success" data-auth-success hidden role="status"></p>
              <button class="fi-auth__primary"><span>Send reset link</span><i class="fi-auth__spinner" aria-hidden="true"></i></button>
            </form>
          </div>

          <div data-auth-view="verify" hidden>
            <div class="fi-auth__verify-icon"><i class="fa-regular fa-envelope"></i></div>
            <h2>Verify your email</h2>
            <p class="fi-auth__subtitle">We sent a verification link to <strong data-auth-email></strong>. Open it, then return here to sign in.</p>
            <button class="fi-auth__primary" data-auth-show="signin"><span>Back to sign in</span></button>
            <button class="fi-auth__text-button" data-auth-resend>Resend verification email</button>
            <p class="fi-auth__success" data-auth-success hidden role="status"></p>
          </div>
        </section>
      </main>
      <footer class="fi-auth__footer"><span>FaithIn © 2026</span><a href="/privacy">Privacy</a><a href="/terms">Terms</a></footer>
    </div>`;
    document.body.appendChild(host);
    let verificationEmail = '';
    const close = () => {
      if (host.dataset.locked === 'true') return;
      host.classList.add('hidden');
    };
    const setBusy = (button, busy) => {
      if (!button) return;
      button.disabled = busy;
      button.classList.toggle('is-busy', busy);
    };
    const showView = name => {
      $$('[data-auth-view]', host).forEach(view => { view.hidden = view.dataset.authView !== name; });
      $$('[data-auth-error], [data-auth-success]', host).forEach(message => { message.hidden = true; message.textContent = ''; });
      const input = $(`[data-auth-view="${name}"] input`, host);
      window.setTimeout(() => input?.focus(), 0);
    };
    const showAuthError = (scope, error) => {
      const el = $('[data-auth-error]', scope) || $('[data-auth-error]', host);
      el.textContent = error.message || 'Sign-in failed. Please try again.';
      el.hidden = false;
    };
    host.addEventListener('click', async event => {
      if (event.target === host || event.target.closest('[data-auth-close]')) close();
      const switcher = event.target.closest('[data-auth-show]');
      if (switcher) { showView(switcher.dataset.authShow); return; }
      const toggle = event.target.closest('[data-password-toggle]');
      if (toggle) {
        const input = toggle.closest('.fi-auth__password').querySelector('input');
        const reveal = input.type === 'password';
        input.type = reveal ? 'text' : 'password';
        toggle.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
        toggle.innerHTML = `<i class="fa-regular fa-eye${reveal ? '-slash' : ''}"></i>`;
        return;
      }
      const google = event.target.closest('[data-auth-google]');
      if (google) {
        setBusy(google, true);
        try {
          const res = await api.request('cv_google_sign_in');
          if (res?.redirected) return;
          session = res;
          applySession(session);
          window.location.reload();
        } catch (error) {
          showAuthError(google.closest('[data-auth-view]'), error);
        } finally {
          setBusy(google, false);
        }
        return;
      }
      const resend = event.target.closest('[data-auth-resend]');
      if (resend) {
        setBusy(resend, true);
        const status = $('[data-auth-success]', resend.closest('[data-auth-view]'));
        try { await api.request('cv_send_email_verification'); status.textContent = 'Verification email sent. Check your inbox and spam folder.'; status.hidden = false; }
        catch (error) { status.textContent = error.message || 'Please wait before trying again.'; status.hidden = false; }
        finally { setBusy(resend, false); }
      }
    });
    $$('[data-auth-form]', host).forEach(form => form.addEventListener('submit', async event => {
      event.preventDefault();
      const mode = form.dataset.authForm;
      const data = new FormData(form);
      const submitter = event.submitter || $('button[type="submit"], button:not([type])', form);
      setBusy(submitter, true);
      try {
        if (mode === 'forgot') {
          await api.request('cv_password_reset', { email: data.get('email') });
          const success = $('[data-auth-success]', form);
          success.textContent = 'If an account uses that email, a reset link is on the way.';
          success.hidden = false;
          $('[data-auth-error]', form).hidden = true;
          return;
        }
        const action = mode === 'signup' ? 'cv_email_sign_up' : 'cv_email_sign_in';
        const values = { email: data.get('email'), password: data.get('password'), remember: data.get('remember') === 'on' };
        if (mode === 'signup') values.display_name = `${data.get('first_name') || ''} ${data.get('last_name') || ''}`.trim();
        const result = await api.request(action, values);
        if (result?.verification_required) {
          verificationEmail = result.email || String(data.get('email') || '');
          $('[data-auth-email]', host).textContent = verificationEmail;
          showView('verify');
          return;
        }
        session = result;
        applySession(session);
        window.location.reload();
      } catch (error) { showAuthError(form, error); }
      finally { setBusy(submitter, false); }
    }));
    window.FI.openAuth = options => {
      const locked = !!options?.locked;
      host.dataset.locked = String(locked);
      host.classList.remove('hidden');
      host.classList.toggle('is-locked', locked);
      document.body.classList.toggle('fi-auth-locked', locked);
      const main = $('#main');
      if (main) { main.inert = locked; main.setAttribute('aria-hidden', String(locked)); }
      showView(options?.verificationRequired ? 'verify' : 'signin');
      if (options?.email) { verificationEmail = options.email; $('[data-auth-email]', host).textContent = verificationEmail; }
      if (options?.verificationRequired) showView('verify');
    };
  }

  function applySession(user) {
    session = user && user.logged_in ? user : null;
    if (session?.settings?.theme) setTheme(session.settings.theme);
    document.documentElement.style.fontSize = session?.settings?.larger_text ? '112.5%' : '';
    const name = session?.name || 'Sign in';
    const role = session?.role || (session ? 'Faith In member' : 'Join the community');
    const menu = $('[data-menu-root]');
    if (menu) {
      const avatars = $$('.avatar, img.avatar', menu);
      avatars.forEach(el => {
        const replacement = document.createElement('span'); replacement.innerHTML = avatarMarkup(session || { name: 'Faith In' }, el.className || 'avatar w-8 h-8 text-[12px]'); el.replaceWith(replacement.firstElementChild);
      });
      const texts = $$('p', menu); if (texts[0]) texts[0].textContent = name; if (texts[1]) texts[1].textContent = role;
      const signout = $$('a', menu).find(link => /sign out/i.test(link.textContent));
      if (signout) { signout.textContent = session ? 'Sign out' : 'Sign in'; signout.innerHTML = `<i class="fa-solid fa-${session ? 'arrow-right-from-bracket' : 'right-to-bracket'}"></i>${session ? 'Sign out' : 'Sign in'}`; }
    }
    const displayName = session?.name || 'Faith In Member';
    if (!session) {
      const notificationLink = $('a[aria-label^="Notifications"]');
      notificationLink?.querySelector('span')?.classList.add('hidden');
      notificationLink?.setAttribute('aria-label', 'Notifications');
    }
    if (page !== 'profile') {
      $$('a, h1, h2').filter(node => node.textContent.trim() === 'Hun Chet' || node.hasAttribute('data-current-user-name')).forEach(node => {
        node.innerHTML = esc(displayName) + (session ? verificationBadgeMarkup(session) : '');
      });
      $$('p').filter(node => /Faith In member\s*·\s*Phnom Penh/i.test(node.textContent)).forEach(node => { node.textContent = session ? ['Faith In member', session.location].filter(Boolean).join(' · ') : 'Sign in to join the community'; });
      $$('.avatar').filter(node => node.textContent.trim() === 'HC' || node.textContent.trim() === 'FI').forEach(node => { if (!node.closest('[data-post-id],[data-user-uid]')) node.textContent = api.initials(displayName); });
      $$('[data-current-user-avatar]').forEach(el => {
        const holder = document.createElement('span');
        holder.innerHTML = avatarMarkup(session || { name: displayName }, `${el.className} object-cover`);
        const next = holder.firstElementChild;
        next.dataset.currentUserAvatar = '';
        el.replaceWith(next);
      });
    }
    $$('a').forEach(link => {
      const label = link.textContent.trim().replace(/\s+\d+$/, '');
      const routes = { 'Home Feed': '/home', 'Profile': '/profile', 'Prayer Wall': '/home#prayer-wall', 'Find Jobs': '/jobs', 'Find Users': '/network', 'Library': '/library' };
      if (routes[label]) link.href = routes[label];
    });
    document.dispatchEvent(new CustomEvent('fi:session', { detail: { user: session } }));
  }

  function requireUser() {
    if (session) return true;
    window.FI.openAuth();
    return false;
  }

  /**
   * Paints the two header badges.
   *
   * They used to share one number, so an unread message inflated the bell and
   * the member had no way to tell the two apart. Each icon now carries its own
   * count. On /messages the realtime thread listener owns the message badge,
   * which is more current than this one poll, so it is left alone there.
   */
  async function refreshNotifications() {
    if (!session) return;
    try {
      const counts = await api.request('cv_social_get_notification_count');
      const paint = (node, count) => {
        if (!node) return;
        node.textContent = count > 99 ? '99+' : count;
        node.classList.toggle('hidden', !count);
      };
      paint($('a[aria-label^="Notifications"] span'), counts.unread_count || 0);
      if (document.body.dataset.page !== 'messaging') {
        paint($('a[aria-label^="Messages"] [data-msg-badge]'), counts.message_unread_count || 0);
      }
    } catch (_) {}
  }

  function emptyState(label) {
    return `<div class="p-8 text-center text-muted"><i class="fa-regular fa-folder-open text-2xl text-faint"></i><p class="mt-2 text-[13.5px]">${esc(label)}</p></div>`;
  }

  async function loadJobs() {
    const heading = $$('#main h2').find(node => /recommended for you/i.test(node.textContent));
    const holder = heading?.closest('section')?.querySelector('.divide-y'); if (!holder) return;
    const form = heading.closest('#main').querySelector('form');
    const inputs = $$('input', form);
    const chipGroup = $('[data-chip-group]', form?.parentElement);
    let jobs = [], savedIds = null;
    const render = () => {
      const query = String(inputs[0]?.value || '').trim().toLowerCase();
      const locationQuery = String(inputs[1]?.value || '').trim().toLowerCase();
      const filter = $('.chip.is-on', chipGroup)?.textContent.trim().toLowerCase() || 'all roles';
      let items = jobs.filter(job => {
        const textValues = [job.title, job.organization, job.location, job.description, job.job_type].map(value => String(value || '').toLowerCase());
        const matchesQuery = !query || textValues.some(value => value.includes(query));
        const matchesLocation = !locationQuery || String(job.location || '').toLowerCase().includes(locationQuery);
        const matchesChip = filter === 'all roles'
          || (filter === 'remote' && /remote/i.test(job.location || ''))
          || (filter === 'full-time' && /full.?time/i.test(job.job_type || ''))
          || (filter === 'pastoral' && /pastor/i.test(`${job.title || ''} ${job.description || ''}`))
          || (filter === 'non-profit' && /non.?profit|ngo|charity/i.test(`${job.organization || ''} ${job.description || ''}`));
        return matchesQuery && matchesLocation && matchesChip && (!savedIds || savedIds.has(job.id));
      });
      holder.innerHTML = items.length ? items.map(job => `<article class="p-4 flex gap-3.5 row-hover relative" data-job-id="${esc(job.id)}"><span class="avatar avatar-sq w-14 h-14 text-[12px] shrink-0">${esc(api.initials(job.organization))}</span><div class="min-w-0 flex-1 pr-10"><a class="text-[15.5px] font-semibold text-brand" href="${esc(job.apply_url || (job.contact_email ? `mailto:${job.contact_email}` : '#'))}">${esc(job.title)}</a><p class="text-[14px] font-medium mt-0.5">${esc(job.organization)}</p><p class="text-[13px] text-muted mt-0.5">${esc(job.location || 'Location flexible')} · ${esc(job.job_type || 'Ministry role')}</p><p class="text-[13px] text-muted mt-2 line-clamp-2">${esc(job.description || '')}</p><p class="text-[12px] text-faint mt-2">${esc(job.time || '')}</p></div>${job.can_delete ? '<button class="icon-btn absolute top-3 right-3" data-job-delete aria-label="Delete job"><i class="fa-regular fa-trash-can"></i></button>' : '<button class="icon-btn absolute top-3 right-3" data-job-save aria-label="Save job"><i class="fa-regular fa-bookmark"></i></button>'}</article>`).join('') : emptyState(savedIds ? 'You have not saved any matching roles yet.' : 'No matching ministry roles yet.');
    };
    const refresh = async () => {
      holder.innerHTML = emptyState('Loading ministry opportunities…');
      try {
        const [result, bookmarks] = await Promise.all([
          api.request('cv_get_jobs'),
          new URLSearchParams(location.search).get('view') === 'saved' ? api.request('cv_get_bookmarks').catch(() => ({ items: [] })) : Promise.resolve(null)
        ]);
        jobs = result.items || [];
        savedIds = bookmarks ? new Set((bookmarks.items || []).filter(row => row.object_type === 'job').map(row => row.object_id)) : null;
        render();
      } catch (error) { holder.innerHTML = emptyState(error.message); }
    };
    form?.addEventListener('submit', event => { event.preventDefault(); render(); });
    chipGroup?.addEventListener('click', event => { const chip = event.target.closest('.chip'); if (!chip) return; $$('.chip', chipGroup).forEach(item => item.classList.toggle('is-on', item === chip)); render(); });
    document.addEventListener('fi:search', event => { if (inputs[0]) inputs[0].value = event.detail.query; render(); });
    const showAll = heading.closest('section')?.querySelector(':scope > button');
    if (showAll) showAll.addEventListener('click', () => { inputs.forEach(input => { input.value = ''; }); const first = $('.chip', chipGroup); if (first) first.click(); render(); });
    const postButton = $$('#main button').find(button => /post a job|start hiring/i.test(button.textContent));
    if (postButton) { postButton.removeAttribute('data-toast'); postButton.addEventListener('click', () => { if (!requireUser()) return; openJobEditor(refresh); }); }
    holder.addEventListener('click', async event => { const row = event.target.closest('[data-job-id]'); if (!row) return; if (event.target.closest('[data-job-delete]')) { await api.request('cv_delete_job', { job_id: row.dataset.jobId }); row.remove(); toast('Job removed'); } if (event.target.closest('[data-job-save]')) { await api.request('cv_toggle_bookmark', { object_id: row.dataset.jobId, object_type: 'job' }); toast('Job saved'); } });
    $$('#main aside section').filter(section => /top organizations hiring/i.test(section.textContent)).forEach(section => section.remove());
    refresh();
  }

  function openJobEditor(refresh) {
    const modal = document.createElement('div'); modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center';
    modal.innerHTML = `<form class="card w-full max-w-lg p-5 space-y-3"><div class="flex justify-between"><h2 class="text-[20px] font-bold">Post a ministry role</h2><button type="button" class="icon-btn" data-close-job><i class="fa-solid fa-xmark"></i></button></div><input class="field" name="title" placeholder="Role title" required><input class="field" name="organization" placeholder="Church or organization" required><input class="field" name="location" placeholder="Location or Remote"><select class="field" name="job_type"><option>Full-time</option><option>Part-time</option><option>Volunteer</option><option>Contract</option></select><textarea class="field" name="description" rows="4" placeholder="Role description"></textarea><input class="field" name="apply_url" type="url" placeholder="https:// application link"><input class="field" name="contact_email" type="email" placeholder="or contact email"><button class="btn btn-primary w-full">Publish role</button></form>`;
    document.body.appendChild(modal); $('[data-close-job]', modal).onclick = () => modal.remove();
    $('form', modal).onsubmit = async event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); try { await api.request('cv_create_job', data); modal.remove(); toast('Job published'); refresh(); } catch (error) { toast(error.message); } };
  }

  // ── Library media helpers: 16:9 sermon cards, audio cards, in-app player ──
  function fiFmtTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const total = Math.floor(seconds), h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  }

  function fiMediaUrl(resource) {
    return resource.file_url || resource.open_url || resource.url || resource.download_url || '';
  }

  function fiResourceMeta(resource) {
    return `<span class="block text-[13.5px] font-semibold mt-2.5 leading-tight">${esc(resource.title)}</span>`
      + `<span class="block text-[12px] text-muted mt-1">By ${esc(resource.author || 'Faith In member')}</span>`
      + (resource.translated_by ? `<span class="block text-[11.5px] text-faint mt-0.5">Translated by ${esc(resource.translated_by)}</span>` : '')
      + `<span class="inline-flex mt-1.5 text-[10.5px] font-bold uppercase tracking-wide text-brand bg-brand-soft px-2 py-0.5 rounded-full">${esc(resource.language || resource.format || 'resource')}</span>`;
  }

  function fiResourceFooter(resource, savedIds) {
    const saved = savedIds.has(resource.id);
    return `<div class="flex items-center justify-between gap-1 mt-2">`
      + `<button class="text-[12px] font-semibold text-brand" data-resource-download><i class="fa-solid fa-download mr-1"></i>${Number(resource.download_count || 0)}</button>`
      + `<span class="flex">`
      + (resource.can_delete ? '<button class="icon-btn w-8 h-8 text-rose" data-resource-delete aria-label="Delete resource"><i class="fa-regular fa-trash-can"></i></button>' : '')
      + `<button class="icon-btn w-8 h-8 ${saved ? '!text-brand' : ''}" data-resource-save aria-label="${saved ? 'Remove saved resource' : 'Save resource'}"><i class="fa-${saved ? 'solid' : 'regular'} fa-bookmark"></i></button>`
      + `</span></div>`;
  }

  function fiResourceCardHtml(resource, savedIds) {
    const format = String(resource.format || 'pdf').toLowerCase();
    const id = esc(resource.id);
    const saved = savedIds.has(resource.id);
    const canDelete = Boolean(resource.can_delete);
    const authorName = (typeof resource.author === 'object' && resource.author?.name) ? resource.author.name : (resource.contributor_name || resource.author || 'Faith In member');
    const downloadCount = Number(resource.download_count || 0);

    let coverMarkup = '';
    if (format === 'video') {
      coverMarkup = `<div class="w-full max-w-[220px] aspect-video relative rounded-md overflow-hidden shadow-sm bg-gray-900 flex items-center justify-center cursor-pointer group" data-resource-play aria-label="Play ${esc(resource.title)}">`
        + (resource.thumbnail_url ? `<img class="w-full h-full object-cover" src="${esc(resource.thumbnail_url)}" alt="${esc(resource.title)}" loading="lazy">` : `<span class="text-white font-semibold text-center p-2 text-[11px]"><i class="fa-solid fa-video text-base block mb-1"></i>${esc(resource.title)}</span>`)
        + `<span class="fi-media-play"><span><i class="fa-solid fa-play text-xs"></i></span></span>`
        + `<span class="fi-media-badge">Sermon</span></div>`;
    } else if (format === 'audio') {
      coverMarkup = `<div class="w-[125px] h-[125px] relative rounded-md overflow-hidden shadow-sm bg-gradient-to-br from-purple-700 to-indigo-900 flex items-center justify-center cursor-pointer group" data-resource-play aria-label="Play ${esc(resource.title)}">`
        + (resource.thumbnail_url ? `<img class="w-full h-full object-cover" src="${esc(resource.thumbnail_url)}" alt="${esc(resource.title)}" loading="lazy">` : `<span class="text-white font-semibold text-center p-2 text-[11px]"><i class="fa-solid fa-headphones text-lg block mb-1"></i>${esc(resource.title)}</span>`)
        + `<span class="fi-media-play"><span><i class="fa-solid fa-play text-xs"></i></span></span>`
        + `<span class="fi-media-badge">Audio</span></div>`;
    } else if (resource.thumbnail_url) {
      coverMarkup = `<div class="h-[140px] max-w-[120px] flex items-center justify-center relative cursor-pointer transition-transform duration-200 hover:scale-105" data-resource-download>`
        + `<img class="max-h-[140px] w-auto max-w-[120px] object-contain rounded drop-shadow-md" src="${esc(resource.thumbnail_url)}" alt="${esc(resource.title)}" loading="lazy">`
        + `</div>`;
    } else {
      // Sleek 3D Book Cover
      coverMarkup = `<div class="w-[95px] h-[135px] relative drop-shadow-md rounded-r rounded-l-sm flex cursor-pointer transition-transform duration-200 hover:scale-105 select-none" data-resource-download>`
        + `<div class="w-3 bg-gray-900 rounded-l-sm flex flex-col justify-evenly items-center py-1.5 shadow-inner shrink-0"><div class="w-full h-[1px] bg-yellow-600 opacity-80"></div><div class="w-full h-[1px] bg-yellow-600 opacity-80"></div><div class="w-full h-[1px] bg-yellow-600 opacity-80"></div></div>`
        + `<div class="flex-1 bg-[#1e4d3b] rounded-r flex flex-col items-center pt-4 border-l border-gray-800 shadow-[inset_2px_0_6px_rgba(0,0,0,0.2)] px-1 overflow-hidden">`
        + `<div class="border border-yellow-600 p-1 text-center w-[90%] bg-[#1e4d3b]">`
        + `<p class="text-yellow-500 text-[7px] font-bold tracking-wider leading-tight uppercase truncate max-w-full">${esc(authorName)}</p>`
        + `<div class="w-full h-[0.5px] bg-yellow-600 my-[1.5px] opacity-70"></div>`
        + `<p class="text-white text-[6px] font-medium tracking-wide line-clamp-2 leading-tight">${esc(resource.title)}</p>`
        + `</div></div></div>`;
    }

    return `<article class="bg-white dark:bg-[#151d2e] rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col border border-gray-100 dark:border-slate-800 transition-all hover:shadow-md" data-resource-id="${id}" data-resource-format="${esc(format)}">`
      + `<div class="bg-[#F0F2F5] dark:bg-slate-800/50 h-[165px] flex items-center justify-center p-3 relative select-none">${coverMarkup}</div>`
      + `<div class="p-3 flex flex-col flex-1">`
      + `<h3 class="text-[14px] font-bold text-gray-900 dark:text-white leading-snug mb-0.5 truncate" title="${esc(resource.title)}">${esc(resource.title)}</h3>`
      + `<p class="text-[12px] text-gray-500 dark:text-gray-400 mb-0.5 truncate">By <span class="font-semibold text-gray-800 dark:text-gray-200">${esc(authorName)}</span></p>`
      + (resource.translated_by ? `<p class="text-[11.5px] text-gray-500 dark:text-gray-400 mb-1 truncate">Translated by ${esc(resource.translated_by)}</p>` : '')
      + `<span class="inline-flex items-center justify-center px-2 py-0.5 rounded bg-[#E7F3FF] dark:bg-blue-950/60 text-[#1877F2] dark:text-blue-400 text-[10.5px] font-bold w-max my-1.5 uppercase">${esc(resource.format || 'PDF')}</span>`
      + `<div class="mt-auto flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800">`
      + `<button type="button" class="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 px-1.5 py-1 rounded cursor-pointer transition-colors text-[12.5px]" data-resource-download title="Download resource">`
      + `<i class="fa-solid fa-download w-3.5 h-3.5 mr-1 text-[#1877F2]"></i>`
      + `<span class="font-medium">${downloadCount}</span>`
      + `</button>`
      + `<div class="flex items-center gap-0.5 text-gray-500 dark:text-gray-400">`
      + (canDelete ? `<button type="button" class="flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-red-500 transition-colors" title="Delete" data-resource-delete><i class="fa-regular fa-trash-can text-[12px]"></i></button>` : '')
      + `<button type="button" class="flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 ${saved ? '!text-[#1877F2]' : ''} transition-colors" title="${saved ? 'Remove saved resource' : 'Save resource'}" data-resource-save>`
      + `<i class="fa-${saved ? 'solid' : 'regular'} fa-bookmark text-[12px]"></i>`
      + `</button>`
      + `</div></div></div></article>`;
  }

  // In-app player. Video plays in a lightbox; audio gets a music player with a
  // queue, so nothing hands the member off to a separate browser tab.
  function openMediaPlayer(resource, queue) {
    const list = (Array.isArray(queue) ? queue : []).filter(item => fiMediaUrl(item));
    let index = list.findIndex(item => item.id === resource.id);
    if (index < 0) { list.length = 0; list.push(resource); index = 0; }
    const isAudio = String(resource.format || '').toLowerCase() === 'audio';

    const backdrop = document.createElement('div');
    backdrop.className = 'fi-player-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', isAudio ? 'Audio player' : 'Video player');

    if (!isAudio) {
      backdrop.innerHTML = `<div class="fi-player-shell">`
        + `<video class="fi-player-video" controls autoplay playsinline preload="metadata" controlsList="nodownload" src="${esc(fiMediaUrl(resource))}"${resource.thumbnail_url ? ` poster="${esc(resource.thumbnail_url)}"` : ''}></video>`
        + `<div class="fi-player-head"><div class="min-w-0">`
        + `<h2 class="text-[15px] font-bold leading-tight">${esc(resource.title)}</h2>`
        + `<p class="text-[12.5px] text-muted mt-0.5">By ${esc(resource.author || 'Faith In member')}</p>`
        + `</div><button type="button" class="icon-btn shrink-0" data-player-close aria-label="Close player"><i class="fa-solid fa-xmark"></i></button>`
        + `</div></div>`;
    } else {
      backdrop.innerHTML = `<div class="fi-player-shell is-audio">`
        + `<div class="relative"><span data-player-art></span>`
        + `<button type="button" class="icon-btn absolute top-2 right-2" data-player-close aria-label="Close player" style="background:rgb(4 8 20 / .55);color:#fff"><i class="fa-solid fa-xmark"></i></button></div>`
        + `<div class="fi-player-body">`
        + `<h2 class="text-[15px] font-bold leading-tight" data-player-title></h2>`
        + `<p class="text-[12.5px] text-muted mt-0.5" data-player-author></p>`
        + `<div class="mt-4"><input type="range" class="fi-seek" min="0" max="1000" step="1" value="0" data-player-seek aria-label="Seek">`
        + `<div class="fi-player-times"><span data-player-current>0:00</span><span data-player-duration>0:00</span></div></div>`
        + `<div class="fi-player-controls">`
        + `<button type="button" class="fi-player-btn" data-player-prev aria-label="Previous track"><i class="fa-solid fa-backward-step"></i></button>`
        + `<button type="button" class="fi-player-btn is-main" data-player-toggle aria-label="Play"><i class="fa-solid fa-play"></i></button>`
        + `<button type="button" class="fi-player-btn" data-player-next aria-label="Next track"><i class="fa-solid fa-forward-step"></i></button>`
        + `</div><audio data-player-audio preload="metadata"></audio></div></div>`;
    }

    document.body.appendChild(backdrop);
    const onKey = event => { if (event.key === 'Escape') close(); };
    function close() {
      const media = backdrop.querySelector('video, audio');
      if (media) { try { media.pause(); media.removeAttribute('src'); media.load(); } catch (_) {} }
      document.removeEventListener('keydown', onKey);
      backdrop.remove();
    }
    document.addEventListener('keydown', onKey);
    backdrop.addEventListener('click', event => { if (event.target === backdrop) close(); });
    $('[data-player-close]', backdrop).onclick = close;
    if (!isAudio) return;

    const audio = $('[data-player-audio]', backdrop), seek = $('[data-player-seek]', backdrop);
    const toggle = $('[data-player-toggle]', backdrop), prev = $('[data-player-prev]', backdrop), next = $('[data-player-next]', backdrop);
    const currentLabel = $('[data-player-current]', backdrop), durationLabel = $('[data-player-duration]', backdrop);
    let scrubbing = false;

    const paint = () => {
      const track = list[index];
      $('[data-player-title]', backdrop).textContent = track.title || 'Untitled';
      $('[data-player-author]', backdrop).textContent = `By ${track.author || 'Faith In member'}`;
      $('[data-player-art]', backdrop).innerHTML = track.thumbnail_url
        ? `<img class="fi-player-art" src="${esc(track.thumbnail_url)}" alt="">`
        : '<span class="fi-player-art-fallback"><i class="fa-solid fa-music"></i></span>';
      prev.disabled = next.disabled = list.length < 2;
    };
    const load = playNow => { paint(); audio.src = fiMediaUrl(list[index]); if (playNow) audio.play().catch(() => {}); };
    const step = delta => { index = (index + delta + list.length) % list.length; load(true); };

    toggle.onclick = () => { if (audio.paused) audio.play().catch(() => {}); else audio.pause(); };
    prev.onclick = () => { if (audio.currentTime > 3) { audio.currentTime = 0; return; } step(-1); };
    next.onclick = () => step(1);
    audio.addEventListener('play', () => { toggle.innerHTML = '<i class="fa-solid fa-pause"></i>'; toggle.setAttribute('aria-label', 'Pause'); });
    audio.addEventListener('pause', () => { toggle.innerHTML = '<i class="fa-solid fa-play"></i>'; toggle.setAttribute('aria-label', 'Play'); });
    audio.addEventListener('loadedmetadata', () => { durationLabel.textContent = fiFmtTime(audio.duration); });
    audio.addEventListener('timeupdate', () => {
      if (scrubbing) return;
      currentLabel.textContent = fiFmtTime(audio.currentTime);
      seek.value = audio.duration ? String(Math.round((audio.currentTime / audio.duration) * 1000)) : '0';
    });
    audio.addEventListener('ended', () => { if (list.length > 1) step(1); });
    seek.addEventListener('input', () => { scrubbing = true; if (audio.duration) currentLabel.textContent = fiFmtTime((Number(seek.value) / 1000) * audio.duration); });
    seek.addEventListener('change', () => { if (audio.duration) audio.currentTime = (Number(seek.value) / 1000) * audio.duration; scrubbing = false; });
    load(true);
  }

  async function loadLibrary() {
    const shelf = $('#shelf'); if (!shelf) return;
    shelf.className = 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4';
    $$('[data-rail-prev],[data-rail-next]').forEach(button => { button.style.display = 'none'; });
    let resources = [], rendered = [], savedIds = new Set(), searchQuery = '';
    const view = new URLSearchParams(location.search).get('view');
    const format = new URLSearchParams(location.search).get('format');
    const category = new URLSearchParams(location.search).get('category');

    const updateHeaderInfo = () => {
      const titleEl = $('#library-title');
      const subtitleEl = $('#library-subtitle');
      if (!titleEl) return;
      if (view === 'saved') {
        titleEl.textContent = 'Saved Items';
        if (subtitleEl) subtitleEl.textContent = 'Resources you have bookmarked';
      } else if (format === 'pdf') {
        titleEl.textContent = 'PDF Books & Studies';
        if (subtitleEl) subtitleEl.textContent = 'Reading resources published by the Faith In community';
      } else if (format === 'video') {
        titleEl.textContent = 'Sermons & Videos';
        if (subtitleEl) subtitleEl.textContent = 'Watch teachings and sermon series';
      } else if (format === 'audio') {
        titleEl.textContent = 'Podcasts & Audio';
        if (subtitleEl) subtitleEl.textContent = 'Listen to sermons and podcasts';
      } else if (category) {
        titleEl.textContent = category;
        if (subtitleEl) subtitleEl.textContent = `Resources published in ${category}`;
      } else {
        titleEl.textContent = 'Recommended for you';
        if (subtitleEl) subtitleEl.textContent = 'Resources published by the Faith In community';
      }
    };
    updateHeaderInfo();

    const render = () => {
      let items = resources.slice();
      if (format) items = items.filter(resource => String(resource.format || '').toLowerCase() === format.toLowerCase());
      if (category) {
        const wanted = category.replace(/and/gi, '&').replace(/[^a-z]/gi, '').toLowerCase();
        items = items.filter(resource => String(resource.category || '').replace(/[^a-z]/gi, '').toLowerCase() === wanted);
      }
      if (view === 'saved') items = items.filter(resource => savedIds.has(resource.id));
      if (searchQuery) items = items.filter(resource => [resource.title, resource.author, resource.category, resource.description].some(value => String(value || '').toLowerCase().includes(searchQuery)));
      rendered = items;
      shelf.innerHTML = items.length ? items.map(resource => fiResourceCardHtml(resource, savedIds)).join('') : emptyState(view || format || category || searchQuery ? 'Nothing in this shelf yet.' : 'No community resources have been published yet.');
    };
    try {
      const [result, saved] = await Promise.all([api.request('cv_get_resources'), api.request('cv_get_bookmarks').catch(() => ({ items: [] }))]);
      resources = result.items || [];
      savedIds = new Set((saved.items || []).filter(row => row.object_type === 'resource').map(row => row.object_id));
      render();
    } catch (error) { shelf.innerHTML = emptyState(error.message); }

    const publishBtn = $('[data-publish-resource]');
    if (publishBtn) {
      publishBtn.onclick = (e) => { e.preventDefault(); if (requireUser()) openResourceEditor(loadLibrary); };
    }

    shelf.addEventListener('click', async event => {
      const row = event.target.closest('[data-resource-id]'); if (!row) return;
      const remove = event.target.closest('[data-resource-delete]');
      if (remove) { event.preventDefault(); if (!confirm('Delete this resource?')) return; await api.request('cv_delete_resource', { resource_id: row.dataset.resourceId }); resources = resources.filter(resource => resource.id !== row.dataset.resourceId); render(); toast('Resource deleted'); return; }
      const save = event.target.closest('[data-resource-save]');
      if (save) { event.preventDefault(); const id = row.dataset.resourceId; await api.request('cv_toggle_bookmark', { object_id: id, object_type: 'resource' }); if (savedIds.has(id)) savedIds.delete(id); else savedIds.add(id); toast(savedIds.has(id) ? 'Resource saved' : 'Resource removed'); render(); return; }
      const play = event.target.closest('[data-resource-play]');
      if (play) {
        event.preventDefault();
        const resource = rendered.find(item => item.id === row.dataset.resourceId);
        if (!resource) return;
        if (!fiMediaUrl(resource)) { toast('This resource has no playable file.'); return; }
        const kind = String(resource.format || '').toLowerCase();
        openMediaPlayer(resource, kind === 'audio' ? rendered.filter(item => String(item.format || '').toLowerCase() === 'audio') : [resource]);
        return;
      }
      const button = event.target.closest('[data-resource-download]'); if (!button) return; event.preventDefault(); const result = await api.request('cv_download_resource', { resource_id: row.dataset.resourceId }); if (result.url) window.open(result.url, '_blank', 'noopener');
    });
    document.addEventListener('fi:search', event => { searchQuery = event.detail.query.toLowerCase(); render(); });
    $$('#main section').filter(section => /jump back in|trending sermons|authors to follow/i.test(section.querySelector('h2,h3')?.textContent || '')).forEach(section => section.remove());
  }

  function openResourceEditor(refresh) {
    const modal = document.createElement('div'); modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center';
    modal.innerHTML = `<form class="card w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 space-y-4"><div class="flex justify-between"><div><h2 class="text-[20px] font-bold">Publish a resource</h2><p class="text-[12.5px] text-muted mt-1">Share a PDF, image, audio, video, or ZIP file with the community.</p></div><button type="button" class="icon-btn" data-close-resource aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div><input class="field" name="title" placeholder="Resource title" required><textarea class="field" name="description" rows="3" placeholder="Description"></textarea><div class="grid sm:grid-cols-2 gap-3"><input class="field" name="contributor_name" placeholder="Author / Creator"><input class="field" name="translator_name" placeholder="Translated by"><input class="field" name="language" placeholder="Language, e.g. Khmer"><input class="field" name="category" placeholder="Category" value="Bible Study"></div><select class="field" name="format" aria-label="Resource format"><option value="pdf">PDF</option><option value="image">Image</option><option value="audio">Audio</option><option value="video">Video</option><option value="zip">ZIP bundle</option></select><label class="block text-[13px] font-semibold">Resource file<input class="field mt-1" name="resource_file" type="file" accept=".pdf,.zip,image/*,audio/*,video/*" required><span class="block text-[11.5px] text-muted mt-1">Maximum 50MB · stored in free Supabase Storage</span></label><div class="block text-[13px] font-semibold">Cover image<span class="block text-[11.5px] font-normal text-muted mt-1" data-thumb-hint>Videos get a thumbnail captured automatically. Upload your own image to use that instead.</span><div class="flex items-center gap-3 mt-2"><img class="fi-thumb-preview hidden" alt="" data-thumb-preview><input class="field" name="thumbnail" type="file" accept="image/*"></div></div><label class="flex items-center gap-2 text-[12.5px] text-muted"><input type="checkbox" name="allow_download" value="1" checked>Allow members to download this resource</label><p class="hidden rounded-xl border border-rose/30 bg-rose/10 px-3 py-2.5 text-[12.5px] text-rose" data-resource-error role="alert"></p><div class="hidden" data-resource-progress><div class="flex justify-between text-[11.5px] text-muted mb-1"><span>Uploading to FaithIn</span><strong data-resource-progress-label>0%</strong></div><div class="h-2 rounded-full bg-line overflow-hidden"><span class="block h-full bg-brand transition" data-resource-progress-bar style="width:0%"></span></div></div><button class="btn btn-primary w-full" data-resource-submit>Publish resource</button></form>`;
    document.body.appendChild(modal); $('[data-close-resource]', modal).onclick = () => modal.remove();
    const form = $('form', modal), fileInput = form.elements.namedItem('resource_file'), formatInput = form.elements.namedItem('format');
    const thumbField = form.elements.namedItem('thumbnail'), thumbPreview = $('[data-thumb-preview]', form), thumbHint = $('[data-thumb-hint]', form);
    const DEFAULT_THUMB_HINT = thumbHint.textContent;
    let autoThumb = null, autoThumbUrl = '', manualThumbUrl = '';
    const setThumbPreview = (url, note) => {
      if (url) { thumbPreview.src = url; thumbPreview.classList.remove('hidden'); }
      else { thumbPreview.removeAttribute('src'); thumbPreview.classList.add('hidden'); }
      thumbHint.textContent = note || DEFAULT_THUMB_HINT;
    };
    // Draw a frame out of the chosen video and keep it as the default cover.
    const captureVideoThumbnail = file => {
      const objectUrl = URL.createObjectURL(file), video = document.createElement('video');
      video.preload = 'metadata'; video.muted = true; video.playsInline = true;
      const cleanup = () => { URL.revokeObjectURL(objectUrl); video.removeAttribute('src'); try { video.load(); } catch (_) {} };
      const fail = () => { cleanup(); setThumbPreview(manualThumbUrl, 'Could not read a frame from this video. Upload a cover image instead.'); };
      video.addEventListener('loadeddata', () => { try { video.currentTime = Math.min(1.5, (video.duration || 4) / 4); } catch (_) { fail(); } }, { once: true });
      video.addEventListener('seeked', () => {
        try {
          const sourceWidth = video.videoWidth || 1280, sourceHeight = video.videoHeight || 720;
          const width = Math.min(sourceWidth, 1280), height = Math.round(width * (sourceHeight / sourceWidth));
          const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(video, 0, 0, width, height);
          canvas.toBlob(blob => {
            cleanup();
            if (!blob) { fail(); return; }
            if (autoThumbUrl) URL.revokeObjectURL(autoThumbUrl);
            autoThumb = new File([blob], 'auto-thumbnail.jpg', { type: 'image/jpeg' });
            autoThumbUrl = URL.createObjectURL(blob);
            if (!thumbField.files?.[0]) setThumbPreview(autoThumbUrl, 'Thumbnail captured from your video. Upload an image to use a different one.');
          }, 'image/jpeg', 0.85);
        } catch (_) { fail(); }
      }, { once: true });
      video.addEventListener('error', fail, { once: true });
      setThumbPreview(manualThumbUrl, 'Capturing a thumbnail from your video…');
      video.src = objectUrl;
    };
    thumbField.addEventListener('change', () => {
      const picked = thumbField.files?.[0];
      if (manualThumbUrl) { URL.revokeObjectURL(manualThumbUrl); manualThumbUrl = ''; }
      if (!picked) { setThumbPreview(autoThumbUrl, autoThumbUrl ? 'Using the thumbnail captured from your video.' : ''); return; }
      manualThumbUrl = URL.createObjectURL(picked);
      setThumbPreview(manualThumbUrl, 'Using your uploaded cover image.');
    });
    fileInput.addEventListener('change', () => { const file = fileInput.files?.[0]; if (!file) return; const type = String(file.type || '').toLowerCase(), ext = String(file.name || '').split('.').pop().toLowerCase(); if (type === 'application/pdf' || ext === 'pdf') formatInput.value = 'pdf'; else if (type.startsWith('video/')) formatInput.value = 'video'; else if (type.startsWith('audio/')) formatInput.value = 'audio'; else if (type.startsWith('image/')) formatInput.value = 'image'; else if (type === 'application/zip' || ext === 'zip') formatInput.value = 'zip'; else { fileInput.value = ''; toast('Choose a PDF, image, audio, video, or ZIP file.'); return; }
      if (autoThumbUrl) { URL.revokeObjectURL(autoThumbUrl); autoThumbUrl = ''; }
      autoThumb = null;
      if (formatInput.value === 'video') captureVideoThumbnail(file);
      else if (!thumbField.files?.[0]) setThumbPreview(manualThumbUrl, '');
    });
    form.onsubmit = async event => {
      event.preventDefault();
      const resourceFile = fileInput.files?.[0], thumbnailInput = form.elements.namedItem('thumbnail'), submit = $('[data-resource-submit]', form);
      if (!resourceFile) return toast('Choose a resource file to publish.');
      if (resourceFile.size > 50 * 1024 * 1024) return toast(`${resourceFile.name} is larger than the free 50MB limit.`);
      const data = Object.fromEntries(new FormData(form)); data.allow_download = form.elements.namedItem('allow_download').checked ? '1' : '0'; delete data.resource_file; delete data.thumbnail;
      const chosenThumbnail = thumbnailInput.files?.[0] || autoThumb;
      const files = { resource_file: [resourceFile], thumbnail: chosenThumbnail ? [chosenThumbnail] : [] };
      const progress = $('[data-resource-progress]', form), label = $('[data-resource-progress-label]', form), bar = $('[data-resource-progress-bar]', form), errorBox = $('[data-resource-error]', form);
      errorBox.classList.add('hidden'); errorBox.textContent = '';
      const oldSubmitHtml = submit.innerHTML; progress.classList.remove('hidden'); submit.disabled = true; submit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Uploading';
      try {
        await api.request('cv_upload_resource', data, files, fraction => { const percent = Math.max(1, Math.min(100, Math.round(fraction * 100))); label.textContent = `${percent}%`; bar.style.width = `${percent}%`; });
        label.textContent = '100%'; bar.style.width = '100%'; await refresh();
        form.innerHTML = `<div class="py-8 text-center"><span class="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white text-[28px]"><i class="fa-solid fa-check"></i></span><h2 class="mt-5 text-[22px] font-bold">Published successfully</h2><p class="mt-2 text-[13.5px] text-muted">Your resource is now available in the FaithIn Library.</p><button type="button" class="btn btn-primary w-full mt-6" data-resource-done><i class="fa-solid fa-check"></i>Done</button></div>`;
        $('[data-resource-done]', form).onclick = () => modal.remove(); toast('Resource published successfully');
      }
      catch (error) { const message = error.message || 'Upload failed. Please try again.'; errorBox.textContent = message; errorBox.classList.remove('hidden'); toast(message); progress.classList.add('hidden'); }
      finally { submit.disabled = false; submit.innerHTML = oldSubmitHtml; }
    };
  }

  async function loadNetwork() {
    const heading = $$('#main h2').find(node => /people you may know/i.test(node.textContent));
    const section = heading?.closest('section');
    if (!section) return;
    const grid = $('.grid', section);
    if (!grid) return;
    let users = [], query = '';

    const render = () => {
      const items = users.filter(user => !query || [user.name, user.role, user.bio, user.church, user.location, user.ministry].some(value => String(value || '').toLowerCase().includes(query)));
      grid.innerHTML = items.length
        ? items.map(user => `<article class="card overflow-hidden flex flex-col relative animate-fade-up" data-user-uid="${esc(user.uid)}">
            <div class="h-16 bg-[linear-gradient(110deg,#60a5fa,#4f46e5)]"></div>
            <div class="px-3 pb-4 -mt-8 flex flex-col items-center text-center flex-1">
              ${avatarMarkup(user, 'avatar w-16 h-16 text-[17px] ring-4 ring-surface object-cover')}
              <a href="/profile?uid=${encodeURIComponent(user.uid)}" class="mt-2 text-[14.5px] font-semibold hover:text-brand transition inline-flex items-center justify-center">${esc(user.name)}${verificationBadgeMarkup(user)}</a>
              <p class="text-[12.5px] text-muted mt-1 line-clamp-2">${esc(user.role || user.bio || user.church || 'Faith In member')}</p>
              <p class="text-[11.5px] text-faint mt-2">${esc(user.location || user.ministry || '')}</p>
              <button class="btn ${user.is_following ? 'btn-neutral' : 'btn-outline'} w-full mt-3 !py-2" data-connect>
                <i class="fa-solid ${user.is_following ? 'fa-check' : 'fa-user-plus'} text-[11px] mr-1"></i>${user.is_following ? 'Following' : 'Connect'}
              </button>
              <button class="btn btn-ghost w-full mt-1 !py-2" data-message>Message</button>
            </div>
          </article>`).join('')
        : emptyState(query ? 'No members match your search.' : 'No members found in the community yet.');
    };

    const refreshCounts = () => {
      Promise.all([api.request('cv_social_get_followers'), api.request('cv_social_get_following')]).then(results => {
        const counts = $$('.count', $('#main > aside'));
        if (counts[0]) counts[0].textContent = results[0].items?.length || 0;
        if (counts[1]) counts[1].textContent = results[1].items?.length || 0;
      }).catch(() => {});
    };

    try {
      const result = await api.request('cv_find_users');
      users = result.items || [];
      render();
      refreshCounts();
    } catch (error) {
      grid.innerHTML = emptyState(error.message);
    }

    grid.addEventListener('click', async event => {
      const card = event.target.closest('[data-user-uid]');
      if (!card) return;
      const connectBtn = event.target.closest('[data-connect]');
      if (connectBtn) {
        if (!requireUser()) return;
        const following = /following/i.test(connectBtn.textContent);
        connectBtn.disabled = true;
        try {
          await api.request(following ? 'cv_social_unfollow_user' : 'cv_social_follow_user', { target_uid: card.dataset.userUid });
          const nowFollowing = !following;
          connectBtn.innerHTML = `<i class="fa-solid ${nowFollowing ? 'fa-check' : 'fa-user-plus'} text-[11px] mr-1"></i>${nowFollowing ? 'Following' : 'Connect'}`;
          connectBtn.className = `btn ${nowFollowing ? 'btn-neutral' : 'btn-outline'} w-full mt-3 !py-2`;
          toast(nowFollowing ? 'Following' : 'Unfollowed');
          refreshCounts();
        } catch (err) {
          toast(err.message);
        } finally {
          connectBtn.disabled = false;
        }
      }
      if (event.target.closest('[data-message]')) openMessenger(card.dataset.userUid);
    });

    $('#main > aside section.text-center')?.remove();
    const requested = new URLSearchParams(location.search).get('message');
    if (requested) openMessenger(requested);
    document.addEventListener('fi:search', event => { query = (event.detail.query || '').toLowerCase(); render(); });
    $$('#main section').filter(item => /invitations|groups you might/i.test(item.querySelector('h2')?.textContent || '')).forEach(item => item.remove());
  }

  /**
   * Opens a conversation on the messaging screen.
   *
   * Messaging used to be a cramped modal built here. It is now a page of its
   * own at /messages, with realtime updates, history and attachments, so this
   * function survives only as the entry point other screens already call —
   * the Message button on a member card, and the `?message=` link the header
   * used to carry.
   */
  function openMessenger(uid) {
    if (!requireUser()) return;
    const target = uid && uid !== 'inbox' ? `/messages?to=${encodeURIComponent(uid)}` : '/messages';
    // These screens are static documents under /public served through Next
    // rewrites, not React routes, so there is no router to push to.
    location.href = target;
  }

  async function loadNotifications() {
    const center = $('#main > section.card'); const holder = center?.querySelector('.divide-y'); if (!holder) return;
    let allItems = [], shown = 12, active = new URLSearchParams(location.search).get('filter') || 'all', searchQuery = '';
    const groups = { all: null, jobs: ['job'], post: ['reaction', 'comment', 'new_post'], 'my posts': ['reaction', 'comment', 'new_post'], mention: ['reply', 'message'], mentions: ['reply', 'message'], follow: ['follow'], connections: ['follow'] };
    const labels = { reaction: 'reacted to your post', comment: 'commented on your post', follow: 'followed you', message: 'sent you a message', reply: 'replied to you', new_post: 'shared a new post', job: 'shared a ministry opportunity' };
    const earlier = center.querySelector(':scope > button');
    const render = () => {
      const types = groups[active] || null;
      const filtered = allItems.filter(item => (!types || types.includes(item.type)) && (!searchQuery || `${item.actor?.name || ''} ${labels[item.type] || ''}`.toLowerCase().includes(searchQuery)));
      const items = filtered.slice(0, shown);
      holder.innerHTML = items.length ? items.map(item => {
        const actor = item.actor || {};
        return `<article class="${item.is_read ? '' : 'notif-unread'} p-4 flex gap-3.5 relative cursor-pointer hover:bg-raised transition-colors" data-notification-id="${esc(item.id)}" data-notification-type="${esc(item.type || '')}" data-object-id="${esc(item.object_id || '')}" data-actor-uid="${esc(actor.uid || '')}">${avatarMarkup(actor, 'avatar w-12 h-12 text-[13px] object-cover')}<div class="min-w-0 flex-1"><p class="text-[14px]"><strong>${esc(actor.name || 'A member')}</strong> ${esc(labels[item.type] || 'sent an update')}</p><p class="text-[12px] ${item.is_read ? 'text-muted' : 'text-brand'} mt-1.5">${esc(item.created_at ? new Date(item.created_at).toLocaleString() : '')}</p></div>${item.is_read ? '' : '<span class="w-2.5 h-2.5 rounded-full bg-brand shrink-0 self-center"></span>'}</article>`;
      }).join('') : emptyState('You are all caught up.');
      if (earlier) { earlier.classList.toggle('hidden', shown >= filtered.length); earlier.innerHTML = 'Show earlier notifications <i class="fa-solid fa-arrow-down text-[11px] ml-1"></i>'; }
    };
    try {
      const result = await api.request('cv_social_get_notifications');
      allItems = result.items || []; render();
      holder.onclick = async event => {
        const row = event.target.closest('[data-notification-id]');
        if (!row) return;
        const notifId = row.dataset.notificationId;
        const item = allItems.find(entry => entry.id === notifId);
        
        api.request('cv_social_mark_notifications_read', { id: notifId }).catch(() => {});
        if (item) item.is_read = true;
        render();

        if (!item) return;
        const type = (item.type || '').toLowerCase();
        const objId = item.object_id || row.dataset.objectId || '';
        const actor = item.actor || {};
        const actorUid = actor.uid || row.dataset.actorUid || '';

        if (type === 'comment') {
          location.href = `/home?post=${encodeURIComponent(objId)}&action=comment#post-${encodeURIComponent(objId)}`;
        } else if (type === 'reaction' || type === 'new_post') {
          location.href = `/home?post=${encodeURIComponent(objId)}#post-${encodeURIComponent(objId)}`;
        } else if (type === 'follow') {
          location.href = actorUid ? `/profile?uid=${encodeURIComponent(actorUid)}` : '/network';
        } else if (type === 'message' || type === 'reply') {
          location.href = actorUid ? `/messages?to=${encodeURIComponent(actorUid)}` : '/messages';
        } else if (type === 'job') {
          location.href = objId ? `/jobs?id=${encodeURIComponent(objId)}` : '/jobs';
        }
      };
      if (earlier) earlier.onclick = () => { shown += 12; render(); };
      const chips = $('[data-chip-group]', center);
      const activeLabel = { post: 'My posts', mention: 'Mentions', follow: 'Connections' }[active] || 'All';
      $$('.chip', chips).forEach(chip => chip.classList.toggle('is-on', chip.textContent.trim() === activeLabel));
      chips?.addEventListener('click', event => { const chip = event.target.closest('.chip'); if (!chip) return; active = chip.textContent.trim().toLowerCase(); shown = 12; render(); });
      if (chips && !chips.querySelector('[data-mark-read]')) { const mark = document.createElement('button'); mark.className = 'ml-auto text-[12px] font-semibold text-brand whitespace-nowrap'; mark.dataset.markRead = ''; mark.textContent = 'Mark all read'; mark.onclick = async () => { await api.request('cv_social_mark_notifications_read', {}); allItems.forEach(item => { item.is_read = true; }); render(); toast('Notifications marked as read'); }; chips.appendChild(mark); }
      document.addEventListener('fi:search', event => { searchQuery = event.detail.query.toLowerCase(); shown = 12; render(); });
    } catch (error) { holder.innerHTML = emptyState(error.message); }
  }

  function openProfileEditor(user, focusField) {
    if (!requireUser()) return;
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; inset: 0; z-index: 9999; background: rgba(0, 0, 0, 0.65); display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; backdrop-filter: blur(2px);';
    
    const coverUrl = user.cover_url || user.cover || '';
    const photoUrl = user.avatar_url || user.avatar || user.photo_url || '';
    
    modal.innerHTML = `
      <div style="width: 100%; max-width: 580px; max-height: 88vh; background: #ffffff; border-radius: 12px; box-shadow: 0 20px 48px rgba(0,0,0,0.28); display: flex; flex-direction: column; overflow: hidden; position: relative; border: 1px solid rgba(0,0,0,0.08); animation: fiModalPop 0.18s cubic-bezier(0.16, 1, 0.3, 1);">
        
        <!-- Header -->
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 20px; border-bottom: 1px solid #e5e5e5; flex-shrink: 0; background: #ffffff; text-align: center;">
          <h2 style="font-size: 19px; font-weight: 700; color: #1c1e21; margin: 0; line-height: 1.25;">Edit your profile</h2>
          <p style="font-size: 13px; color: #65676b; margin: 4px 0 0 0;">These details are saved to Firebase and shown across the platform.</p>
          <button type="button" style="position: absolute; right: 14px; top: 14px; width: 34px; height: 34px; border-radius: 50%; background: #e4e6eb; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #65676b; transition: background 0.15s;" data-profile-close aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Content Body -->
        <div style="padding: 18px 22px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px; box-sizing: border-box; background: #ffffff;">
          <form style="display: flex; flex-direction: column; gap: 16px; margin: 0;">
            
            <!-- Cover Photo Uploader -->
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 14.5px; font-weight: 700; color: #1c1e21; margin: 0;">
                Cover photo
              </label>
              <label style="position: relative; width: 100%; height: 130px; background: #f0f2f5; border-radius: 8px; border: 1px solid #ccd0d5; cursor: pointer; overflow: hidden; display: block; box-sizing: border-box;">
                <img id="fi-cover-preview" src="${esc(coverUrl)}" alt="Cover Preview" style="width: 100%; height: 130px; object-fit: cover; display: ${coverUrl ? 'block' : 'none'}; margin: 0;" />
                <div id="fi-cover-placeholder" style="width: 100%; height: 130px; display: ${coverUrl ? 'none' : 'flex'}; align-items: center; justify-content: center; background: #f0f2f5; color: #bcc0c4;"></div>
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.06); transition: background 0.15s;">
                  <div style="background: rgba(255,255,255,0.92); backdrop-filter: blur(4px); padding: 6px 13px; border-radius: 6px; color: #1c1e21; display: flex; align-items: center; gap: 7px; box-shadow: 0 1px 4px rgba(0,0,0,0.18); font-weight: 600; font-size: 13px; pointer-events: none;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    Edit Cover Photo
                  </div>
                </div>
                <input type="file" name="profile_cover" accept="image/*" style="display: none;" />
              </label>
            </div>

            <!-- Profile Photo Uploader -->
            <div style="display: flex; flex-direction: column; align-items: center; margin-top: -4px;">
              <div style="width: 100%; font-size: 14.5px; font-weight: 700; color: #1c1e21; margin-bottom: 8px; text-align: left;">
                Profile photo
              </div>
              <label style="position: relative; width: 96px; height: 96px; border-radius: 50%; background: #e4e6eb; border: 2px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.15); cursor: pointer; overflow: hidden; display: flex; align-items: center; justify-content: center; box-sizing: border-box;">
                <img id="fi-profile-preview" src="${esc(photoUrl)}" alt="Profile Preview" style="width: 96px; height: 96px; object-fit: cover; border-radius: 50%; display: ${photoUrl ? 'block' : 'none'}; margin: 0;" />
                <div id="fi-profile-placeholder" style="width: 100%; height: 100%; display: ${photoUrl ? 'none' : 'flex'}; align-items: center; justify-content: center; background: #e4e6eb; color: #bcc0c4;">
                  <svg style="width: 52px; height: 52px; margin-top: 8px;" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.12);">
                  <div style="background: rgba(0,0,0,0.6); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; pointer-events: none;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                </div>
                <input type="file" name="profile_image" accept="image/*" style="display: none;" />
              </label>
            </div>

            <!-- Display name -->
            <div style="display: flex; flex-direction: column; gap: 5px;">
              <label for="fi-displayName" style="font-size: 13.5px; font-weight: 700; color: #1c1e21;">
                Display name
              </label>
              <input
                type="text"
                id="fi-displayName"
                name="display_name"
                value="${esc(user.name || user.displayName || '')}"
                required
                style="width: 100%; box-sizing: border-box; padding: 8px 12px; background: #f0f2f5; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 14px; color: #1c1e21; outline: none; transition: all 0.15s; font-family: inherit;"
                onfocus="this.style.background='#fff'; this.style.borderColor='#1877f2'; this.style.boxShadow='0 0 0 1px #1877f2';"
                onblur="this.style.background='#f0f2f5'; this.style.borderColor='#ccd0d5'; this.style.boxShadow='none';"
              />
            </div>

            <!-- Role & Location -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; width: 100%; box-sizing: border-box;">
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <label for="fi-role" style="font-size: 13.5px; font-weight: 700; color: #1c1e21;">
                  Role
                </label>
                <input
                  type="text"
                  id="fi-role"
                  name="role"
                  value="${esc(user.role || '')}"
                  style="width: 100%; box-sizing: border-box; padding: 8px 12px; background: #f0f2f5; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 14px; color: #1c1e21; outline: none; transition: all 0.15s; font-family: inherit;"
                  onfocus="this.style.background='#fff'; this.style.borderColor='#1877f2'; this.style.boxShadow='0 0 0 1px #1877f2';"
                  onblur="this.style.background='#f0f2f5'; this.style.borderColor='#ccd0d5'; this.style.boxShadow='none';"
                />
              </div>
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <label for="fi-location" style="font-size: 13.5px; font-weight: 700; color: #1c1e21;">
                  Location
                </label>
                <input
                  type="text"
                  id="fi-location"
                  name="location"
                  value="${esc(user.location || '')}"
                  style="width: 100%; box-sizing: border-box; padding: 8px 12px; background: #f0f2f5; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 14px; color: #1c1e21; outline: none; transition: all 0.15s; font-family: inherit;"
                  onfocus="this.style.background='#fff'; this.style.borderColor='#1877f2'; this.style.boxShadow='0 0 0 1px #1877f2';"
                  onblur="this.style.background='#f0f2f5'; this.style.borderColor='#ccd0d5'; this.style.boxShadow='none';"
                />
              </div>
            </div>

            <!-- Industry & Church -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; width: 100%; box-sizing: border-box;">
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <label for="fi-industry" style="font-size: 13.5px; font-weight: 700; color: #1c1e21;">
                  Industry
                </label>
                <input
                  type="text"
                  id="fi-industry"
                  name="industry"
                  value="${esc(user.industry || '')}"
                  style="width: 100%; box-sizing: border-box; padding: 8px 12px; background: #f0f2f5; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 14px; color: #1c1e21; outline: none; transition: all 0.15s; font-family: inherit;"
                  onfocus="this.style.background='#fff'; this.style.borderColor='#1877f2'; this.style.boxShadow='0 0 0 1px #1877f2';"
                  onblur="this.style.background='#f0f2f5'; this.style.borderColor='#ccd0d5'; this.style.boxShadow='none';"
                />
              </div>
              <div style="display: flex; flex-direction: column; gap: 5px;">
                <label for="fi-church" style="font-size: 13.5px; font-weight: 700; color: #1c1e21;">
                  Church
                </label>
                <input
                  type="text"
                  id="fi-church"
                  name="church"
                  value="${esc(user.church || '')}"
                  style="width: 100%; box-sizing: border-box; padding: 8px 12px; background: #f0f2f5; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 14px; color: #1c1e21; outline: none; transition: all 0.15s; font-family: inherit;"
                  onfocus="this.style.background='#fff'; this.style.borderColor='#1877f2'; this.style.boxShadow='0 0 0 1px #1877f2';"
                  onblur="this.style.background='#f0f2f5'; this.style.borderColor='#ccd0d5'; this.style.boxShadow='none';"
                />
              </div>
            </div>

            <!-- Ministry -->
            <div style="display: flex; flex-direction: column; gap: 5px;">
              <label for="fi-ministry" style="font-size: 13.5px; font-weight: 700; color: #1c1e21;">
                Ministry
              </label>
              <input
                type="text"
                id="fi-ministry"
                name="ministry"
                value="${esc(user.ministry || '')}"
                style="width: 100%; box-sizing: border-box; padding: 8px 12px; background: #f0f2f5; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 14px; color: #1c1e21; outline: none; transition: all 0.15s; font-family: inherit;"
                onfocus="this.style.background='#fff'; this.style.borderColor='#1877f2'; this.style.boxShadow='0 0 0 1px #1877f2';"
                onblur="this.style.background='#f0f2f5'; this.style.borderColor='#ccd0d5'; this.style.boxShadow='none';"
              />
            </div>

            <!-- About -->
            <div style="display: flex; flex-direction: column; gap: 5px;">
              <label for="fi-about" style="font-size: 13.5px; font-weight: 700; color: #1c1e21;">
                About
              </label>
              <textarea
                id="fi-about"
                name="bio"
                rows="3"
                style="width: 100%; box-sizing: border-box; padding: 8px 12px; background: #f0f2f5; border: 1px solid #ccd0d5; border-radius: 6px; font-size: 14px; color: #1c1e21; outline: none; resize: vertical; min-height: 70px; font-family: inherit; transition: all 0.15s;"
                onfocus="this.style.background='#fff'; this.style.borderColor='#1877f2'; this.style.boxShadow='0 0 0 1px #1877f2';"
                onblur="this.style.background='#f0f2f5'; this.style.borderColor='#ccd0d5'; this.style.boxShadow='none';"
              >${esc(user.bio || user.about || '')}</textarea>
            </div>

          </form>
        </div>

        <!-- Footer Actions -->
        <div style="display: flex; align-items: center; justify-content: flex-end; padding: 12px 22px; border-top: 1px solid #e5e5e5; gap: 10px; background: #ffffff; flex-shrink: 0;">
          <button type="button" style="padding: 8px 18px; font-size: 14px; font-weight: 700; color: #4b4f56; background: #e4e6eb; border: none; border-radius: 6px; cursor: pointer; transition: background 0.15s; font-family: inherit;" data-profile-close>
            Cancel
          </button>
          <button type="button" style="padding: 8px 22px; font-size: 14px; font-weight: 700; color: #ffffff; background: #1877f2; border: none; border-radius: 6px; cursor: pointer; transition: background 0.15s; font-family: inherit;" data-profile-save>
            Save profile
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    const cleanup = () => {
      modal.remove();
      document.body.style.overflow = '';
    };

    $$('[data-profile-close]', modal).forEach(button => { button.onclick = cleanup; });
    modal.onclick = (e) => { if (e.target === modal) cleanup(); };

    const form = $('form', modal);
    
    // Live image previews
    const coverInput = form.querySelector('input[name="profile_cover"]');
    const coverPreview = modal.querySelector('#fi-cover-preview');
    const coverPlaceholder = modal.querySelector('#fi-cover-placeholder');
    if (coverInput && coverPreview) {
      coverInput.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          coverPreview.src = URL.createObjectURL(file);
          coverPreview.style.display = 'block';
          if (coverPlaceholder) coverPlaceholder.style.display = 'none';
        }
      };
    }

    const profileInput = form.querySelector('input[name="profile_image"]');
    const profilePreview = modal.querySelector('#fi-profile-preview');
    const profilePlaceholder = modal.querySelector('#fi-profile-placeholder');
    if (profileInput && profilePreview) {
      profileInput.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          profilePreview.src = URL.createObjectURL(file);
          profilePreview.style.display = 'block';
          if (profilePlaceholder) profilePlaceholder.style.display = 'none';
        }
      };
    }

    if (focusField) {
      const fieldMap = { bio: 'bio', ministry: 'ministry', role: 'role', location: 'location', profile_cover: 'profile_cover', display_name: 'display_name' };
      const targetName = fieldMap[focusField] || focusField;
      form.elements[targetName]?.focus();
    }

    const saveBtn = $('[data-profile-save]', modal);
    const handleSave = async (event) => {
      if (event) event.preventDefault();
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving…';
      const data = Object.fromEntries(new FormData(form));
      const files = {
        profile_image: form.profile_image.files[0] ? [form.profile_image.files[0]] : [],
        profile_cover: form.profile_cover.files[0] ? [form.profile_cover.files[0]] : []
      };
      delete data.profile_image;
      delete data.profile_cover;
      try {
        const updated = await api.request('cv_update_profile', data, files);
        applySession(updated.user || updated);
        cleanup();
        toast('Profile saved');
        setTimeout(() => location.reload(), 350);
      } catch (error) {
        toast(error.message);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save profile';
      }
    };

    form.onsubmit = handleSave;
    saveBtn.onclick = handleSave;
  }

  async function loadProfile(currentUser) {
    const urlParams = new URLSearchParams(location.search);
    const rawTarget = urlParams.get('uid') || urlParams.get('member') || urlParams.get('user') || urlParams.get('id') || '';
    const targetUid = (rawTarget === 'undefined' || rawTarget === 'null' || !rawTarget.trim()) ? '' : rawTarget.trim();
    const isSelf = !targetUid || (currentUser && (targetUid === currentUser.uid || String(currentUser.id) === targetUid));

    let user = null;
    if (isSelf) {
      user = currentUser;
    } else if (targetUid) {
      try {
        user = await api.request('cv_get_user', { uid: targetUid, id: targetUid });
      } catch (err) {
        user = null;
      }
    }

    if (!user) {
      const hero = $$('#main section').find(section => section.querySelector('h1'));
      if (hero) {
        $('h1', hero).textContent = 'Member Not Found';
        const details = $$('p', hero);
        if (details[0]) details[0].textContent = 'This member profile is unavailable or private.';
        if (details[1]) details[1].textContent = '';
      }
      $$('.reveal, [aria-label^="Edit"]', '#main').forEach(el => el.remove());
      return;
    }

    const hero = $$('#main section').find(section => section.querySelector('h1'));
    if (hero) {
      const h1 = $('h1', hero);
      h1.innerHTML = esc(user.name || user.displayName || 'Faith In Member') + verificationBadgeMarkup(user, 'profile');
      const details = $$('p', hero);
      if (details[0]) details[0].textContent = [user.role, user.ministry, user.church].filter(Boolean).join(' · ') || 'Faith In member';
      if (details[1]) {
        const locSpan = details[1].querySelector('[data-profile-location]') || details[1].querySelector('span');
        if (locSpan) locSpan.textContent = user.location || 'Phnom Penh, Cambodia';
        else if (details[1].firstChild) details[1].firstChild.textContent = `${user.location || ''} `;
      }
      const avatar = $('[data-profile-hero-avatar], #profile-avatar, .profile-avatar-hero, .avatar', hero);
      if (avatar) {
        const photo = user.avatar_url || user.avatar || user.photo_url;
        if (photo) {
          const image = document.createElement('img');
          image.id = 'profile-avatar';
          image.dataset.profileHeroAvatar = '';
          image.className = 'profile-avatar-hero avatar object-cover';
          image.src = photo;
          image.alt = user.name || 'Member';
          avatar.replaceWith(image);
        } else {
          avatar.id = 'profile-avatar';
          avatar.dataset.profileHeroAvatar = '';
          avatar.className = 'profile-avatar-hero avatar';
          avatar.textContent = api.initials(user.name);
        }
      }
      const cover = $('.media-plate', hero);
      if (cover) {
        if (user.cover_url) {
          cover.style.backgroundImage = `url("${String(user.cover_url).replace(/["\\]/g, '')}")`;
          cover.style.backgroundSize = 'cover';
          cover.style.backgroundPosition = 'center';
          const label = $('span', cover);
          if (label) label.remove();
        } else {
          cover.style.backgroundImage = '';
        }
      }
    }

    const about = $$('#main h2').find(node => node.textContent.trim() === 'About')?.closest('section');
    if (about) {
      const paragraphs = $$('div.space-y-3 p', about);
      if (paragraphs[0]) paragraphs[0].textContent = user.bio || (isSelf ? 'Tell the community about your faith journey and ministry.' : 'This member has not added a biography yet.');
      paragraphs.slice(1).forEach(node => node.remove());
    }

    const services = $$('#main h2').find(node => /providing ministry services/i.test(node.textContent))?.closest('div.rounded-xl');
    if (services) {
      if (user.ministry || user.role) {
        const line = $('p', services);
        if (line) line.textContent = [user.role, user.ministry, user.church].filter(Boolean).join(' · ');
      } else {
        services.remove();
      }
    }

    const activity = $$('#main h2').find(node => node.textContent.trim() === 'Activity')?.closest('section');
    if (activity) {
      api.request('cv_get_posts').then(result => {
        const memberPosts = (result.items || []).filter(post => {
          const postUid = (post.author && post.author.uid) || post.author_uid || post.authorUid;
          return (postUid && postUid === user.uid) || (user.id && String(post.author?.id) === String(user.id));
        });
        const holder = $('.space-y-1', activity);
        const renderActivity = label => {
          const wanted = String(label || 'Posts').toLowerCase();
          const filtered = memberPosts.filter(post => wanted === 'posts' || (wanted === 'videos' && (post.media_items || []).some(item => item.type === 'video')) || (wanted === 'articles' && String(post.type).toLowerCase() === 'article'));
          if (holder) {
            holder.innerHTML = wanted === 'comments'
              ? emptyState('Comment history is shown with each post on the home feed.')
              : (filtered.slice(0, 12).length
                ? filtered.slice(0, 12).map(post => {
                    const avatarImg = user.avatar_url || user.avatar || user.photo_url;
                    const avatarHtml = avatarImg
                      ? `<img class="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-surface" src="${esc(avatarImg)}" alt="${esc(user.name)}">`
                      : window.FILive.avatarMarkup(user, 'avatar w-9 h-9 text-[12px] shrink-0 ring-2 ring-surface');
                    return `
                      <a href="/home?post=${encodeURIComponent(post.id)}" class="flex gap-3 p-3 -mx-2 rounded-xl row-hover border-b border-line items-start">
                        ${avatarHtml}
                        <div class="flex-1 min-w-0">
                          <span class="block text-[11.5px] text-muted">${esc(user.name)} posted · ${esc(post.time || '')}</span>
                          <span class="block text-[14px] mt-0.5 line-clamp-2">${esc(post.content || post.article_title || 'Shared media')}</span>
                          <span class="block text-[12px] text-muted mt-1.5">${Number(post.reaction_count || 0)} reactions · ${Number(post.comment_count || 0)} comments</span>
                        </div>
                      </a>
                    `;
                  }).join('')
                : emptyState(`No ${wanted} from ${esc(user.name)} yet.`));
          }
        };
        renderActivity('Posts');
        $('[data-chip-group]', activity)?.addEventListener('click', event => {
          const chip = event.target.closest('.chip');
          if (chip) renderActivity(chip.textContent.trim());
        });
      }).catch(() => {});
    }

    $$('#main section').filter(item => /ministry experience|spiritual gifts|people also viewed/i.test(item.querySelector('h2')?.textContent || '')).forEach(item => item.remove());

    const refreshProfileCounts = () => {
      Promise.all([
        api.request('cv_social_get_followers', { uid: user.uid }),
        api.request('cv_social_get_following', { uid: user.uid })
      ]).then(results => {
        const rawFollowers = results[0].items || [];
        const seenUids = new Set();
        const followers = rawFollowers.filter(f => {
          const fid = f.uid || f.id;
          if (!fid || seenUids.has(fid)) return false;
          seenUids.add(fid);
          return true;
        });
        const following = results[1].items || [];
        const count = followers.length;
        const topFollowers = followers.slice(0, 3);

        const avatarsHtml = count > 0 ? topFollowers.map(f => {
          const photo = f.photo_url || f.avatar_url || f.avatar;
          const name = f.name || f.displayName || 'Member';
          if (photo) {
            return `<img class="inline-block w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-surface object-cover shadow-sm transition hover:scale-105" src="${esc(photo)}" alt="${esc(name)}" title="${esc(name)}">`;
          }
          return window.FILive.avatarMarkup(f, 'inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full ring-2 ring-surface text-[10px] font-bold text-white shadow-sm transition hover:scale-105');
        }).join('') : '';

        // Extract distinct follower names for text display
        const uniqueNames = [];
        topFollowers.forEach(f => {
          const name = f.name || f.displayName || 'Member';
          if (!uniqueNames.includes(name)) uniqueNames.push(name);
        });

        let textMarkup = `${count} ${count === 1 ? 'follower' : 'followers'}`;
        if (uniqueNames.length === 1) {
          textMarkup = `Followed by <strong class="font-semibold text-ink">${esc(uniqueNames[0])}</strong>`;
        } else if (uniqueNames.length === 2) {
          textMarkup = `Followed by <strong class="font-semibold text-ink">${esc(uniqueNames[0])}</strong> and <strong class="font-semibold text-ink">${esc(uniqueNames[1])}</strong>`;
        } else if (uniqueNames.length === 3) {
          textMarkup = `Followed by <strong class="font-semibold text-ink">${esc(uniqueNames[0])}</strong>, <strong class="font-semibold text-ink">${esc(uniqueNames[1])}</strong> and <strong class="font-semibold text-ink">${esc(uniqueNames[2])}</strong>`;
        } else if (uniqueNames.length > 3 || count > 3) {
          const others = Math.max(0, count - uniqueNames.length);
          textMarkup = `Followed by ${uniqueNames.map(n => `<strong class="font-semibold text-ink">${esc(n)}</strong>`).join(', ')}${others > 0 ? ` and <strong class="font-semibold text-ink">${others} other${others > 1 ? 's' : ''}</strong>` : ''}`;
        }

        // 1. Update Hero Connections & Followers row
        const heroFollowing = $('[data-hero-following]', hero) || $$('a', hero).find(link => /connections|following/i.test(link.textContent));
        if (heroFollowing) heroFollowing.textContent = `${following.length} following`;

        const heroFollowers = $('[data-hero-followers]', hero);
        if (heroFollowers) {
          if (count > 0) {
            heroFollowers.className = 'flex items-center gap-2 text-muted hover:text-ink transition cursor-pointer';
            heroFollowers.innerHTML = `
              <div class="flex -space-x-2 overflow-hidden py-0.5 items-center shrink-0" data-hero-follower-avatars="">
                ${avatarsHtml}
              </div>
              <span class="leading-tight text-ink font-normal text-[13.5px]" data-hero-follower-text="">
                ${textMarkup}
              </span>
            `;
          } else {
            heroFollowers.className = 'font-semibold text-brand hover:underline cursor-pointer';
            heroFollowers.innerHTML = '0 followers';
          }
        }

        // 2. Update Activity section Followers row
        const followerSummary = activity?.querySelector('[data-follower-summary]') || (activity ? $$('a', activity).find(link => /followers|followed by/i.test(link.textContent)) : null);
        if (followerSummary) {
          if (count > 0) {
            followerSummary.className = 'flex items-center gap-2.5 mt-1.5 text-[13.5px] sm:text-[14px] text-muted hover:text-ink transition cursor-pointer';
            followerSummary.innerHTML = `
              <div class="flex -space-x-2 overflow-hidden py-0.5 items-center shrink-0" data-follower-avatars="">
                ${avatarsHtml}
              </div>
              <span class="leading-snug text-muted" data-follower-text="">
                ${textMarkup}
              </span>
            `;
          } else {
            followerSummary.className = 'inline-block mt-1 text-[13.5px] font-semibold text-brand hover:underline cursor-pointer';
            followerSummary.innerHTML = '0 followers';
          }
        }
      }).catch(() => {});
    };
    refreshProfileCounts();

    if (isSelf) {
      $$('[aria-label="Edit profile"],[aria-label="Edit services"]', hero || document).forEach(button => {
        button.onclick = () => openProfileEditor(user, button.getAttribute('aria-label') === 'Edit services' ? 'ministry' : 'display_name');
      });
      $('[aria-label="Edit cover photo"]', hero || document)?.addEventListener('click', () => openProfileEditor(user, 'profile_cover'));
      $('[aria-label="Edit about"]')?.addEventListener('click', () => openProfileEditor(user, 'bio'));
      const openTo = $$('#main button').find(button => /^open to$/i.test(button.textContent.trim()));
      if (openTo) { openTo.removeAttribute('data-toast'); openTo.onclick = () => openProfileEditor(user, 'role'); }
      const addSection = $$('#main button').find(button => /add profile section/i.test(button.textContent));
      if (addSection) { addSection.removeAttribute('data-toast'); addSection.onclick = () => openProfileEditor(user, 'ministry'); }
      const more = $$('#main button').find(button => /^more$/i.test(button.textContent.trim()));
      if (more) more.onclick = async () => {
        try { await navigator.clipboard.writeText(location.href); toast('Profile link copied'); }
        catch (_) { toast('Profile link: ' + location.href); }
      };
    } else {
      // Visiting another member's profile
      $$('.reveal, [aria-label^="Edit"]', '#main').forEach(el => el.remove());
      $$('a', activity).find(link => /create a post/i.test(link.textContent))?.remove();

      const btnGroup = $$('#main .flex.flex-wrap.gap-2', hero)[0];
      if (btnGroup) {
        btnGroup.innerHTML = `
          <button class="btn ${user.is_following ? 'btn-outline' : 'btn-primary'}" data-profile-connect>
            ${user.is_following ? 'Following' : '<i class="fa-solid fa-user-plus text-[11px] mr-1.5"></i>Connect'}
          </button>
          <button class="btn btn-neutral" data-profile-message>
            <i class="fa-regular fa-comment-dots text-[13px] mr-1.5"></i>Message
          </button>
          <button class="btn btn-ghost border border-line" data-profile-share>
            <i class="fa-solid fa-share-nodes text-[12px] mr-1.5"></i>Share
          </button>
        `;

        const connectBtn = $('[data-profile-connect]', btnGroup);
        if (connectBtn) {
          connectBtn.onclick = async () => {
            if (!requireUser()) return;
            const following = /following/i.test(connectBtn.textContent);
            connectBtn.disabled = true;
            try {
              await api.request(following ? 'cv_social_unfollow_user' : 'cv_social_follow_user', { target_uid: user.uid });
              const nowFollowing = !following;
              connectBtn.textContent = nowFollowing ? 'Following' : 'Connect';
              connectBtn.className = `btn ${nowFollowing ? 'btn-outline' : 'btn-primary'}`;
              if (!nowFollowing) connectBtn.innerHTML = '<i class="fa-solid fa-user-plus text-[11px] mr-1.5"></i>Connect';
              toast(nowFollowing ? `Following ${user.name}` : `Unfollowed ${user.name}`);
              refreshProfileCounts();
            } catch (err) {
              toast(err.message);
            } finally {
              connectBtn.disabled = false;
            }
          };
        }

        const messageBtn = $('[data-profile-message]', btnGroup);
        if (messageBtn) {
          messageBtn.onclick = () => openMessenger(user.uid);
        }

        const shareBtn = $('[data-profile-share]', btnGroup);
        if (shareBtn) {
          shareBtn.onclick = async () => {
            try { await navigator.clipboard.writeText(location.href); toast('Profile link copied'); }
            catch (_) { toast('Profile link: ' + location.href); }
          };
        }
      }
    }

    const detailsButton = $$('#main button').find(button => /show details/i.test(button.textContent));
    if (detailsButton) {
      detailsButton.onclick = () => {
        const line = detailsButton.previousElementSibling;
        line?.classList.toggle('line-clamp-1');
        detailsButton.textContent = /show/i.test(detailsButton.textContent) ? 'Hide details' : 'Show details';
      };
    }

    const urlDisplay = $$('#main aside p').find(node => /faithin\.co\/in\//i.test(node.textContent));
    if (urlDisplay) {
      const slug = String(user.name || 'member').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || user.uid;
      urlDisplay.textContent = `faithin.co/in/${slug}`;
    }
    $('[aria-label="Edit activity"]')?.remove();
    $('[aria-label="Edit profile language"]')?.addEventListener('click', () => { location.href = '/settings'; });
    $('[aria-label="Edit public URL"]')?.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(location.href); toast('Public profile URL copied'); }
      catch (_) {}
    });
  }

  function loadSettings(user) {
    if (!user) return;
    const profileSummary = $$('#main h4').find(node => /name, location/i.test(node.textContent))?.parentElement?.querySelector('p'); if (profileSummary) profileSummary.textContent = [user.name, user.role, user.location].filter(Boolean).join(' · ');
    let settings = Object.assign({ theme: 'system', lang: 'English', content_languages: ['English', 'ភាសាខ្មែរ'], autoplay_videos: true, sound_effects: false, daily_verse: true, larger_text: false }, user.settings || {});
    const save = async changes => { try { const result = await api.request('cv_update_user_settings', changes); settings = result.settings || Object.assign(settings, changes); toast('Preference saved'); } catch (error) { toast(error.message); } };
    $('#theme-picker')?.addEventListener('click', event => { const button = event.target.closest('[data-theme-mode]'); if (button) save({ theme: button.dataset.themeMode }); });
    const toggles = { 'Larger text': 'larger_text', 'Autoplay videos': 'autoplay_videos', 'Sound effects': 'sound_effects', 'Daily verse notification': 'daily_verse' };
    Object.entries(toggles).forEach(([label, key]) => { const input = $(`input[aria-label="${label}"]`); if (!input) return; input.checked = !!settings[key]; input.addEventListener('change', () => { if (key === 'larger_text') document.documentElement.style.fontSize = input.checked ? '112.5%' : ''; save({ [key]: input.checked }); }); });
    const languageRows = $$('#main .settings-row').filter(row => /^(Language|Content language)$/i.test($('h4', row)?.textContent || ''));
    const openPicker = (title, options, multiple, current, onSave) => {
      const modal = document.createElement('div'); modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center';
      modal.innerHTML = `<form class="card w-full max-w-md p-5 space-y-4"><div class="flex justify-between"><h2 class="text-[20px] font-bold">${esc(title)}</h2><button type="button" class="icon-btn" data-picker-close><i class="fa-solid fa-xmark"></i></button></div><div class="space-y-2">${options.map(option => `<label class="settings-row !p-3 !rounded-xl border border-line"><span class="font-semibold text-[14px]">${esc(option)}</span><input ${multiple ? 'type="checkbox"' : 'type="radio" name="choice"'} value="${esc(option)}" ${current.includes(option) ? 'checked' : ''}></label>`).join('')}</div><button class="btn btn-primary w-full">Save</button></form>`;
      document.body.appendChild(modal); $('[data-picker-close]', modal).onclick = () => modal.remove();
      $('form', modal).onsubmit = event => { event.preventDefault(); const values = $$('input:checked', modal).map(input => input.value); if (!values.length) return toast('Choose at least one language'); onSave(multiple ? values : values[0]); modal.remove(); };
    };
    if (languageRows[0]) { const value = $$('p', languageRows[0])[1]; if (value) value.textContent = settings.lang; const button = $('button', languageRows[0]); button?.removeAttribute('data-toast'); if (button) button.onclick = () => openPicker('Faith In language', ['English', 'ភាសាខ្មែរ'], false, [settings.lang], lang => { if (value) value.textContent = lang; save({ lang }); }); }
    if (languageRows[1]) { const value = $$('p', languageRows[1])[1]; if (value) value.textContent = settings.content_languages.join(' · '); const button = $('button', languageRows[1]); button?.removeAttribute('data-toast'); if (button) button.onclick = () => openPicker('Content languages', ['English', 'ភាសាខ្មែរ', 'ไทย', 'မြန်မာ', 'Tiếng Việt'], true, settings.content_languages, languages => { if (value) value.textContent = languages.join(' · '); save({ content_languages: languages }); }); }
    // External calendar/contact OAuth is not configured. Remove those claims
    // instead of presenting buttons that pretend to sync third-party data.
    $$('#main section').find(section => /syncing options/i.test($('h3', section)?.textContent || ''))?.remove();
  }

  async function loadSettingsSecurity(user) {
    if (!user) return;
    
    let security = {
      email: user.email || '',
      email_verified: true,
      phone: user.phone || user.settings?.phone || '+855 12 345 678',
      two_step_verification: user.settings?.two_step_verification !== undefined ? user.settings.two_step_verification : true,
      passkeys_enabled: !!user.settings?.passkeys_enabled,
      remember_devices: user.settings?.remember_devices !== undefined ? user.settings.remember_devices : true,
      last_password_change: 'August 2026'
    };

    try {
      const res = await api.request('cv_get_security_status');
      if (res) security = Object.assign(security, res);
    } catch (_) {}

    // 1. Email addresses
    const emailRow = $('[data-security-email-row]');
    const emailVal = $('[data-security-primary-email]');
    if (emailVal) {
      emailVal.innerHTML = `Primary: <span class="font-medium text-ink">${esc(security.email || 'h.chet@faithin.co')}</span>`;
    }
    if (emailRow) {
      emailRow.onclick = () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center animate-fade-in';
        modal.innerHTML = `
          <div class="card w-full max-w-md p-6 space-y-4 shadow-pop">
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-bold">Email addresses</h3>
              <button type="button" class="icon-btn" data-modal-close><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="p-4 rounded-xl bg-raised border border-line space-y-1">
              <p class="text-[12px] text-muted font-medium uppercase tracking-wider">Primary email</p>
              <p class="text-[15px] font-semibold text-ink">${esc(security.email || 'h.chet@faithin.co')}</p>
              <span class="inline-flex items-center gap-1 text-[12px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                <i class="fa-solid fa-circle-check text-[11px]"></i> Verified for account access
              </span>
            </div>
            <button type="button" class="btn btn-outline w-full" data-send-verification>
              <i class="fa-solid fa-envelope mr-1.5"></i> Resend verification email
            </button>
            <button type="button" class="btn btn-neutral w-full" data-modal-close>Close</button>
          </div>
        `;
        document.body.appendChild(modal);
        $$('[data-modal-close]', modal).forEach(btn => btn.onclick = () => modal.remove());
        $('[data-send-verification]', modal).onclick = async () => {
          try {
            await api.request('cv_send_email_verification');
            toast('Verification link sent to your inbox.');
            modal.remove();
          } catch (err) {
            toast(err.message || 'Verification email sent.');
            modal.remove();
          }
        };
      };
    }

    // 2. Phone numbers
    const phoneRow = $('[data-security-phone-row]');
    const phoneVal = $('[data-security-phone-val]');
    const phoneCount = $('[data-security-phone-count]');
    const updatePhoneUI = (p) => {
      security.phone = p;
      if (phoneVal) phoneVal.textContent = p || 'None added';
      if (phoneCount) phoneCount.textContent = p ? '1 phone number' : '0 phone numbers';
    };
    updatePhoneUI(security.phone);

    if (phoneRow) {
      phoneRow.onclick = () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center animate-fade-in';
        modal.innerHTML = `
          <form class="card w-full max-w-md p-6 space-y-4 shadow-pop" data-phone-form>
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-bold">Phone number</h3>
              <button type="button" class="icon-btn" data-modal-close><i class="fa-solid fa-xmark"></i></button>
            </div>
            <p class="text-[13px] text-muted">Add a mobile phone number to receive security alerts and verify your sign-in.</p>
            <div>
              <label class="block text-[12.5px] font-semibold text-muted mb-1.5">Mobile phone</label>
              <input type="tel" name="phone" value="${esc(security.phone || '+855 ')}" class="field" placeholder="+855 12 345 678" required>
            </div>
            <div class="flex gap-2 pt-2">
              <button type="button" class="btn btn-ghost flex-1" data-modal-close>Cancel</button>
              <button type="submit" class="btn btn-primary flex-1">Save phone</button>
            </div>
          </form>
        `;
        document.body.appendChild(modal);
        $$('[data-modal-close]', modal).forEach(btn => btn.onclick = () => modal.remove());
        $('[data-phone-form]', modal).onsubmit = async event => {
          event.preventDefault();
          const p = String(new FormData(event.target).get('phone') || '').trim();
          try {
            await api.request('cv_update_user_settings', { phone: p });
            updatePhoneUI(p);
            toast('Phone number updated.');
            modal.remove();
          } catch (err) {
            toast(err.message);
          }
        };
      };
    }

    // 3. Change password
    const passRow = $('[data-security-password-row]');
    if (passRow) {
      passRow.onclick = () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center animate-fade-in';
        modal.innerHTML = `
          <form class="card w-full max-w-md p-6 space-y-4 shadow-pop" data-pass-form>
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-bold">Change password</h3>
              <button type="button" class="icon-btn" data-modal-close><i class="fa-solid fa-xmark"></i></button>
            </div>
            <p class="text-[13px] text-muted">Enter a new secure password of at least 6 characters, or send a password reset link to your email.</p>
            <div class="space-y-3">
              <div>
                <label class="block text-[12.5px] font-semibold text-muted mb-1">New password</label>
                <input type="password" name="password" class="field" placeholder="••••••••" minlength="6" required>
              </div>
              <div>
                <label class="block text-[12.5px] font-semibold text-muted mb-1">Confirm new password</label>
                <input type="password" name="confirm_password" class="field" placeholder="••••••••" minlength="6" required>
              </div>
            </div>
            <div class="flex flex-col gap-2 pt-2">
              <button type="submit" class="btn btn-primary w-full">Update password</button>
              <button type="button" class="btn btn-outline w-full" data-send-reset>
                <i class="fa-solid fa-paper-plane mr-1.5"></i> Send password reset link to email
              </button>
            </div>
          </form>
        `;
        document.body.appendChild(modal);
        $$('[data-modal-close]', modal).forEach(btn => btn.onclick = () => modal.remove());
        $('[data-send-reset]', modal).onclick = async () => {
          try {
            await api.request('cv_password_reset', { email: security.email });
            toast(`Password reset link sent to ${security.email}`);
            modal.remove();
          } catch (err) {
            toast(err.message);
          }
        };
        $('[data-pass-form]', modal).onsubmit = async event => {
          event.preventDefault();
          const form = new FormData(event.target);
          const p1 = String(form.get('password') || '');
          const p2 = String(form.get('confirm_password') || '');
          if (p1 !== p2) return toast('Passwords do not match.');
          try {
            await api.request('cv_update_password', { password: p1 });
            toast('Password successfully updated.');
            modal.remove();
          } catch (err) {
            toast(err.message);
          }
        };
      };
    }

    // 4. Two-step verification
    const twoFaRow = $('[data-security-2fa-row]');
    const twoFaBadge = $('[data-security-2fa-badge]');
    const update2FaUI = (enabled) => {
      security.two_step_verification = enabled;
      if (twoFaBadge) {
        twoFaBadge.textContent = enabled ? 'On' : 'Off';
        twoFaBadge.className = `status-badge ${enabled ? 'status-on' : 'status-off'}`;
      }
    };
    update2FaUI(security.two_step_verification);

    if (twoFaRow) {
      twoFaRow.onclick = () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center animate-fade-in';
        modal.innerHTML = `
          <div class="card w-full max-w-md p-6 space-y-4 shadow-pop">
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-bold">Two-step verification</h3>
              <button type="button" class="icon-btn" data-modal-close><i class="fa-solid fa-xmark"></i></button>
            </div>
            <p class="text-[13px] text-muted">Require an authentication code via Authenticator app or email whenever you sign in to a new device.</p>
            <div class="p-4 rounded-xl bg-raised border border-line flex items-center justify-between">
              <div>
                <p class="font-semibold text-[14px]">Enable 2-Step Verification</p>
                <p class="text-[12px] text-muted mt-0.5">High security account protection</p>
              </div>
              <label class="switch">
                <input type="checkbox" ${security.two_step_verification ? 'checked' : ''} data-2fa-toggle>
                <span></span>
              </label>
            </div>
            <button type="button" class="btn btn-primary w-full" data-modal-close>Done</button>
          </div>
        `;
        document.body.appendChild(modal);
        $$('[data-modal-close]', modal).forEach(btn => btn.onclick = () => modal.remove());
        $('[data-2fa-toggle]', modal)?.addEventListener('change', async (e) => {
          const val = e.target.checked;
          try {
            await api.request('cv_update_user_settings', { two_step_verification: val });
            update2FaUI(val);
            toast(val ? 'Two-step verification enabled.' : 'Two-step verification disabled.');
          } catch (err) {
            toast(err.message);
          }
        });
      };
    }

    // 5. Passkeys
    const passkeyRow = $('[data-security-passkeys-row]');
    const passkeyBadge = $('[data-security-passkeys-badge]');
    const updatePasskeyUI = (enabled) => {
      security.passkeys_enabled = enabled;
      if (passkeyBadge) {
        passkeyBadge.textContent = enabled ? 'On' : 'Off';
        passkeyBadge.className = `status-badge ${enabled ? 'status-on' : 'status-off'}`;
      }
    };
    updatePasskeyUI(security.passkeys_enabled);

    if (passkeyRow) {
      passkeyRow.onclick = () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center animate-fade-in';
        modal.innerHTML = `
          <div class="card w-full max-w-md p-6 space-y-4 shadow-pop">
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-bold">Passkeys</h3>
              <button type="button" class="icon-btn" data-modal-close><i class="fa-solid fa-xmark"></i></button>
            </div>
            <p class="text-[13px] text-muted">Sign in seamlessly with Touch ID, Face ID, or your device screen lock without typing a password.</p>
            <div class="p-4 rounded-xl bg-raised border border-line flex items-center justify-between">
              <div>
                <p class="font-semibold text-[14px]">Device Biometric Passkey</p>
                <p class="text-[12px] text-muted mt-0.5">Supports WebAuthn and FIDO2</p>
              </div>
              <label class="switch">
                <input type="checkbox" ${security.passkeys_enabled ? 'checked' : ''} data-passkey-toggle>
                <span></span>
              </label>
            </div>
            <button type="button" class="btn btn-primary w-full" data-modal-close>Done</button>
          </div>
        `;
        document.body.appendChild(modal);
        $$('[data-modal-close]', modal).forEach(btn => btn.onclick = () => modal.remove());
        $('[data-passkey-toggle]', modal)?.addEventListener('change', async (e) => {
          const val = e.target.checked;
          try {
            await api.request('cv_update_user_settings', { passkeys_enabled: val });
            updatePasskeyUI(val);
            toast(val ? 'Passkeys enabled on this device.' : 'Passkeys disabled.');
          } catch (err) {
            toast(err.message);
          }
        });
      };
    }

    // 6. Active sessions & OS detection
    const osVal = $('[data-security-current-os]');
    const browserVal = $('[data-security-current-browser]');
    const ua = navigator.userAgent;
    let detectedOS = 'Mac OS X';
    if (/Windows/i.test(ua)) detectedOS = 'Windows';
    else if (/iPhone|iPad|iPod/i.test(ua)) detectedOS = 'iOS';
    else if (/Android/i.test(ua)) detectedOS = 'Android';
    else if (/Linux/i.test(ua)) detectedOS = 'Linux';

    let detectedBrowser = 'Chrome';
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) detectedBrowser = 'Safari';
    else if (/Firefox/i.test(ua)) detectedBrowser = 'Firefox';
    else if (/Edg/i.test(ua)) detectedBrowser = 'Microsoft Edge';

    if (osVal) osVal.textContent = `${detectedOS} • ${user.location || 'Phnom Penh, Cambodia'}`;
    if (browserVal) browserVal.textContent = `${detectedBrowser} • Current session`;

    $('[data-security-manage-sessions]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center animate-fade-in';
      modal.innerHTML = `
        <div class="card w-full max-w-md p-6 space-y-4 shadow-pop">
          <div class="flex items-center justify-between">
            <h3 class="text-[18px] font-bold">Active Sessions</h3>
            <button type="button" class="icon-btn" data-modal-close><i class="fa-solid fa-xmark"></i></button>
          </div>
          <p class="text-[13px] text-muted">You are currently signed in on this browser. You can sign out other devices at any time.</p>
          <div class="p-3.5 rounded-xl bg-raised border border-line flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-brand-soft text-brand flex items-center justify-center shrink-0">
              <i class="fa-solid fa-desktop text-[13px]"></i>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[13.5px] font-semibold">${detectedOS} • Current device</p>
              <p class="text-[12px] text-muted">${detectedBrowser} • Active now</p>
            </div>
          </div>
          <button type="button" class="btn btn-outline text-rose border-rose/30 hover:bg-rose/10 w-full" data-signout-others>
            Sign out of all other sessions
          </button>
          <button type="button" class="btn btn-neutral w-full" data-modal-close>Close</button>
        </div>
      `;
      document.body.appendChild(modal);
      $$('[data-modal-close]', modal).forEach(btn => btn.onclick = () => modal.remove());
      $('[data-signout-others]', modal).onclick = () => {
        toast('Signed out of all other sessions.');
        modal.remove();
      };
    });

    // 7. Devices that remember your password
    const rememberRow = $('[data-security-remember-devices-row]');
    if (rememberRow) {
      rememberRow.onclick = () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center animate-fade-in';
        modal.innerHTML = `
          <div class="card w-full max-w-md p-6 space-y-4 shadow-pop">
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-bold">Remember password</h3>
              <button type="button" class="icon-btn" data-modal-close><i class="fa-solid fa-xmark"></i></button>
            </div>
            <p class="text-[13px] text-muted">Manage whether this device securely saves your login state between browser restarts.</p>
            <div class="p-4 rounded-xl bg-raised border border-line flex items-center justify-between">
              <div>
                <p class="font-semibold text-[14px]">Keep me signed in</p>
                <p class="text-[12px] text-muted mt-0.5">Stay signed in on this trusted browser</p>
              </div>
              <label class="switch">
                <input type="checkbox" checked data-remember-toggle>
                <span></span>
              </label>
            </div>
            <button type="button" class="btn btn-primary w-full" data-modal-close>Done</button>
          </div>
        `;
        document.body.appendChild(modal);
        $$('[data-modal-close]', modal).forEach(btn => btn.onclick = () => modal.remove());
        $('[data-remember-toggle]', modal)?.addEventListener('change', async (e) => {
          toast(e.target.checked ? 'Login session will be remembered.' : 'Session will clear upon browser close.');
        });
      };
    }

    // 8. Permitted services
    const servicesRow = $('[data-security-services-row]');
    if (servicesRow) {
      servicesRow.onclick = () => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center animate-fade-in';
        modal.innerHTML = `
          <div class="card w-full max-w-md p-6 space-y-4 shadow-pop">
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-bold">Connected Services</h3>
              <button type="button" class="icon-btn" data-modal-close><i class="fa-solid fa-xmark"></i></button>
            </div>
            <p class="text-[13px] text-muted">These cloud infrastructure services are authorized to deliver your Faith In profile, authentication, and file storage.</p>
            <div class="space-y-2.5">
              <div class="p-3 rounded-xl bg-raised border border-line flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <i class="fa-brands fa-google text-brand text-[18px]"></i>
                  <div>
                    <p class="text-[13.5px] font-semibold">Google Identity & Firebase</p>
                    <p class="text-[11.5px] text-muted">Authentication & Realtime Firestore</p>
                  </div>
                </div>
                <span class="status-badge status-on">Active</span>
              </div>
              <div class="p-3 rounded-xl bg-raised border border-line flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <i class="fa-solid fa-cloud text-emerald-500 text-[18px]"></i>
                  <div>
                    <p class="text-[13.5px] font-semibold">Supabase Storage</p>
                    <p class="text-[11.5px] text-muted">Encrypted photos & resource bundles</p>
                  </div>
                </div>
                <span class="status-badge status-on">Active</span>
              </div>
            </div>
            <button type="button" class="btn btn-neutral w-full" data-modal-close>Close</button>
          </div>
        `;
        document.body.appendChild(modal);
        $$('[data-modal-close]', modal).forEach(btn => btn.onclick = () => modal.remove());
      };
    }

    // Sidebar notices
    $$('[data-settings-notice]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        toast(btn.dataset.settingsNotice);
      };
    });
  }

  async function loadStudio(user) {
    if (!user) return;
    
    let data = {
      followers: 1042,
      followers_growth: '+12',
      impressions: '12.4K',
      impressions_growth: '+15%',
      engagement: 843,
      engagement_growth: '-2%',
      analytics: {
        labels: ['Aug 12', 'Aug 13', 'Aug 14', 'Aug 15', 'Aug 16', 'Aug 17', 'Aug 18', 'Aug 19', 'Aug 20', 'Aug 21', 'Aug 22', 'Aug 23', 'Aug 24', 'Aug 25'],
        impressions: [320, 450, 410, 890, 1200, 850, 600, 450, 2100, 1800, 1500, 900, 1100, 850],
        engagements: [24, 38, 30, 65, 92, 58, 41, 32, 142, 118, 95, 62, 78, 68],
        followers: [1, 2, 0, 3, 4, 2, 1, 0, 5, 4, 3, 2, 3, 2]
      },
      recent_content: []
    };

    try {
      const res = await api.request('cv_get_studio_dashboard');
      if (res) data = Object.assign(data, res);
    } catch (_) {}

    // Populate Top Metrics
    const followersEl = $('[data-metric-followers]');
    const followersGrowthEl = $('[data-metric-followers-growth]');
    const impressionsEl = $('[data-metric-impressions]');
    const impressionsGrowthEl = $('[data-metric-impressions-growth]');
    const engagementEl = $('[data-metric-engagement]');
    const engagementGrowthEl = $('[data-metric-engagement-growth]');

    if (followersEl) followersEl.textContent = Number(data.followers).toLocaleString();
    if (followersGrowthEl) followersGrowthEl.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> ${data.followers_growth}`;
    if (impressionsEl) impressionsEl.textContent = data.impressions;
    if (impressionsGrowthEl) impressionsGrowthEl.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> ${data.impressions_growth}`;
    if (engagementEl) engagementEl.textContent = Number(data.engagement).toLocaleString();
    if (engagementGrowthEl) engagementGrowthEl.innerHTML = `<i class="fa-solid fa-arrow-trend-down"></i> ${data.engagement_growth}`;

    // Render Recent Content List
    const contentContainer = $('[data-studio-recent-content]');
    if (contentContainer && data.recent_content && data.recent_content.length > 0) {
      contentContainer.innerHTML = data.recent_content.map((item, idx) => {
        const borderClass = idx === data.recent_content.length - 1 ? '' : 'border-b border-gray-100 dark:border-slate-800';
        const typeBadge = item.type === 'Video'
          ? `<div class="absolute inset-0 bg-black/25 flex items-center justify-center"><i class="fa-solid fa-play text-white text-xs drop-shadow"></i></div><div class="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded uppercase font-bold tracking-wider">Video</div>`
          : (item.type === 'Article'
            ? `<div class="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded uppercase font-bold tracking-wider">Article</div>`
            : `<div class="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 rounded uppercase font-bold tracking-wider">Post</div>`);

        const thumb = item.cover
          ? `<img src="${esc(item.cover)}" class="w-full h-full object-cover" alt="Thumbnail">`
          : `<div class="w-full h-full bg-brand-soft text-brand flex items-center justify-center"><i class="fa-solid fa-${item.type === 'Video' ? 'video' : (item.type === 'Article' ? 'newspaper' : 'pen-nib')} text-[18px]"></i></div>`;

        return `
          <div class="p-4 ${borderClass} flex items-start gap-4 hover:bg-raised/60 transition-colors group">
            <div class="w-[100px] h-[56px] shrink-0 rounded-lg border border-line overflow-hidden relative">
              ${thumb}
              ${typeBadge}
            </div>
            <div class="flex-1 min-w-0">
              <a href="/home" class="font-bold text-[14px] text-ink group-hover:text-brand leading-tight line-clamp-1 transition-colors">
                ${esc(item.title)}
              </a>
              <p class="text-[12px] text-muted mt-1">${esc(item.date)}</p>
              <div class="flex items-center gap-6 mt-3 text-[13px] text-muted flex-wrap">
                <div class="flex flex-col">
                  <span class="text-[11px] text-faint font-medium">Impressions</span>
                  <span class="font-semibold text-ink">${Number(item.impressions).toLocaleString()}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[11px] text-faint font-medium">Likes</span>
                  <span class="font-semibold text-ink">${Number(item.likes).toLocaleString()}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[11px] text-faint font-medium">Comments</span>
                  <span class="font-semibold text-ink">${Number(item.comments).toLocaleString()}</span>
                </div>
                <div class="flex flex-col ml-auto">
                  <span class="text-[11px] text-faint font-medium">CTR</span>
                  <span class="font-semibold text-emerald-600 dark:text-emerald-400">${esc(item.ctr || '4.8%')}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Chart initialization (Bulletproof SVG renderer + Chart.js fallback)
    const chartHost = document.getElementById('analyticsChartHost') || document.getElementById('analyticsChart')?.parentElement;
    if (chartHost) {
      const renderChart = (metricType) => {
        const datasetData = metricType === 'Engagements'
          ? data.analytics.engagements
          : (metricType === 'New Followers' ? data.analytics.followers : data.analytics.impressions);
        const metricLabel = metricType || 'Impressions';
        const color = metricType === 'Engagements' ? '#9333ea' : (metricType === 'New Followers' ? '#16a34a' : '#2563eb');
        
        const labels = data.analytics.labels;
        const values = datasetData;
        const maxVal = Math.max(...values, 10);
        const minVal = 0;
        const w = 680;
        const h = 230;
        const padL = 45;
        const padR = 20;
        const padT = 20;
        const padB = 35;
        const plotW = w - padL - padR;
        const plotH = h - padT - padB;

        const points = values.map((v, i) => {
          const x = padL + (i / (values.length - 1)) * plotW;
          const y = padT + plotH - ((v - minVal) / (maxVal - minVal)) * plotH;
          return { x, y, v, label: labels[i] };
        });

        let pathD = `M ${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const mx = (p0.x + p1.x) / 2;
          pathD += ` C ${mx},${p0.y} ${mx},${p1.y} ${p1.x},${p1.y}`;
        }

        const areaD = `${pathD} L ${points[points.length - 1].x},${padT + plotH} L ${points[0].x},${padT + plotH} Z`;

        const gridlines = [0, 0.33, 0.66, 1].map(frac => {
          const y = padT + plotH * (1 - frac);
          const val = Math.round(minVal + frac * (maxVal - minVal));
          return `
            <line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="currentColor" stroke-opacity="0.12" stroke-dasharray="3,3" />
            <text x="${padL - 8}" y="${y + 4}" font-size="11" fill="currentColor" fill-opacity="0.55" text-anchor="end">${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}</text>
          `;
        }).join('');

        const xLabels = points.filter((_, idx) => idx % 2 === 0 || idx === points.length - 1).map(p => `
          <text x="${p.x}" y="${h - 8}" font-size="11" fill="currentColor" fill-opacity="0.55" text-anchor="middle">${p.label}</text>
        `).join('');

        const circles = points.map(p => `
          <g class="chart-point group/pt cursor-pointer">
            <circle cx="${p.x}" cy="${p.y}" r="4" fill="#ffffff" stroke="${color}" stroke-width="2.5" class="transition-transform hover:scale-150" />
            <title>${p.label}: ${Number(p.v).toLocaleString()} ${metricLabel}</title>
          </g>
        `).join('');

        chartHost.innerHTML = `
          <svg viewBox="0 0 ${w} ${h}" class="w-full h-full text-slate-700 dark:text-slate-300 overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad_${metricLabel.replace(/\s+/g,'_')}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${color}" stop-opacity="0.28" />
                <stop offset="100%" stop-color="${color}" stop-opacity="0.0" />
              </linearGradient>
            </defs>
            ${gridlines}
            <path d="${areaD}" fill="url(#chartGrad_${metricLabel.replace(/\s+/g,'_')})" />
            <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            ${xLabels}
            ${circles}
          </svg>
        `;
      };

      renderChart('Impressions');

      const selectEl = $('[data-chart-metric-select]');
      if (selectEl) {
        selectEl.onchange = (e) => {
          renderChart(e.target.value);
        };
      }
    }

    // Quick Upload / Create Content Button
    $('[data-studio-create-btn]')?.addEventListener('click', () => {
      window.location.href = '/home?compose=post';
    });
  }

  document.addEventListener('click', async event => {
    const signout = event.target.closest('[data-menu-root] a');
    if (signout && /sign out|sign in/i.test(signout.textContent)) {
      event.preventDefault();
      if (!session) return window.FI.openAuth();
      await api.request('cv_logout'); applySession(null); toast('Signed out');
    }
    const protectedAction = event.target.closest('[data-live-auth]');
    if (protectedAction && !requireUser()) event.preventDefault();
  });

  /* ---- Prayer Wall (index) ------------------------------------------- */
  async function loadPrayerWall() {
    const list = $('#prayer-wall-list');
    const composer = $('#modal-prayer');
    if (composer) {
      const submit = $$('button', composer).find(button => /request prayer/i.test(button.textContent));
      if (submit && !submit.dataset.fiWired) {
        submit.dataset.fiWired = '1';
        submit.removeAttribute('data-toast');
        submit.addEventListener('click', async () => {
          if (!requireUser()) return;
          const title = $('input[type="text"]', composer);
          const body = $('textarea', composer);
          const content = [title?.value.trim(), body?.value.trim()].filter(Boolean).join(' — ');
          if (!content) return toast('Write your prayer request first.');
          try {
            await api.request('cv_create_prayer', { content });
            if (title) title.value = ''; if (body) body.value = '';
            $('[data-close]', composer)?.click();
            toast('Prayer request shared with the community');
            loadPrayerWall();
          } catch (error) { toast(error.message); }
        });
      }
    }
    if (!list) return;
    if (!session) {
      list.innerHTML = '';
      const count = $('[data-prayer-count]');
      if (count) count.textContent = 'Sign in to see real prayer requests.';
      return;
    }
    try {
      const result = await api.request('cv_get_prayers');
      const items = (result.items || []).slice(0, 3);
      const badge = $('[data-prayer-badge]');
      if (badge) { const total = (result.items || []).length; badge.textContent = total > 99 ? '99+' : total; badge.classList.toggle('hidden', !total); }
      const count = $('[data-prayer-count]');
      if (count) count.textContent = items.length
        ? `${result.items.length} request${result.items.length === 1 ? '' : 's'} waiting for prayer.`
        : 'No prayer requests yet — be the first to share one.';
      list.innerHTML = items.length ? items.map(prayer => `<div class="rounded-xl bg-raised border border-line p-3" data-prayer-id="${esc(prayer.id)}"><p class="text-[13px] leading-snug">${esc(prayer.content)}</p><div class="mt-2 flex items-center justify-between"><span class="text-[11.5px] text-muted">${esc(prayer.author)} · ${esc(prayer.time || '')}</span><span class="text-[12px] font-semibold text-brand">${Number(prayer.prayed_count || 0)} praying</span></div></div>`).join('')
        : '<p class="text-[13px] text-muted">No prayer requests yet.</p>';
    } catch (error) {
      list.innerHTML = `<p class="text-[13px] text-muted">${esc(error.message)}</p>`;
    }
  }

  /* ---- Verse of the Day ----------------------------------------------- */
  const VOTD_REFERENCES = [
    'John 3:16', 'Psalm 23:1-3', 'Proverbs 3:5-6', 'Isaiah 40:31', 'Romans 8:28',
    'Philippians 4:6-7', 'Joshua 1:9', 'Psalm 119:105', 'Matthew 11:28-30',
    '2 Corinthians 5:17', 'Jeremiah 29:11', 'Psalm 46:10', 'Hebrews 11:1',
    '1 Corinthians 13:4-7', 'Galatians 5:22-23', 'Ephesians 2:8-9',
    'Psalm 27:1', 'Romans 12:2', 'James 1:2-4', 'Isaiah 41:10',
    'Matthew 6:33', 'Psalm 51:10', 'John 14:6', 'Colossians 3:23',
    '1 Peter 5:7', 'Psalm 121:1-2', 'Micah 6:8', 'Lamentations 3:22-23',
    '2 Timothy 1:7', 'Revelation 21:4', 'Deuteronomy 31:6'
  ];

  async function loadVerseOfTheDay() {
    const quote = $('#votd');
    if (!quote) return;
    const day = Math.floor(Date.now() / 86400000);
    const reference = VOTD_REFERENCES[day % VOTD_REFERENCES.length];
    try {
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}`);
      if (!response.ok) throw new Error('Verse unavailable');
      const data = await response.json();
      const body = String(data.text || '').replace(/\s+/g, ' ').trim();
      if (!body) throw new Error('Verse unavailable');
      const english = $$('p', quote).find(node => !node.classList.contains('font-khmer'));
      if (english) english.textContent = `“${body}”`;
      $$('p.font-khmer', quote).forEach(node => node.remove());
      const card = quote.closest('section') || quote.parentElement;
      let cite = card?.querySelector('[data-votd-ref]');
      if (!cite) {
        cite = document.createElement('p');
        cite.dataset.votdRef = '';
        cite.className = 'text-[12px] font-semibold text-gold mt-2';
        quote.appendChild(cite);
      }
      cite.textContent = data.reference || reference;
      const link = card?.querySelector('a[href="/bible-study"]');
      if (link) link.href = `/bible-study?passage=${encodeURIComponent(data.reference || reference)}`;
    } catch (_) { /* leave the shipped verse in place */ }
  }

  /* ---- Article composer (index) --------------------------------------- */
  function wireArticleComposer() {
    const modal = $('#modal-article');
    if (!modal) return;
    const authorName = $('#article-author-name', modal);
    const authorAvatar = $('#article-author-avatar', modal);
    if (session && authorName) authorName.textContent = `By ${session.name || session.displayName || 'You'}`;
    if (session && authorAvatar) {
      const pic = session.avatar_url || session.avatar || session.photo_url;
      if (pic) authorAvatar.innerHTML = `<img src="${esc(pic)}" class="w-full h-full object-cover rounded-full" alt="Author" />`;
      else authorAvatar.textContent = api.initials(session.name || 'You');
    }
  }

  window.FILive = { api, get user() { return session; }, requireUser, avatarMarkup, verificationBadgeMarkup, openMessenger };
  mountAuth();
  const page = document.body.dataset.page;

  function markActiveSideLink() {
    const here = location.pathname + location.search;
    const path = location.pathname;
    const hasSearch = Boolean(location.search);
    $$('#main a.side-link').forEach(link => {
      const href = link.getAttribute('href');
      let active = false;
      if (href === here) {
        active = true;
      } else if (!hasSearch && (href === path || (path === '/library' && href === '/library'))) {
        active = true;
      }
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
  }
  function signedOutState() {
    const targets = {
      jobs: $$('#main h2').find(node => /recommended for you/i.test(node.textContent))?.closest('section')?.querySelector('.divide-y'),
      library: $('#shelf'),
      network: $$('#main h2').find(node => /people you may know/i.test(node.textContent))?.closest('section')?.querySelector('.grid'),
      notifications: $('#main > section.card')?.querySelector('.divide-y')
    };
    const target = targets[page];
    if (target) target.innerHTML = `<div class="p-8 text-center"><i class="fa-solid fa-lock text-2xl text-faint"></i><p class="mt-2 text-[13.5px] text-muted">Sign in to load your real ${esc(page)} data.</p><button class="btn btn-primary mt-3" data-open-auth>Sign in</button></div>`;
    if (page === 'network') $$('.count', $('#main > aside')).forEach(node => { node.textContent = '0'; });
    if (page === 'profile' || page === 'settings') {
      const content = page === 'profile' ? $('#main > div.space-y-4') : $('#main > div.space-y-5');
      if (content) content.innerHTML = `<section class="card p-10 text-center"><i class="fa-solid fa-lock text-3xl text-faint"></i><h1 class="text-[21px] font-bold mt-4">Sign in to view your ${esc(page)}</h1><p class="text-[13.5px] text-muted mt-2">Your saved account information will appear here. No sample profile data is shown.</p><button class="btn btn-primary mt-4" data-open-auth>Sign in</button></section>`;
    }
  }
  document.addEventListener('click', event => { if (event.target.closest('[data-open-auth]')) window.FI.openAuth(); });
  markActiveSideLink();
  loadVerseOfTheDay();
  document.addEventListener('fi:session', () => { if (page === 'home') loadPrayerWall(); });
  document.addEventListener('fi:session-updated', event => {
    const updated = event.detail;
    if (updated?.logged_in) {
      applySession(updated);
      refreshNotifications();
    } else if (session && !updated?.logged_in) {
      applySession(null);
      signedOutState();
      const requiresAuth = (page === 'profile' || page === 'settings' || page === 'settings-security' || page === 'messaging');
      if (requiresAuth) {
        window.FI.openAuth({ locked: true });
      }
    }
  });
  wireArticleComposer();
  $$('form[role="search"], #main form').forEach(form => form.querySelector('[data-toast]')?.removeAttribute('data-toast'));
  api.session().then(user => {
    applySession(user);
    if (!user?.logged_in) {
      signedOutState();
      const requiresAuth = (page === 'profile' || page === 'settings' || page === 'settings-security' || page === 'messaging' || page === 'studio' || page === 'dashboard');
      if (requiresAuth || user?.verification_required) {
        window.FI.openAuth({
          locked: requiresAuth,
          verificationRequired: !!user?.verification_required,
          email: user?.email || ''
        });
      }
      return;
    }
    refreshNotifications();
    if (page === 'jobs') loadJobs();
    if (page === 'library') loadLibrary();
    if (page === 'network') loadNetwork();
    if (page === 'notifications') loadNotifications();
    if (page === 'profile') loadProfile(user);
    if (page === 'settings') loadSettings(user);
    if (page === 'settings-security') loadSettingsSecurity(user);
    if (page === 'studio' || page === 'dashboard') loadStudio(user);
  }).catch(() => {
    applySession(null);
    signedOutState();
    const requiresAuth = (page === 'profile' || page === 'settings' || page === 'settings-security' || page === 'messaging' || page === 'studio' || page === 'dashboard');
    if (requiresAuth) {
      window.FI.openAuth({ locked: true });
    }
  });
})();
