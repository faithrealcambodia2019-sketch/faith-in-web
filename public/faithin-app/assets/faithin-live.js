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
    $$('a').forEach(link => {
      const label = link.textContent.trim().replace(/\s+\d+$/, '');
      const routes = { 'Home Feed': '/faithin-app/index.html', 'Profile': '/faithin-app/profile.html', 'Prayer Wall': '/faithin-app/index.html#prayer', 'Find Jobs': '/faithin-app/jobs.html', 'Find Users': '/faithin-app/network.html', 'Library': '/faithin-app/library.html', 'Social Studio': '/bible-study' };
      if (routes[label]) link.href = routes[label];
    });
    document.dispatchEvent(new CustomEvent('fi:session', { detail: { user: session } }));
  }

  function requireUser() {
    if (session) return true;
    window.FI.openAuth();
    return false;
  }

  async function refreshNotifications() {
    if (!session) return;
    try {
      const counts = await api.request('cv_social_get_notification_count');
      const badge = $('a[aria-label^="Notifications"] span');
      if (badge) { const count = counts.total_unread_count || 0; badge.textContent = count > 99 ? '99+' : count; badge.classList.toggle('hidden', !count); }
    } catch (_) {}
  }

  function emptyState(label) {
    return `<div class="p-8 text-center text-muted"><i class="fa-regular fa-folder-open text-2xl text-faint"></i><p class="mt-2 text-[13.5px]">${esc(label)}</p></div>`;
  }

  async function loadJobs() {
    const heading = $$('#main h2').find(node => /recommended for you/i.test(node.textContent));
    const holder = heading?.closest('section')?.querySelector('.divide-y'); if (!holder) return;
    const render = async term => {
      holder.innerHTML = emptyState('Loading ministry opportunities…');
      try {
        const result = await api.request('cv_get_jobs');
        const query = String(term || '').toLowerCase();
        const items = (result.items || []).filter(job => !query || [job.title, job.organization, job.location, job.description].some(value => String(value || '').toLowerCase().includes(query)));
        holder.innerHTML = items.length ? items.map(job => `<article class="p-4 flex gap-3.5 row-hover relative" data-job-id="${esc(job.id)}"><span class="avatar avatar-sq w-14 h-14 text-[12px] shrink-0">${esc(api.initials(job.organization))}</span><div class="min-w-0 flex-1 pr-10"><a class="text-[15.5px] font-semibold text-brand" href="${esc(job.apply_url || (job.contact_email ? `mailto:${job.contact_email}` : '#'))}">${esc(job.title)}</a><p class="text-[14px] font-medium mt-0.5">${esc(job.organization)}</p><p class="text-[13px] text-muted mt-0.5">${esc(job.location || 'Location flexible')} · ${esc(job.job_type || 'Ministry role')}</p><p class="text-[13px] text-muted mt-2 line-clamp-2">${esc(job.description || '')}</p><p class="text-[12px] text-faint mt-2">${esc(job.time || '')}</p></div>${job.can_delete ? '<button class="icon-btn absolute top-3 right-3" data-job-delete><i class="fa-regular fa-trash-can"></i></button>' : '<button class="icon-btn absolute top-3 right-3" data-job-save><i class="fa-regular fa-bookmark"></i></button>'}</article>`).join('') : emptyState('No matching ministry roles yet.');
      } catch (error) { holder.innerHTML = emptyState(error.message); }
    };
    const form = heading.closest('#main').querySelector('form');
    form?.addEventListener('submit', event => { event.preventDefault(); render($('input', form).value); });
    const postButton = $$('#main button').find(button => /post a job|start hiring/i.test(button.textContent));
    if (postButton) { postButton.removeAttribute('data-toast'); postButton.addEventListener('click', () => { if (!requireUser()) return; openJobEditor(render); }); }
    holder.addEventListener('click', async event => { const row = event.target.closest('[data-job-id]'); if (!row) return; if (event.target.closest('[data-job-delete]')) { await api.request('cv_delete_job', { job_id: row.dataset.jobId }); row.remove(); toast('Job removed'); } if (event.target.closest('[data-job-save]')) { await api.request('cv_toggle_bookmark', { object_id: row.dataset.jobId, object_type: 'job' }); toast('Job saved'); } });
    $$('#main aside section').filter(section => /top organizations hiring/i.test(section.textContent)).forEach(section => section.remove());
    render();
  }

  function openJobEditor(refresh) {
    const modal = document.createElement('div'); modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center';
    modal.innerHTML = `<form class="card w-full max-w-lg p-5 space-y-3"><div class="flex justify-between"><h2 class="text-[20px] font-bold">Post a ministry role</h2><button type="button" class="icon-btn" data-close-job><i class="fa-solid fa-xmark"></i></button></div><input class="field" name="title" placeholder="Role title" required><input class="field" name="organization" placeholder="Church or organization" required><input class="field" name="location" placeholder="Location or Remote"><select class="field" name="job_type"><option>Full-time</option><option>Part-time</option><option>Volunteer</option><option>Contract</option></select><textarea class="field" name="description" rows="4" placeholder="Role description"></textarea><input class="field" name="apply_url" type="url" placeholder="https:// application link"><input class="field" name="contact_email" type="email" placeholder="or contact email"><button class="btn btn-primary w-full">Publish role</button></form>`;
    document.body.appendChild(modal); $('[data-close-job]', modal).onclick = () => modal.remove();
    $('form', modal).onsubmit = async event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); try { await api.request('cv_create_job', data); modal.remove(); toast('Job published'); refresh(); } catch (error) { toast(error.message); } };
  }

  async function loadLibrary() {
    const shelf = $('#shelf'); if (!shelf) return;
    try {
      const result = await api.request('cv_get_resources'), items = result.items || [];
      shelf.innerHTML = items.length ? items.map(resource => `<article class="w-[154px] shrink-0 snap-start group" data-resource-id="${esc(resource.id)}"><a href="${esc(resource.open_url || '#')}" target="_blank" rel="noopener" class="block"><span class="book-cover block h-[196px] overflow-hidden bg-[linear-gradient(150deg,#1d4ed8,#172554)]">${resource.thumbnail_url ? `<img class="w-full h-full object-cover" src="${esc(resource.thumbnail_url)}" alt="">` : `<span class="h-full p-3 flex items-center justify-center text-center text-white font-serif font-semibold">${esc(resource.title)}</span>`}</span><span class="block text-[13.5px] font-semibold mt-2.5 leading-tight">${esc(resource.title)}</span><span class="block text-[12px] text-muted mt-0.5">${esc(resource.author || resource.category)}</span></a><button class="text-[12px] font-semibold text-brand mt-2" data-resource-download><i class="fa-solid fa-download mr-1"></i>${Number(resource.download_count || 0)} downloads</button></article>`).join('') : emptyState('No community resources have been published yet.');
    } catch (error) { shelf.innerHTML = emptyState(error.message); }
    const section = shelf.closest('section'), header = section?.firstElementChild;
    if (header && !header.querySelector('[data-publish-resource]')) { const button = document.createElement('button'); button.className = 'btn btn-primary !py-2'; button.dataset.publishResource = ''; button.innerHTML = '<i class="fa-solid fa-plus"></i>Publish resource'; header.appendChild(button); button.onclick = () => { if (requireUser()) openResourceEditor(loadLibrary); }; }
    shelf.addEventListener('click', async event => { const button = event.target.closest('[data-resource-download]'); if (!button) return; event.preventDefault(); const row = button.closest('[data-resource-id]'); const result = await api.request('cv_download_resource', { resource_id: row.dataset.resourceId }); if (result.url) window.open(result.url, '_blank', 'noopener'); });
    $$('#main section').filter(section => /jump back in|trending sermons|authors to follow/i.test(section.querySelector('h2,h3')?.textContent || '')).forEach(section => section.remove());
  }

  function openResourceEditor(refresh) {
    const modal = document.createElement('div'); modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center';
    modal.innerHTML = `<form class="card w-full max-w-lg p-5 space-y-3"><div class="flex justify-between"><h2 class="text-[20px] font-bold">Publish a resource</h2><button type="button" class="icon-btn" data-close-resource><i class="fa-solid fa-xmark"></i></button></div><input class="field" name="title" placeholder="Resource title" required><textarea class="field" name="description" rows="3" placeholder="Description"></textarea><input class="field" name="category" placeholder="Category" value="Bible Study"><select class="field" name="format"><option>pdf</option><option>video</option><option>audio</option><option>document</option></select><label class="text-[13px] font-semibold">Resource file<input class="field mt-1" name="resource_file" type="file" required></label><label class="text-[13px] font-semibold">Cover image (optional)<input class="field mt-1" name="thumbnail" type="file" accept="image/*"></label><button class="btn btn-primary w-full">Publish resource</button></form>`;
    document.body.appendChild(modal); $('[data-close-resource]', modal).onclick = () => modal.remove();
    $('form', modal).onsubmit = async event => { event.preventDefault(); const form = event.currentTarget, data = Object.fromEntries(new FormData(form)); const files = { resource_file: [form.resource_file.files[0]], thumbnail: form.thumbnail.files[0] ? [form.thumbnail.files[0]] : [] }; delete data.resource_file; delete data.thumbnail; try { await api.request('cv_upload_resource', data, files); modal.remove(); toast('Resource published'); refresh(); } catch (error) { toast(error.message); } };
  }

  async function loadNetwork() {
    const heading = $$('#main h2').find(node => /people you may know/i.test(node.textContent)); const section = heading?.closest('section'); if (!section) return;
    const grid = $('.grid', section); if (!grid) return;
    try {
      const result = await api.request('cv_get_suggested_users'), items = result.items || [];
      grid.innerHTML = items.length ? items.map(user => `<article class="card overflow-hidden flex flex-col relative" data-user-uid="${esc(user.uid)}"><div class="h-16 bg-[linear-gradient(110deg,#60a5fa,#4f46e5)]"></div><div class="px-3 pb-4 -mt-8 flex flex-col items-center text-center flex-1">${avatarMarkup(user, 'avatar w-16 h-16 text-[17px] ring-4 ring-surface object-cover')}<a href="/faithin-app/profile.html?uid=${encodeURIComponent(user.uid)}" class="mt-2 text-[14.5px] font-semibold">${esc(user.name)}</a><p class="text-[12.5px] text-muted mt-1 line-clamp-2">${esc(user.role || user.bio || user.church || 'Faith In member')}</p><p class="text-[11.5px] text-faint mt-2">${esc(user.location || user.ministry || '')}</p><button class="btn btn-outline w-full mt-3 !py-2" data-connect>${user.is_following ? 'Following' : '<i class="fa-solid fa-user-plus text-[11px]"></i>Connect'}</button><button class="btn btn-ghost w-full mt-1 !py-2" data-message>Message</button></div></article>`).join('') : emptyState('No new member suggestions right now.');
    } catch (error) { grid.innerHTML = emptyState(error.message); }
    grid.addEventListener('click', async event => { const card = event.target.closest('[data-user-uid]'); if (!card) return; if (event.target.closest('[data-connect]')) { if (!requireUser()) return; const button = event.target.closest('[data-connect]'); await api.request(/following/i.test(button.textContent) ? 'cv_social_unfollow_user' : 'cv_social_follow_user', { target_uid: card.dataset.userUid }); button.textContent = /following/i.test(button.textContent) ? 'Connect' : 'Following'; } if (event.target.closest('[data-message]')) openMessenger(card.dataset.userUid); });
    Promise.all([api.request('cv_social_get_followers'), api.request('cv_social_get_following')]).then(results => { const counts = $$('.count', $('#main > aside')); if (counts[0]) counts[0].textContent = results[0].items?.length || 0; if (counts[1]) counts[1].textContent = results[1].items?.length || 0; counts.slice(2).forEach(node => node.textContent = '0'); }).catch(() => {});
    $('#main > aside section.text-center')?.remove();
    const requested = new URLSearchParams(location.search).get('message'); if (requested) openMessenger(requested);
    const headerMessage = $('a[aria-label="Messages"]'); if (headerMessage) headerMessage.href = '/faithin-app/network.html?message=inbox';
    $$('#main section').filter(item => /invitations|groups you might/i.test(item.querySelector('h2')?.textContent || '')).forEach(item => item.remove());
  }

  async function openMessenger(uid) {
    if (!requireUser()) return; let targetUid = uid === 'inbox' ? '' : uid;
    const modal = document.createElement('div'); modal.className = 'fixed inset-0 z-[240] bg-[#0b1120]/70 p-4 flex items-center justify-center';
    modal.innerHTML = `<section class="card w-full max-w-2xl h-[70vh] flex flex-col"><header class="p-4 border-b border-line flex justify-between"><div><h2 class="font-bold text-[18px]">Faith In Messages</h2><p class="text-[12px] text-muted">Private member conversations</p></div><button class="icon-btn" data-msg-close><i class="fa-solid fa-xmark"></i></button></header><div class="grid md:grid-cols-[220px_1fr] min-h-0 flex-1"><aside class="border-r border-line overflow-y-auto p-2" data-msg-threads></aside><div class="flex flex-col min-h-0"><div class="flex-1 overflow-y-auto p-4 space-y-2" data-msg-items>${emptyState(targetUid ? 'Loading conversation…' : 'Choose a conversation')}</div><form class="p-3 border-t border-line flex gap-2" data-msg-form><input class="field !rounded-pill" name="body" placeholder="Write a message…"><button class="icon-btn text-brand"><i class="fa-solid fa-paper-plane"></i></button></form></div></div></section>`;
    document.body.appendChild(modal); $('[data-msg-close]', modal).onclick = () => modal.remove();
    async function threads() { const result = await api.request('cv_social_get_message_threads'); $('[data-msg-threads]', modal).innerHTML = (result.items || []).map(thread => `<button class="w-full text-left p-2 rounded-lg hover:bg-raised" data-thread-id="${esc(thread.id)}"><strong class="text-[13px]">${esc(thread.other_user?.name || 'Member')}</strong><span class="block text-[11px] text-muted truncate">${esc(thread.last_message || '')}</span></button>`).join('') || '<p class="p-2 text-[12px] text-muted">No conversations yet. Message a member from Network.</p>'; }
    async function openThread(id) { const result = await api.request('cv_social_get_message_thread', { thread_id: id }); targetUid = ''; modal.dataset.threadId = id; $('[data-msg-items]', modal).innerHTML = (result.items || []).map(message => `<div class="max-w-[80%] rounded-xl px-3 py-2 text-[13px] ${message.mine ? 'ml-auto bg-brand text-white' : 'bg-raised'}">${esc(message.body)}</div>`).join('') || emptyState('Start the conversation.'); }
    $('[data-msg-threads]', modal).onclick = event => { const button = event.target.closest('[data-thread-id]'); if (button) openThread(button.dataset.threadId); };
    $('[data-msg-form]', modal).onsubmit = async event => { event.preventDefault(); const input = $('[name="body"]', modal); if (!input.value.trim()) return; try { const params = { body: input.value.trim() }; if (modal.dataset.threadId) params.thread_id = modal.dataset.threadId; else if (targetUid) params.recipient_uid = targetUid; else return toast('Choose a conversation first.'); const sent = await api.request('cv_social_send_message', params); input.value = ''; await threads(); await openThread(sent.thread_id || modal.dataset.threadId); } catch (error) { toast(error.message); } };
    await threads(); if (targetUid) $('[data-msg-items]', modal).innerHTML = emptyState('Write your first message below.');
  }

  async function loadNotifications() {
    const center = $('#main > section.card'); const holder = center?.querySelector('.divide-y'); if (!holder) return;
    try {
      const result = await api.request('cv_social_get_notifications'), items = result.items || [];
      holder.innerHTML = items.length ? items.map(item => { const actor = item.actor || {}; const labels = { reaction: 'reacted to your post', comment: 'commented on your post', follow: 'followed you', message: 'sent you a message', reply: 'replied to you', new_post: 'shared a new post' }; return `<article class="${item.is_read ? '' : 'notif-unread'} p-4 flex gap-3.5 relative" data-notification-id="${esc(item.id)}">${avatarMarkup(actor, 'avatar w-12 h-12 text-[13px] object-cover')}<div class="min-w-0 flex-1"><p class="text-[14px]"><strong>${esc(actor.name || 'A member')}</strong> ${esc(labels[item.type] || 'sent an update')}</p><p class="text-[12px] ${item.is_read ? 'text-muted' : 'text-brand'} mt-1.5">${esc(item.created_at ? new Date(item.created_at).toLocaleString() : '')}</p></div>${item.is_read ? '' : '<span class="w-2.5 h-2.5 rounded-full bg-brand"></span>'}</article>`; }).join('') : emptyState('You are all caught up.');
      holder.onclick = async event => { const row = event.target.closest('[data-notification-id]'); if (!row) return; await api.request('cv_social_mark_notifications_read', { id: row.dataset.notificationId }); row.classList.remove('notif-unread'); row.querySelector('.bg-brand')?.remove(); };
      const early = center.querySelector(':scope > button'); if (early) { early.textContent = 'Mark all as read'; early.onclick = async () => { await api.request('cv_social_mark_notifications_read', {}); toast('Notifications marked as read'); loadNotifications(); }; }
    } catch (error) { holder.innerHTML = emptyState(error.message); }
  }

  function loadProfile(user) {
    if (!user) return;
    const hero = $$('#main section').find(section => section.querySelector('h1'));
    if (hero) { const h1 = $('h1', hero); h1.textContent = user.name; const details = $$('p', hero); if (details[0]) details[0].textContent = [user.role, user.ministry, user.church].filter(Boolean).join(' · ') || 'Faith In member'; if (details[1]) details[1].firstChild.textContent = `${user.location || ''} `; const avatar = $('.avatar', hero); if (avatar) { if (user.avatar_url) { const image = document.createElement('img'); image.className = avatar.className + ' object-cover'; image.src = user.avatar_url; image.alt = user.name; avatar.replaceWith(image); } else avatar.textContent = api.initials(user.name); } }
    const about = $$('#main h2').find(node => node.textContent.trim() === 'About')?.closest('section'); if (about) { const paragraphs = $$('div.space-y-3 p', about); if (paragraphs[0]) paragraphs[0].textContent = user.bio || 'This member has not added a biography yet.'; paragraphs.slice(1).forEach(node => node.remove()); }
    const activity = $$('#main h2').find(node => node.textContent.trim() === 'Activity')?.closest('section');
    if (activity) api.request('cv_get_posts').then(result => { const mine = (result.items || []).filter(post => (post.author || {}).uid === user.uid).slice(0, 6); const holder = $('.space-y-1', activity); if (holder) holder.innerHTML = mine.length ? mine.map(post => `<a href="/faithin-app/index.html?post=${encodeURIComponent(post.id)}" class="block p-3 -mx-2 rounded-xl row-hover border-b border-line"><span class="block text-[11.5px] text-muted">${esc(user.name)} posted · ${esc(post.time || '')}</span><span class="block text-[14px] mt-1 line-clamp-2">${esc(post.content || post.article_title || 'Shared media')}</span><span class="block text-[12px] text-muted mt-2">${Number(post.reaction_count || 0)} reactions · ${Number(post.comment_count || 0)} comments</span></a>`).join('') : emptyState('No activity yet.'); }).catch(() => {});
    $$('#main section').filter(item => /ministry experience|spiritual gifts|people also viewed/i.test(item.querySelector('h2')?.textContent || '')).forEach(item => item.remove());
    const services = $$('#main h2').find(node => /providing ministry services/i.test(node.textContent))?.closest('div.rounded-xl'); if (services) { if (user.ministry || user.role) { const line = $('p', services); if (line) line.textContent = [user.role, user.ministry, user.church].filter(Boolean).join(' · '); } else services.remove(); }
    Promise.all([api.request('cv_social_get_followers'), api.request('cv_social_get_following')]).then(results => { const connection = $$('a', hero).find(link => /connections/i.test(link.textContent)); if (connection) connection.textContent = `${results[1].items?.length || 0} following`; const follower = $$('a', activity).find(link => /followers/i.test(link.textContent)); if (follower) follower.textContent = `${results[0].items?.length || 0} followers`; }).catch(() => {});
  }

  function loadSettings(user) {
    if (!user) return;
    const profileSummary = $$('#main h4').find(node => /name, location/i.test(node.textContent))?.parentElement?.querySelector('p'); if (profileSummary) profileSummary.textContent = [user.name, user.role, user.location].filter(Boolean).join(' · ');
    const settings = user.settings || {};
    if (settings.theme) setTheme(settings.theme);
    const save = async () => { try { await api.request('cv_update_user_settings', { theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light', lang: settings.lang || 'English', notifications: 1 }); } catch (_) {} };
    $('#theme-picker')?.addEventListener('click', () => setTimeout(save));
    $$('#main input[type="checkbox"]').forEach(input => input.addEventListener('change', save));
    $$('#main button[data-toast]').forEach(button => { button.removeAttribute('data-toast'); button.disabled = true; button.title = 'This option is not connected yet'; });
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

  window.FILive = { api, get user() { return session; }, requireUser, avatarMarkup, openMessenger };
  mountAuth();
  const page = document.body.dataset.page;
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
