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

  function mountAuth() {
    const host = document.createElement('div');
    host.id = 'fi-auth';
    host.className = 'hidden fixed inset-0 z-[250] bg-[#0b1120]/70 backdrop-blur-sm p-4 items-center justify-center';
    host.innerHTML = `<section class="card w-full max-w-md p-6 shadow-pop" role="dialog" aria-modal="true" aria-labelledby="fi-auth-title">
      <div class="flex items-start justify-between gap-4"><div><h2 id="fi-auth-title" class="text-[22px] font-bold">Welcome to Faith In</h2><p class="text-[13.5px] text-muted mt-1">Sign in to post, pray, message, and connect.</p></div><button class="icon-btn" data-auth-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div>
      <button class="btn btn-outline w-full mt-5 !py-3" data-auth-google><i class="fa-brands fa-google"></i>Continue with Google</button>
      <div class="flex items-center gap-3 my-4 text-[11px] uppercase tracking-wider text-faint"><span class="h-px bg-line flex-1"></span>or<span class="h-px bg-line flex-1"></span></div>
      <form data-auth-form class="space-y-3">
        <input class="field" name="email" type="email" autocomplete="email" placeholder="Email address" required>
        <input class="field" name="password" type="password" autocomplete="current-password" placeholder="Password" minlength="6" required>
        <p class="hidden text-[12.5px] text-rose" data-auth-error></p>
        <div class="grid grid-cols-2 gap-2"><button class="btn btn-primary !py-2.5" name="intent" value="signin">Sign in</button><button class="btn btn-outline !py-2.5" name="intent" value="signup">Create account</button></div>
      </form>
    </section>`;
    document.body.appendChild(host);
    const close = () => { host.classList.add('hidden'); host.classList.remove('flex'); };
    host.addEventListener('click', async event => {
      if (event.target === host || event.target.closest('[data-auth-close]')) close();
      const google = event.target.closest('[data-auth-google]');
      if (!google) return;
      google.disabled = true;
      try { session = await api.request('cv_google_sign_in'); applySession(session); close(); toast('Welcome to Faith In'); }
      catch (error) { showAuthError(error); }
      finally { google.disabled = false; }
    });
    $('[data-auth-form]', host).addEventListener('submit', async event => {
      event.preventDefault();
      const submitter = event.submitter;
      const data = new FormData(event.currentTarget);
      const action = submitter?.value === 'signup' ? 'cv_email_sign_up' : 'cv_email_sign_in';
      submitter.disabled = true;
      try { session = await api.request(action, { email: data.get('email'), password: data.get('password') }); applySession(session); close(); toast('Welcome to Faith In'); }
      catch (error) { showAuthError(error); }
      finally { submitter.disabled = false; }
    });
    function showAuthError(error) {
      const el = $('[data-auth-error]', host); el.textContent = error.message || 'Sign-in failed.'; el.classList.remove('hidden');
    }
    window.FI.openAuth = () => { host.classList.remove('hidden'); host.classList.add('flex'); $('[name="email"]', host).focus(); };
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
    $$('a, h1').filter(node => node.textContent.trim() === 'Hun Chet').forEach(node => { node.textContent = displayName; });
    $$('p').filter(node => /Faith In member\s*·\s*Phnom Penh/i.test(node.textContent)).forEach(node => { node.textContent = session ? ['Faith In member', session.location].filter(Boolean).join(' · ') : 'Sign in to join the community'; });
    $$('.avatar').filter(node => node.textContent.trim() === 'HC').forEach(node => { if (!node.closest('[data-post-id],[data-user-uid]')) node.textContent = api.initials(displayName); });
    $$('[data-current-user-avatar]').forEach(el => {
      const holder = document.createElement('span');
      holder.innerHTML = avatarMarkup(session || { name: displayName }, `${el.className} object-cover`);
      const next = holder.firstElementChild;
      next.dataset.currentUserAvatar = '';
      el.replaceWith(next);
    });
    $$('a').forEach(link => {
      const label = link.textContent.trim().replace(/\s+\d+$/, '');
      const routes = { 'Home Feed': '/home', 'Profile': '/profile', 'Prayer Wall': '/home#prayer-wall', 'Find Jobs': '/jobs', 'Find Users': '/network', 'Library': '/library', 'Social Studio': '/bible-study' };
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

  async function loadLibrary() {
    const shelf = $('#shelf'); if (!shelf) return;
    let resources = [], savedIds = new Set(), searchQuery = '';
    const view = new URLSearchParams(location.search).get('view');
    const format = new URLSearchParams(location.search).get('format');
    const category = new URLSearchParams(location.search).get('category');
    const render = () => {
      let items = resources.slice();
      if (format) items = items.filter(resource => String(resource.format || '').toLowerCase() === format.toLowerCase());
      if (category) {
        const wanted = category.replace(/and/gi, '&').replace(/[^a-z]/gi, '').toLowerCase();
        items = items.filter(resource => String(resource.category || '').replace(/[^a-z]/gi, '').toLowerCase() === wanted);
      }
      if (view === 'saved') items = items.filter(resource => savedIds.has(resource.id));
      if (searchQuery) items = items.filter(resource => [resource.title, resource.author, resource.category, resource.description].some(value => String(value || '').toLowerCase().includes(searchQuery)));
      shelf.innerHTML = items.length ? items.map(resource => `<article class="fi-resource-card snap-start group relative" data-resource-id="${esc(resource.id)}">${resource.open_url ? `<a href="${esc(resource.open_url)}" target="_blank" rel="noopener" class="block">` : '<button type="button" class="block w-full text-left" data-resource-download>'}<span class="fi-resource-cover book-cover block overflow-hidden bg-[linear-gradient(150deg,#1d4ed8,#172554)]">${resource.thumbnail_url ? `<img class="w-full h-full object-cover" src="${esc(resource.thumbnail_url)}" alt="" loading="lazy" decoding="async">` : `<span class="h-full p-3 flex flex-col gap-3 items-center justify-center text-center text-white font-serif font-semibold"><i class="fa-solid fa-${resource.format === 'video' ? 'video' : (resource.format === 'audio' ? 'headphones' : (resource.format === 'image' ? 'image' : 'file-lines'))} text-[24px]"></i>${esc(resource.title)}</span>`}</span><span class="block text-[13.5px] font-semibold mt-2.5 leading-tight">${esc(resource.title)}</span><span class="block text-[12px] text-muted mt-1">By ${esc(resource.author || 'Faith In member')}</span>${resource.translated_by ? `<span class="block text-[11.5px] text-faint mt-0.5">Translated by ${esc(resource.translated_by)}</span>` : ''}<span class="inline-flex mt-1.5 text-[10.5px] font-bold uppercase tracking-wide text-brand bg-brand-soft px-2 py-0.5 rounded-full">${esc(resource.language || resource.format || 'resource')}</span>${resource.open_url ? '</a>' : '</button>'}<div class="flex items-center justify-between gap-1 mt-2"><button class="text-[12px] font-semibold text-brand" data-resource-download><i class="fa-solid fa-download mr-1"></i>${Number(resource.download_count || 0)}</button><span class="flex">${resource.can_delete ? '<button class="icon-btn w-8 h-8 text-rose" data-resource-delete aria-label="Delete resource"><i class="fa-regular fa-trash-can"></i></button>' : ''}<button class="icon-btn w-8 h-8 ${savedIds.has(resource.id) ? '!text-brand' : ''}" data-resource-save aria-label="${savedIds.has(resource.id) ? 'Remove saved resource' : 'Save resource'}"><i class="fa-${savedIds.has(resource.id) ? 'solid' : 'regular'} fa-bookmark"></i></button></span></div></article>`).join('') : emptyState(view || format || category || searchQuery ? 'Nothing in this shelf yet.' : 'No community resources have been published yet.');
    };
    try {
      const [result, saved] = await Promise.all([api.request('cv_get_resources'), api.request('cv_get_bookmarks').catch(() => ({ items: [] }))]);
      resources = result.items || [];
      savedIds = new Set((saved.items || []).filter(row => row.object_type === 'resource').map(row => row.object_id));
      render();
    } catch (error) { shelf.innerHTML = emptyState(error.message); }
    const section = shelf.closest('section'), header = section?.firstElementChild;
    if (header && !header.querySelector('[data-publish-resource]')) { const button = document.createElement('button'); button.className = 'btn btn-primary !py-2'; button.dataset.publishResource = ''; button.innerHTML = '<i class="fa-solid fa-plus"></i>Publish resource'; header.appendChild(button); button.onclick = () => { if (requireUser()) openResourceEditor(loadLibrary); }; }
    shelf.addEventListener('click', async event => {
      const row = event.target.closest('[data-resource-id]'); if (!row) return;
      const remove = event.target.closest('[data-resource-delete]');
      if (remove) { event.preventDefault(); if (!confirm('Delete this resource?')) return; await api.request('cv_delete_resource', { resource_id: row.dataset.resourceId }); resources = resources.filter(resource => resource.id !== row.dataset.resourceId); render(); toast('Resource deleted'); return; }
      const save = event.target.closest('[data-resource-save]');
      if (save) { event.preventDefault(); const id = row.dataset.resourceId; await api.request('cv_toggle_bookmark', { object_id: id, object_type: 'resource' }); if (savedIds.has(id)) savedIds.delete(id); else savedIds.add(id); toast(savedIds.has(id) ? 'Resource saved' : 'Resource removed'); render(); return; }
      const button = event.target.closest('[data-resource-download]'); if (!button) return; event.preventDefault(); const result = await api.request('cv_download_resource', { resource_id: row.dataset.resourceId }); if (result.url) window.open(result.url, '_blank', 'noopener');
    });
    document.addEventListener('fi:search', event => { searchQuery = event.detail.query.toLowerCase(); render(); });
    $('[aria-label="Share verse"]')?.addEventListener('click', async () => { const textValue = `${$('#votd')?.innerText || ''} — ${$('[data-votd-ref]')?.textContent || ''}`.trim(); try { if (navigator.share) await navigator.share({ title: 'Verse of the Day', text: textValue, url: location.origin + '/bible-study' }); else { await navigator.clipboard.writeText(textValue); toast('Verse copied'); } } catch (_) {} });
    $$('#main section').filter(section => /jump back in|trending sermons|authors to follow/i.test(section.querySelector('h2,h3')?.textContent || '')).forEach(section => section.remove());
  }

  function openResourceEditor(refresh) {
    const modal = document.createElement('div'); modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center';
    modal.innerHTML = `<form class="card w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 space-y-4"><div class="flex justify-between"><div><h2 class="text-[20px] font-bold">Publish a resource</h2><p class="text-[12.5px] text-muted mt-1">Share a PDF, image, audio, video, or ZIP file with the community.</p></div><button type="button" class="icon-btn" data-close-resource aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div><input class="field" name="title" placeholder="Resource title" required><textarea class="field" name="description" rows="3" placeholder="Description"></textarea><div class="grid sm:grid-cols-2 gap-3"><input class="field" name="contributor_name" placeholder="Author / Creator"><input class="field" name="translator_name" placeholder="Translated by"><input class="field" name="language" placeholder="Language, e.g. Khmer"><input class="field" name="category" placeholder="Category" value="Bible Study"></div><select class="field" name="format" aria-label="Resource format"><option value="pdf">PDF</option><option value="image">Image</option><option value="audio">Audio</option><option value="video">Video</option><option value="zip">ZIP bundle</option></select><label class="block text-[13px] font-semibold">Resource file<input class="field mt-1" name="resource_file" type="file" accept=".pdf,.zip,image/*,audio/*,video/*" required><span class="block text-[11.5px] text-muted mt-1">Maximum 250MB · stored securely in Vercel Blob</span></label><label class="block text-[13px] font-semibold">Cover image (optional)<input class="field mt-1" name="thumbnail" type="file" accept="image/*"></label><label class="flex items-center gap-2 text-[12.5px] text-muted"><input type="checkbox" name="allow_download" value="1" checked>Allow members to download this resource</label><div class="hidden" data-resource-progress><div class="flex justify-between text-[11.5px] text-muted mb-1"><span>Uploading to FaithIn</span><strong data-resource-progress-label>0%</strong></div><div class="h-2 rounded-full bg-line overflow-hidden"><span class="block h-full bg-brand transition" data-resource-progress-bar style="width:0%"></span></div></div><button class="btn btn-primary w-full" data-resource-submit>Publish resource</button></form>`;
    document.body.appendChild(modal); $('[data-close-resource]', modal).onclick = () => modal.remove();
    const form = $('form', modal), fileInput = form.elements.namedItem('resource_file'), formatInput = form.elements.namedItem('format');
    fileInput.addEventListener('change', () => { const file = fileInput.files?.[0]; if (!file) return; const type = String(file.type || '').toLowerCase(), ext = String(file.name || '').split('.').pop().toLowerCase(); if (type === 'application/pdf' || ext === 'pdf') formatInput.value = 'pdf'; else if (type.startsWith('video/')) formatInput.value = 'video'; else if (type.startsWith('audio/')) formatInput.value = 'audio'; else if (type.startsWith('image/')) formatInput.value = 'image'; else if (type === 'application/zip' || ext === 'zip') formatInput.value = 'zip'; else { fileInput.value = ''; toast('Choose a PDF, image, audio, video, or ZIP file.'); } });
    form.onsubmit = async event => {
      event.preventDefault();
      const resourceFile = fileInput.files?.[0], thumbnailInput = form.elements.namedItem('thumbnail'), submit = $('[data-resource-submit]', form);
      if (!resourceFile) return toast('Choose a resource file to publish.');
      if (resourceFile.size > 250 * 1024 * 1024) return toast(`${resourceFile.name} is larger than 250MB.`);
      const data = Object.fromEntries(new FormData(form)); data.allow_download = form.elements.namedItem('allow_download').checked ? '1' : '0'; delete data.resource_file; delete data.thumbnail;
      const files = { resource_file: [resourceFile], thumbnail: thumbnailInput.files?.[0] ? [thumbnailInput.files[0]] : [] };
      const progress = $('[data-resource-progress]', form), label = $('[data-resource-progress-label]', form), bar = $('[data-resource-progress-bar]', form);
      const oldSubmitHtml = submit.innerHTML; progress.classList.remove('hidden'); submit.disabled = true; submit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>Uploading';
      try { await api.request('cv_upload_resource', data, files, fraction => { const percent = Math.max(1, Math.min(100, Math.round(fraction * 100))); label.textContent = `${percent}%`; bar.style.width = `${percent}%`; }); modal.remove(); toast('Resource published successfully'); await refresh(); }
      catch (error) { toast(error.message); progress.classList.add('hidden'); }
      finally { submit.disabled = false; submit.innerHTML = oldSubmitHtml; }
    };
  }

  async function loadNetwork() {
    const heading = $$('#main h2').find(node => /people you may know/i.test(node.textContent)); const section = heading?.closest('section'); if (!section) return;
    const grid = $('.grid', section); if (!grid) return;
    let users = [], query = '';
    const render = () => {
      const items = users.filter(user => !query || [user.name, user.role, user.bio, user.church, user.location, user.ministry].some(value => String(value || '').toLowerCase().includes(query)));
      grid.innerHTML = items.length ? items.map(user => `<article class="card overflow-hidden flex flex-col relative" data-user-uid="${esc(user.uid)}"><div class="h-16 bg-[linear-gradient(110deg,#60a5fa,#4f46e5)]"></div><div class="px-3 pb-4 -mt-8 flex flex-col items-center text-center flex-1">${avatarMarkup(user, 'avatar w-16 h-16 text-[17px] ring-4 ring-surface object-cover')}<a href="/profile?uid=${encodeURIComponent(user.uid)}" class="mt-2 text-[14.5px] font-semibold">${esc(user.name)}</a><p class="text-[12.5px] text-muted mt-1 line-clamp-2">${esc(user.role || user.bio || user.church || 'Faith In member')}</p><p class="text-[11.5px] text-faint mt-2">${esc(user.location || user.ministry || '')}</p><button class="btn btn-outline w-full mt-3 !py-2" data-connect>${user.is_following ? 'Following' : '<i class="fa-solid fa-user-plus text-[11px]"></i>Connect'}</button><button class="btn btn-ghost w-full mt-1 !py-2" data-message>Message</button></div></article>`).join('') : emptyState(query ? 'No members match your search.' : 'No new member suggestions right now.');
    };
    try {
      const result = await api.request('cv_get_suggested_users'); users = result.items || []; render();
    } catch (error) { grid.innerHTML = emptyState(error.message); }
    grid.addEventListener('click', async event => { const card = event.target.closest('[data-user-uid]'); if (!card) return; if (event.target.closest('[data-connect]')) { if (!requireUser()) return; const button = event.target.closest('[data-connect]'); await api.request(/following/i.test(button.textContent) ? 'cv_social_unfollow_user' : 'cv_social_follow_user', { target_uid: card.dataset.userUid }); button.textContent = /following/i.test(button.textContent) ? 'Connect' : 'Following'; } if (event.target.closest('[data-message]')) openMessenger(card.dataset.userUid); });
    Promise.all([api.request('cv_social_get_followers'), api.request('cv_social_get_following')]).then(results => { const counts = $$('.count', $('#main > aside')); if (counts[0]) counts[0].textContent = results[0].items?.length || 0; if (counts[1]) counts[1].textContent = results[1].items?.length || 0; counts.slice(2).forEach(node => node.textContent = '0'); }).catch(() => {});
    $('#main > aside section.text-center')?.remove();
    const requested = new URLSearchParams(location.search).get('message'); if (requested) openMessenger(requested);
    document.addEventListener('fi:search', event => { query = event.detail.query.toLowerCase(); render(); });
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
      holder.innerHTML = items.length ? items.map(item => { const actor = item.actor || {}; return `<article class="${item.is_read ? '' : 'notif-unread'} p-4 flex gap-3.5 relative" data-notification-id="${esc(item.id)}" data-notification-type="${esc(item.type || '')}">${avatarMarkup(actor, 'avatar w-12 h-12 text-[13px] object-cover')}<div class="min-w-0 flex-1"><p class="text-[14px]"><strong>${esc(actor.name || 'A member')}</strong> ${esc(labels[item.type] || 'sent an update')}</p><p class="text-[12px] ${item.is_read ? 'text-muted' : 'text-brand'} mt-1.5">${esc(item.created_at ? new Date(item.created_at).toLocaleString() : '')}</p></div>${item.is_read ? '' : '<span class="w-2.5 h-2.5 rounded-full bg-brand"></span>'}</article>`; }).join('') : emptyState('You are all caught up.');
      if (earlier) { earlier.classList.toggle('hidden', shown >= filtered.length); earlier.innerHTML = 'Show earlier notifications <i class="fa-solid fa-arrow-down text-[11px] ml-1"></i>'; }
    };
    try {
      const result = await api.request('cv_social_get_notifications');
      allItems = result.items || []; render();
      holder.onclick = async event => { const row = event.target.closest('[data-notification-id]'); if (!row) return; await api.request('cv_social_mark_notifications_read', { id: row.dataset.notificationId }); const item = allItems.find(entry => entry.id === row.dataset.notificationId); if (item) item.is_read = true; render(); };
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
    modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center overflow-y-auto';
    modal.innerHTML = `<form class="card w-full max-w-2xl p-5 sm:p-6 space-y-4 my-auto"><div class="flex items-start justify-between gap-3"><div><h2 class="text-[20px] font-bold">Edit your Faith In profile</h2><p class="text-[13px] text-muted mt-1">These details are saved to Firebase and shown across Faith In.</p></div><button type="button" class="icon-btn" data-profile-close aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div><div class="grid sm:grid-cols-2 gap-3"><label class="text-[13px] font-semibold sm:col-span-2">Display name<input class="field mt-1" name="display_name" value="${esc(user.name || '')}" required></label><label class="text-[13px] font-semibold">Role<input class="field mt-1" name="role" value="${esc(user.role || '')}"></label><label class="text-[13px] font-semibold">Location<input class="field mt-1" name="location" value="${esc(user.location || '')}"></label><label class="text-[13px] font-semibold">Industry<input class="field mt-1" name="industry" value="${esc(user.industry || '')}"></label><label class="text-[13px] font-semibold">Church<input class="field mt-1" name="church" value="${esc(user.church || '')}"></label><label class="text-[13px] font-semibold sm:col-span-2">Ministry<input class="field mt-1" name="ministry" value="${esc(user.ministry || '')}"></label><label class="text-[13px] font-semibold sm:col-span-2">About<textarea class="field mt-1 resize-y" name="bio" rows="4">${esc(user.bio || '')}</textarea></label><label class="text-[13px] font-semibold">Profile photo<input class="field mt-1" name="profile_image" type="file" accept="image/*"></label><label class="text-[13px] font-semibold">Cover photo<input class="field mt-1" name="profile_cover" type="file" accept="image/*"></label></div><div class="flex justify-end gap-2"><button type="button" class="btn btn-ghost" data-profile-close>Cancel</button><button class="btn btn-primary" data-profile-save>Save profile</button></div></form>`;
    document.body.appendChild(modal);
    $$('[data-profile-close]', modal).forEach(button => { button.onclick = () => modal.remove(); });
    const form = $('form', modal);
    if (focusField) form.elements[focusField]?.focus();
    form.onsubmit = async event => {
      event.preventDefault(); const save = $('[data-profile-save]', modal); save.disabled = true; save.textContent = 'Saving…';
      const data = Object.fromEntries(new FormData(form));
      const files = { profile_image: form.profile_image.files[0] ? [form.profile_image.files[0]] : [], profile_cover: form.profile_cover.files[0] ? [form.profile_cover.files[0]] : [] };
      delete data.profile_image; delete data.profile_cover;
      try { const updated = await api.request('cv_update_profile', data, files); applySession(updated.user || updated); modal.remove(); toast('Profile saved'); setTimeout(() => location.reload(), 350); }
      catch (error) { toast(error.message); save.disabled = false; save.textContent = 'Save profile'; }
    };
  }

  function loadProfile(user) {
    if (!user) return;
    const hero = $$('#main section').find(section => section.querySelector('h1'));
    if (hero) { const h1 = $('h1', hero); h1.textContent = user.name; const details = $$('p', hero); if (details[0]) details[0].textContent = [user.role, user.ministry, user.church].filter(Boolean).join(' · ') || 'Faith In member'; if (details[1]) details[1].firstChild.textContent = `${user.location || ''} `; const avatar = $('.avatar', hero); if (avatar) { if (user.avatar_url) { const image = document.createElement('img'); image.className = avatar.className + ' object-cover'; image.src = user.avatar_url; image.alt = user.name; avatar.replaceWith(image); } else avatar.textContent = api.initials(user.name); } const cover = $('.media-plate', hero); if (cover && user.cover_url) { cover.style.backgroundImage = `url("${String(user.cover_url).replace(/["\\]/g, '')}")`; cover.style.backgroundSize = 'cover'; cover.style.backgroundPosition = 'center'; const label = $('span', cover); if (label) label.remove(); } }
    const about = $$('#main h2').find(node => node.textContent.trim() === 'About')?.closest('section'); if (about) { const paragraphs = $$('div.space-y-3 p', about); if (paragraphs[0]) paragraphs[0].textContent = user.bio || 'This member has not added a biography yet.'; paragraphs.slice(1).forEach(node => node.remove()); }
    const activity = $$('#main h2').find(node => node.textContent.trim() === 'Activity')?.closest('section');
    if (activity) api.request('cv_get_posts').then(result => {
      const mine = (result.items || []).filter(post => (post.author || {}).uid === user.uid);
      const holder = $('.space-y-1', activity);
      const renderActivity = label => {
        const wanted = String(label || 'Posts').toLowerCase();
        const filtered = mine.filter(post => wanted === 'posts' || (wanted === 'videos' && (post.media_items || []).some(item => item.type === 'video')) || (wanted === 'articles' && String(post.type).toLowerCase() === 'article'));
        if (holder) holder.innerHTML = wanted === 'comments' ? emptyState('Your comment history is shown with each post in Home.') : (filtered.slice(0, 12).length ? filtered.slice(0, 12).map(post => `<a href="/home?post=${encodeURIComponent(post.id)}" class="block p-3 -mx-2 rounded-xl row-hover border-b border-line"><span class="block text-[11.5px] text-muted">${esc(user.name)} posted · ${esc(post.time || '')}</span><span class="block text-[14px] mt-1 line-clamp-2">${esc(post.content || post.article_title || 'Shared media')}</span><span class="block text-[12px] text-muted mt-2">${Number(post.reaction_count || 0)} reactions · ${Number(post.comment_count || 0)} comments</span></a>`).join('') : emptyState(`No ${wanted} yet.`));
      };
      renderActivity('Posts');
      $('[data-chip-group]', activity)?.addEventListener('click', event => { const chip = event.target.closest('.chip'); if (chip) renderActivity(chip.textContent.trim()); });
    }).catch(() => {});
    $$('#main section').filter(item => /ministry experience|spiritual gifts|people also viewed/i.test(item.querySelector('h2')?.textContent || '')).forEach(item => item.remove());
    const services = $$('#main h2').find(node => /providing ministry services/i.test(node.textContent))?.closest('div.rounded-xl'); if (services) { if (user.ministry || user.role) { const line = $('p', services); if (line) line.textContent = [user.role, user.ministry, user.church].filter(Boolean).join(' · '); } else services.remove(); }
    Promise.all([api.request('cv_social_get_followers'), api.request('cv_social_get_following')]).then(results => { const connection = $$('a', hero).find(link => /connections/i.test(link.textContent)); if (connection) connection.textContent = `${results[1].items?.length || 0} following`; const follower = $$('a', activity).find(link => /followers/i.test(link.textContent)); if (follower) follower.textContent = `${results[0].items?.length || 0} followers`; }).catch(() => {});
    $$('[aria-label="Edit profile"],[aria-label="Edit services"]', hero || document).forEach(button => { button.onclick = () => openProfileEditor(user, button.getAttribute('aria-label') === 'Edit services' ? 'ministry' : 'display_name'); });
    $('[aria-label="Edit cover photo"]', hero || document)?.addEventListener('click', () => openProfileEditor(user, 'profile_cover'));
    $('[aria-label="Edit about"]')?.addEventListener('click', () => openProfileEditor(user, 'bio'));
    const openTo = $$('#main button').find(button => /^open to$/i.test(button.textContent.trim())); if (openTo) { openTo.removeAttribute('data-toast'); openTo.onclick = () => openProfileEditor(user, 'role'); }
    const addSection = $$('#main button').find(button => /add profile section/i.test(button.textContent)); if (addSection) { addSection.removeAttribute('data-toast'); addSection.onclick = () => openProfileEditor(user, 'ministry'); }
    const more = $$('#main button').find(button => /^more$/i.test(button.textContent.trim())); if (more) more.onclick = async () => { try { await navigator.clipboard.writeText(location.href); toast('Profile link copied'); } catch (_) { toast('Profile link: ' + location.href); } };
    const detailsButton = $$('#main button').find(button => /show details/i.test(button.textContent)); if (detailsButton) detailsButton.onclick = () => { const line = detailsButton.previousElementSibling; line?.classList.toggle('line-clamp-1'); detailsButton.textContent = /show/i.test(detailsButton.textContent) ? 'Hide details' : 'Show details'; };
    $('[aria-label="Edit activity"]')?.remove();
    $('[aria-label="Edit profile language"]')?.addEventListener('click', () => { location.href = '/settings'; });
    $('[aria-label="Edit public URL"]')?.addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href); toast('Public profile URL copied'); } catch (_) {} });
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
    const publish = $$('button', modal).find(button => /^publish$/i.test(button.textContent.trim()));
    if (!publish) return;
    publish.removeAttribute('data-toast');
    publish.addEventListener('click', async () => {
      if (!requireUser()) return;
      const headline = $('input[type="text"]', modal);
      const body = $('[aria-multiline="true"]', modal);
      const title = headline?.value.trim() || '';
      const content = (body?.innerText || '').trim();
      if (!title && !content) return toast('Write a headline or some text first.');
      publish.disabled = true;
      try {
        await api.request('cv_create_post', { title, content });
        if (headline) headline.value = '';
        if (body) body.innerHTML = '';
        $('[data-close]', modal)?.click();
        toast('Article published');
        if (typeof window.FIHome?.reload === 'function') window.FIHome.reload();
      } catch (error) { toast(error.message); }
      finally { publish.disabled = false; }
    });
  }

  window.FILive = { api, get user() { return session; }, requireUser, avatarMarkup, openMessenger };
  mountAuth();
  const page = document.body.dataset.page;

  function markActiveSideLink() {
    const here = location.pathname + location.search;
    $$('#main a.side-link').forEach(link => {
      const active = link.getAttribute('href') === here;
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
  wireArticleComposer();
  $$('form[role="search"], #main form').forEach(form => form.querySelector('[data-toast]')?.removeAttribute('data-toast'));
  api.session().then(user => {
    applySession(user);
    if (!user?.logged_in) { signedOutState(); return; }
    refreshNotifications();
    if (page === 'jobs') loadJobs();
    if (page === 'library') loadLibrary();
    if (page === 'network') loadNetwork();
    if (page === 'notifications') loadNotifications();
    if (page === 'profile') loadProfile(user);
    if (page === 'settings') loadSettings(user);
  }).catch(() => { applySession(null); signedOutState(); });
})();
