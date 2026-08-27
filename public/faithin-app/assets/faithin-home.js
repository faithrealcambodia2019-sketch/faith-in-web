/* Faith In — live home feed, composers, prayers, members and engagement. */
(() => {
  'use strict';
  const { $, $$, esc, toast, closeModal } = window.FI;
  const api = window.FIData;
  const feed = $('#posts');
  const needUser = () => window.FILive.requireUser();

  function busy(button, active, label) {
    if (!button) return;
    if (active) { button.dataset.oldLabel = button.innerHTML; button.disabled = true; button.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>${label}`; }
    else { button.disabled = false; button.innerHTML = button.dataset.oldLabel || label; }
  }

  function mediaHTML(post) {
    const media = Array.isArray(post.media_items) ? post.media_items : [];
    const items = media.length ? media : (post.cover_image_url ? [{ type: 'image', url: post.cover_image_url }] : []);
    if (!items.length) return '';
    return `<div class="border-y border-line bg-raised grid gap-1 ${items.length > 1 ? 'grid-cols-2' : ''}">${items.slice(0, 4).map(item => {
      const url = esc(item.url || item.preview_url || item.local_url || '');
      if (item.type === 'video') return `<video class="w-full max-h-[560px] object-cover bg-black" controls preload="metadata" src="${url}"></video>`;
      if (item.type === 'audio') return `<div class="p-5"><audio class="w-full" controls src="${url}"></audio></div>`;
      return `<img class="w-full max-h-[620px] object-cover" src="${url}" alt="Shared media">`;
    }).join('')}</div>`;
  }

  function postHTML(post) {
    const author = post.author || { name: post.author_name || 'Faith In Member', uid: post.author_uid || '' };
    const name = author.name || author.displayName || 'Faith In Member';
    const avatar = author.avatar_url || author.avatar || '';
    const reacted = !!(post.user_reaction || post.current_user_reaction);
    const owner = !!post.can_delete;
    const body = post.content || post.excerpt || post.article_excerpt || '';
    return `<article class="card overflow-hidden animate-fade-up" data-post-id="${esc(post.id)}" data-author-uid="${esc(author.uid || '')}">
      <header class="flex items-start gap-3 p-4 pb-2.5">
        ${avatar ? `<img class="avatar w-11 h-11 object-cover" src="${esc(avatar)}" alt="${esc(name)}">` : `<span class="avatar w-11 h-11 text-[14px]">${esc(api.initials(name))}</span>`}
        <div class="min-w-0 flex-1"><div class="flex items-center gap-2 flex-wrap"><a href="/faithin-app/profile.html?uid=${encodeURIComponent(author.uid || '')}" class="text-[14.5px] font-semibold hover:text-brand">${esc(name)}</a>${post.type && post.type !== 'post' ? `<span class="text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-soft text-brand-strong">${esc(post.type)}</span>` : ''}</div><p class="text-[12px] text-muted mt-0.5">${esc(post.time || 'just now')} · ${esc(post.visibility || 'Public')}</p></div>
        ${!owner && author.uid ? `<button class="btn btn-outline !py-1 !px-3 !text-[13px]" data-live-follow><i class="fa-solid fa-plus text-[11px]"></i>Follow</button>` : ''}
        ${owner ? `<button class="icon-btn" data-live-delete aria-label="Delete post"><i class="fa-regular fa-trash-can"></i></button>` : ''}
      </header>
      ${post.article_title ? `<div class="px-4 pt-1"><h3 class="font-serif text-[22px] font-semibold">${esc(post.article_title)}</h3></div>` : ''}
      ${body ? `<div class="px-4 pb-3"><p class="text-[14.5px] leading-relaxed whitespace-pre-wrap">${esc(body)}</p></div>` : ''}
      ${mediaHTML(post)}
      <div class="px-4 py-2 flex items-center justify-between text-[12px] text-muted border-b border-line"><span class="flex items-center gap-1.5"><span class="w-[18px] h-[18px] rounded-full bg-brand text-white grid place-items-center text-[9px]"><i class="fa-solid fa-hands-praying"></i></span><span data-likecount>${Number(post.reaction_count || 0)}</span></span><span class="flex gap-3"><button data-comment-toggle>${Number(post.comment_count || 0)} comments</button><span>${Number(post.share_count || 0)} shares</span></span></div>
      <div class="flex items-center gap-1 px-2 py-1"><button class="action-btn ${reacted ? '!text-brand' : ''}" data-live-like><i class="fa-${reacted ? 'solid' : 'regular'} fa-hands-praying"></i>Amen</button><button class="action-btn" data-comment-toggle><i class="fa-regular fa-comment"></i>Comment</button><button class="action-btn" data-live-share><i class="fa-solid fa-share-nodes"></i>Share</button><button class="action-btn" data-live-save><i class="fa-regular fa-bookmark"></i><span class="hidden sm:inline">Save</span></button></div>
      <div class="hidden border-t border-line p-3.5" data-comments><div class="space-y-2 mb-3" data-comment-list></div><form class="flex items-center gap-2.5" data-comment-form><span class="avatar w-9 h-9 text-[11px]">${esc(api.initials(window.FILive.user?.name || 'Me'))}</span><input name="content" class="field !rounded-pill" placeholder="Write a thoughtful comment…" required><button class="icon-btn text-brand"><i class="fa-solid fa-paper-plane"></i></button></form></div>
    </article>`;
  }

  async function loadPosts() {
    feed.innerHTML = `<section class="card p-8 text-center text-muted"><i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Loading your community…</section>`;
    try {
      const result = await api.request('cv_get_posts');
      feed.innerHTML = result.items?.length ? result.items.map(postHTML).join('') : `<section class="card p-8 text-center"><h2 class="font-bold">Your community feed is ready</h2><p class="text-muted text-[13.5px] mt-1">Be the first to share a blessing or testimony.</p></section>`;
      renderBlessings(result.items || []);
    } catch (error) { feed.innerHTML = `<section class="card p-6 text-rose">${esc(error.message)}</section>`; }
    $('#load-more')?.classList.add('hidden');
  }

  function renderBlessings(items) {
    const rail = $('[data-rail]'); if (!rail) return;
    const blessings = items.filter(post => post.type === 'blessing').slice(0, 8);
    const add = `<button class="snap-start shrink-0 w-[112px] h-[172px] rounded-card overflow-hidden card text-left" data-modal-open="modal-blessing"><div class="h-[108px] bg-brand-soft grid place-items-center"><span class="avatar w-11 h-11">${esc(api.initials(window.FILive.user?.name || 'Me'))}</span></div><div class="h-[64px] grid place-items-center text-[12.5px] font-semibold">+ Add Blessing</div></button>`;
    rail.innerHTML = add + blessings.map((post, index) => { const author = post.author || {}; const colors = ['#3730a3','#065f46','#92400e','#6b21a8','#1e40af']; return `<button class="snap-start shrink-0 w-[112px] h-[172px] rounded-card overflow-hidden relative text-left text-white" style="background:linear-gradient(180deg,${colors[index % colors.length]},#111827)" data-blessing-post="${esc(post.id)}"><span class="absolute top-2.5 left-2.5 avatar w-9 h-9 text-[11px] ring-[3px] ring-white/80">${esc(api.initials(author.name))}</span><span class="absolute inset-x-3 top-1/2 -translate-y-1/2 text-center font-serif italic text-[13px] line-clamp-4">${esc(post.content || 'Shared a blessing')}</span><span class="absolute bottom-2.5 left-3 right-3 text-[11.5px] font-semibold truncate">${esc(author.name || 'Faith In Member')}</span></button>`; }).join('');
  }

  async function loadMembers() {
    const list = $('#contacts'); if (!list) return;
    try {
      const result = await api.request('cv_get_suggested_users');
      list.innerHTML = (result.items || []).slice(0, 6).map(user => `<li class="flex items-start gap-3 p-2 rounded-xl hover:bg-raised" data-user-uid="${esc(user.uid)}">${window.FILive.avatarMarkup(user)}<span class="min-w-0 flex-1"><a href="/faithin-app/profile.html?uid=${encodeURIComponent(user.uid)}" class="block text-[13.5px] font-semibold truncate">${esc(user.name)}</a><span class="block text-[12px] text-muted truncate">${esc(user.role || user.church || user.location || 'Faith In member')}</span></span><button class="btn btn-ghost !px-3 !py-1 !text-[12.5px] border border-line" data-live-message>Message</button></li>`).join('') || '<li class="text-[13px] text-muted p-2">No other members yet.</li>';
    } catch (_) { list.innerHTML = '<li class="text-[13px] text-muted p-2">Sign in to see members.</li>'; }
  }

  async function loadPrayers() {
    const heading = $$('#main h2').find(el => el.textContent.trim() === 'Prayer Wall');
    const section = heading?.closest('section'); if (!section) return;
    try {
      const result = await api.request('cv_get_prayers'), items = (result.items || []).slice(0, 3);
      const intro = $('p', section); if (intro) intro.textContent = `${result.items?.length || 0} requests waiting for prayer today.`;
      const prayerLink = $$('a', $('#main > aside')).find(link => /Prayer Wall/.test(link.textContent)); const badge = prayerLink ? $('span', prayerLink) : null; if (badge) badge.textContent = result.items?.length || 0;
      const holder = $('.space-y-2\\.5', section); if (holder) holder.innerHTML = items.map(prayer => `<div class="rounded-xl bg-raised border border-line p-3" data-prayer-id="${esc(prayer.id)}"><p class="text-[13px]">${esc(prayer.content)}</p><div class="mt-2 flex items-center justify-between"><span class="text-[11.5px] text-muted">${esc(prayer.author)} · ${esc(prayer.time)}</span><button class="text-[12px] font-semibold ${prayer.has_prayed ? 'text-rose' : 'text-brand'}" data-live-pray>${prayer.has_prayed ? '🙏 Praying' : '🙏 Pray'} ${prayer.prayed_count || ''}</button></div></div>`).join('') || '<p class="text-[13px] text-muted">No prayer requests yet.</p>';
    } catch (error) { const holder = $('.space-y-2\\.5', section); if (holder) holder.innerHTML = `<p class="text-[13px] text-muted">Sign in to see community prayer requests.</p>`; }
  }

  const ta = $('#blessing-text'), postBtn = $('#blessing-post'), count = $('#blessing-count');
  ta?.addEventListener('input', () => { count.textContent = `${ta.value.length}/600`; postBtn.disabled = !ta.value.trim(); });
  $$('[data-chip]').forEach(chip => chip.addEventListener('click', () => { ta.value = `${ta.value.trim()} ${chip.textContent} `.trimStart(); ta.dispatchEvent(new Event('input')); ta.focus(); }));
  postBtn?.addEventListener('click', async () => { if (!needUser()) return; busy(postBtn, true, 'Posting'); try { await api.request('cv_create_post', { content: ta.value.trim(), type: 'blessing', visibility: 'public' }); ta.value = ''; closeModal(); toast('Your blessing is live 🕊️'); await loadPosts(); } catch (error) { toast(error.message); } finally { busy(postBtn, false, 'Post'); ta.dispatchEvent(new Event('input')); } });

  const fileInput = $('#file-input'), preview = $('#preview'), dropzone = $('#dropzone'); let selectedFiles = [];
  function showFiles(files) { selectedFiles = [...files].slice(0, 10); preview.innerHTML = ''; preview.classList.toggle('hidden', !selectedFiles.length); selectedFiles.forEach(file => { const image = document.createElement('img'); image.className = 'w-full aspect-square object-cover rounded-lg border border-line'; image.src = URL.createObjectURL(file); preview.appendChild(image); }); }
  fileInput?.addEventListener('change', () => showFiles(fileInput.files));
  ['dragover','dragleave','drop'].forEach(type => dropzone?.addEventListener(type, event => { event.preventDefault(); dropzone.classList.toggle('border-brand', type === 'dragover'); if (type === 'drop') showFiles(event.dataTransfer.files); }));
  const photoDone = $$('#modal-photo button').find(button => button.textContent.trim() === 'Done');
  photoDone?.addEventListener('click', async () => { if (!needUser()) return; if (!selectedFiles.length) return toast('Choose at least one photo.'); busy(photoDone, true, 'Uploading'); try { await api.request('cv_create_post', { type: 'post', visibility: 'public' }, { 'post_media[]': selectedFiles }); closeModal(); toast('Photos shared'); showFiles([]); await loadPosts(); } catch (error) { toast(error.message); } finally { busy(photoDone, false, 'Done'); } });

  const prayerButton = $$('#modal-prayer button').find(button => /request prayer/i.test(button.textContent));
  prayerButton?.removeAttribute('data-toast');
  prayerButton?.addEventListener('click', async event => { event.stopPropagation(); if (!needUser()) return; const modal = $('#modal-prayer'), title = $('input[type="text"]', modal).value.trim(), body = $('textarea', modal).value.trim(); if (!body) return toast('Write your prayer request first.'); busy(prayerButton, true, 'Sharing'); try { await api.request('cv_create_prayer', { content: title ? `${title}\n${body}` : body }); closeModal(); toast('Prayer request shared 🙏'); $('textarea', modal).value = ''; await loadPrayers(); } catch (error) { toast(error.message); } finally { busy(prayerButton, false, 'Request Prayer'); } });

  $$('#editor-tools [data-cmd]').forEach(button => button.addEventListener('mousedown', event => { event.preventDefault(); document.execCommand(button.dataset.cmd, false, button.dataset.arg || null); $('#article-body').focus(); }));
  const articleButton = $$('#modal-article button').find(button => /publish/i.test(button.textContent));
  articleButton?.removeAttribute('data-toast');
  articleButton?.addEventListener('click', async event => { event.stopPropagation(); if (!needUser()) return; const modal = $('#modal-article'), title = $('input', modal).value.trim(), text = $('#article-body').textContent.trim(); if (!title || !text) return toast('Add a headline and article text.'); busy(articleButton, true, 'Publishing'); try { await api.request('cv_create_post', { type: 'article', title, article_title: title, article_body: $('#article-body').innerHTML, content: text, visibility: 'public' }); closeModal(); toast('Article published ✨'); await loadPosts(); } catch (error) { toast(error.message); } finally { busy(articleButton, false, 'Publish'); } });

  feed?.addEventListener('click', async event => {
    const article = event.target.closest('[data-post-id]'); if (!article) return; const id = article.dataset.postId;
    if (event.target.closest('[data-live-like]')) { if (!needUser()) return; try { await api.request('cv_like_post', { post_id: id, reaction: 'like' }); await loadPosts(); } catch (error) { toast(error.message); } return; }
    if (event.target.closest('[data-comment-toggle]')) { event.preventDefault(); const box = $('[data-comments]', article); box.classList.toggle('hidden'); if (!box.classList.contains('hidden')) { $('input', box).focus(); try { const result = await api.request('cv_get_post_comments', { post_id: id }); $('[data-comment-list]', box).innerHTML = (result.items || []).map(comment => `<div class="rounded-xl bg-raised p-2.5"><strong class="text-[12.5px]">${esc(comment.author?.name || comment.author_name || 'Member')}</strong><p class="text-[13px] mt-1">${esc(comment.content)}</p></div>`).join(''); } catch (_) {} } return; }
    if (event.target.closest('[data-live-share]')) { if (!needUser()) return; await api.request('cv_share_post', { post_id: id }); try { await navigator.clipboard.writeText(`${location.origin}/?post=${id}`); } catch (_) {} toast('Post link copied'); await loadPosts(); return; }
    if (event.target.closest('[data-live-save]')) { if (!needUser()) return; await api.request('cv_toggle_bookmark', { object_id: id, object_type: 'post' }); toast('Saved'); return; }
    if (event.target.closest('[data-live-follow]')) { event.stopPropagation(); if (!needUser()) return; await api.request('cv_social_follow_user', { target_uid: article.dataset.authorUid }); toast('Following'); event.target.closest('[data-live-follow]').remove(); return; }
    if (event.target.closest('[data-live-delete]')) { if (!needUser() || !confirm('Delete this post?')) return; await api.request('cv_delete_post', { post_id: id }); article.remove(); toast('Post deleted'); }
  });
  feed?.addEventListener('submit', async event => { const form = event.target.closest('[data-comment-form]'); if (!form) return; event.preventDefault(); if (!needUser()) return; const article = form.closest('[data-post-id]'), input = $('input', form); try { await api.request('cv_create_post_comment', { post_id: article.dataset.postId, content: input.value.trim() }); input.value = ''; toast('Comment posted'); } catch (error) { toast(error.message); } });

  document.addEventListener('click', async event => {
    const pray = event.target.closest('[data-live-pray]'); if (pray) { if (!needUser()) return; try { await api.request('cv_update_prayer', { prayer_id: pray.closest('[data-prayer-id]').dataset.prayerId }); await loadPrayers(); } catch (error) { toast(error.message); } }
    const message = event.target.closest('[data-live-message]'); if (message) { if (!needUser()) return; location.href = `/faithin-app/network.html?message=${encodeURIComponent(message.closest('[data-user-uid]').dataset.userUid)}`; }
  });

  $('[data-copy-verse]')?.addEventListener('click', async () => { try { await navigator.clipboard.writeText('For God so loved the world, that he gave his only begotten Son. — John 3:16'); toast('Verse copied'); } catch (_) { toast('Copy unavailable'); } });
  document.addEventListener('fi:session', event => { const user = event.detail.user; const left = $('#main > aside'); if (left) { const metrics = $$('a span:last-child', left); metrics.filter(node => /^\d/.test(node.textContent.trim())).forEach(node => { if (/480/.test(node.textContent)) node.textContent = '0'; }); left.querySelector('section:last-child')?.remove(); if (user) { const name = $$('a', left).find(link => link.textContent.trim() === 'Faith In Member' || link.textContent.trim() === 'Hun Chet'); if (name) name.textContent = user.name; } } if (user) { loadPosts(); loadMembers(); loadPrayers(); } else { feed.innerHTML = `<section class="card p-8 text-center"><i class="fa-solid fa-lock text-2xl text-faint"></i><h2 class="font-bold mt-3">Sign in to open your community</h2><p class="text-muted text-[13.5px] mt-1">Your real posts, prayers, members, and messages appear here.</p><button class="btn btn-primary mt-3" data-open-auth>Sign in</button></section>`; $('#load-more')?.classList.add('hidden'); renderBlessings([]); const contacts = $('#contacts'); if (contacts) contacts.innerHTML = '<li class="text-[13px] text-muted p-2">Sign in to see members.</li>'; const prayer = $$('#main h2').find(node => node.textContent.trim() === 'Prayer Wall')?.closest('section'); if (prayer) { const intro = $('p', prayer); if (intro) intro.textContent = 'Sign in to see real prayer requests.'; const holder = $('.space-y-2\\.5', prayer); if (holder) holder.innerHTML = ''; } } });
  async function loadVerse() { try { const result = await api.request('cv_bible_get_verses', { book: 'John', chapter: 3, version: 'KJV' }); const verse = (result.items || []).find(item => item.v === 16); if (!verse) return; const card = $$('#main h2').find(node => node.textContent.trim() === 'Verse of the Day')?.closest('section'); const english = card ? $$('blockquote p', card)[1] : null; if (english) english.textContent = `“${verse.text.trim()}”`; } catch (_) {} }
  document.addEventListener('click', event => { if (event.target.closest('[data-open-auth]')) window.FI.openAuth(); });
  loadVerse();
})();
