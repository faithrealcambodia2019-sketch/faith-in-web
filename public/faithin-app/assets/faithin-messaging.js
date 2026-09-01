/* ==========================================================================
   Faith In — messaging
   The /messages screen: an inbox of conversations, one open conversation, and
   a composer.

   Everything here reads and writes through the Firebase data backend in
   /assets/js/faith-in-backend.js. Two of its realtime channels do the work
   that used to need polling:

     message_threads  → the inbox, re-shaped whenever any thread changes
     thread_messages  → the open conversation and the other member's presence

   A subscription is replaced, never stacked: opening a second conversation
   tears the first listener down. Presence and typing are single throttled
   writes to one map field on the thread, and they expire on their own, so
   closing the tab needs no cleanup.
   ========================================================================== */
(() => {
  'use strict';

  if (document.body.dataset.page !== 'messaging') return;

  const { $, esc, toast } = window.FI;
  const live = window.FILive;
  const api = live.api;

  /* Presence heartbeat while a conversation is open. Comfortably inside the
     90 second window the backend treats as "active" without being chatty. */
  const PRESENCE_INTERVAL_MS = 45000;
  /* At most one typing write per this interval, and typing is released after
     the member stops for this long. */
  const TYPING_THROTTLE_MS = 4000;
  const TYPING_RELEASE_MS = 5000;
  /* Attachments travel inside the message document, so they must stay well
     under the Firestore document limit. Images are downscaled to fit. */
  const ATTACHMENT_MAX_BYTES = 700000;
  const ATTACHMENT_MAX_EDGE = 1400;

  const inbox = $('[data-thread-list]');
  const messagesHost = $('[data-messages]');
  const conversationPane = $('[data-pane="conversation"]');
  const inboxPane = $('[data-pane="inbox"]');
  const infoPane = $('[data-pane="info"]');
  const header = $('[data-conversation-header]');
  const composer = $('[data-composer]');
  const form = $('[data-message-form]');
  const input = $('#msg-input');
  const newModal = $('[data-new-modal]');
  const peopleList = $('[data-people-list]');

  const state = {
    threads: [],
    filter: '',
    unreadOnly: false,
    threadId: '',
    partner: null,
    messages: [],
    hasMore: 0,
    oldestAt: '',
    seen: 0,
    /** Messages sent but not yet echoed back by Firestore, keyed by a local id. */
    pending: [],
    stopThreads: null,
    stopMessages: null,
    attachment: null,
    typingSentAt: 0,
    typingActive: false,
    typingTimer: null,
    presenceTimer: null,
    lastReadMarkedFor: '',
    stickToBottom: true
  };

  /* ── formatting ─────────────────────────────────────────────────────────── */

  const startOfDay = date => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  function parseTime(value) {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  function clockTime(value) {
    const date = parseTime(value);
    return date ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
  }

  /** "10:14 AM" today, "Mon" this week, "Aug 20" beyond — as inboxes read. */
  function inboxTime(value) {
    const date = parseTime(value);
    if (!date) return '';
    const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);
    if (days <= 0) return clockTime(value);
    if (days === 1) return 'Yesterday';
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  function dayLabel(value) {
    const date = parseTime(value);
    if (!date) return '';
    const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return date.toLocaleDateString([], { weekday: 'long' });
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function presenceLabel(presence) {
    if (!presence) return '';
    if (presence.typing) return 'typing';
    if (presence.active) return 'Active now';
    const date = parseTime(presence.last_active_at);
    return date ? `Active ${inboxTime(presence.last_active_at).toLowerCase()}` : '';
  }

  function avatar(user, classes) {
    return live.avatarMarkup(user || { name: 'Faith In Member' }, classes);
  }

  /* ── inbox ──────────────────────────────────────────────────────────────── */

  function visibleThreads() {
    const term = state.filter.trim().toLowerCase();
    return state.threads.filter(thread => {
      if (state.unreadOnly && !thread.unread_count) return false;
      if (!term) return true;
      return `${thread.other_user?.name || ''} ${thread.last_message || ''}`.toLowerCase().includes(term);
    });
  }

  function threadRow(thread) {
    const name = thread.other_user?.name || 'Faith In Member';
    const active = thread.id === state.threadId;
    const unread = thread.unread_count > 0;
    // A sent-by-me preview is prefixed with a tick the way a chat client does,
    // filled in once the other member has opened the conversation.
    const mark = thread.mine_last
      ? `<i class="fa-solid fa-check${thread.seen ? '-double text-brand' : ' text-faint'} text-[10px] mr-1"></i>`
      : '';
    return `<button class="msg-thread${active ? ' is-active' : ''}${unread ? ' is-unread' : ''}" type="button" data-thread-id="${esc(thread.id)}">
      <span class="relative shrink-0">${avatar(thread.other_user, 'avatar w-12 h-12 text-[14px]')}${thread.presence?.active ? '<span class="msg-dot"></span>' : ''}</span>
      <span class="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <span class="flex items-baseline justify-between gap-2">
          <span class="msg-thread__name text-[14px] font-semibold truncate">${esc(name)}</span>
          <span class="text-[11px] text-faint shrink-0">${esc(inboxTime(thread.last_message_at))}</span>
        </span>
        <span class="flex items-center justify-between gap-2">
          <span class="msg-thread__preview text-[13px] text-muted truncate">${mark}${esc(thread.last_message || 'No messages yet')}</span>
          ${unread ? '<span class="shrink-0 w-2 h-2 rounded-full bg-brand"></span>' : ''}
        </span>
      </span>
    </button>`;
  }

  function renderInbox() {
    const rows = visibleThreads();
    if (!rows.length) {
      const message = state.threads.length
        ? 'No conversations match that.'
        : 'No conversations yet. Start one from a member’s profile or with the pencil above.';
      inbox.innerHTML = `<p class="p-8 text-center text-[13.5px] text-muted">${esc(message)}</p>`;
      return;
    }
    inbox.innerHTML = rows.map(threadRow).join('');
  }

  /** Mirrors the unread total onto the Messages icon in the header. */
  function paintHeaderBadge() {
    const badge = $('a[aria-label^="Messages"] [data-msg-badge]');
    if (!badge) return;
    const count = state.threads.reduce((total, thread) => total + (thread.unread_count || 0), 0);
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.classList.toggle('hidden', !count);
  }

  function watchThreads() {
    if (state.stopThreads) state.stopThreads();
    state.stopThreads = window.cvDataSubscribe('message_threads', {}, payload => {
      state.threads = payload.items || [];
      renderInbox();
      paintHeaderBadge();
      const current = state.threads.find(thread => thread.id === state.threadId);
      if (current) {
        // The thread list carries a fresher profile than a deep link does.
        state.partner = current.other_user || state.partner;
        paintPartner(current.presence);
      }
    }, error => {
      inbox.innerHTML = `<p class="p-8 text-center text-[13.5px] text-muted">${esc(error.message)}</p>`;
    });
  }

  /* ── conversation ───────────────────────────────────────────────────────── */

  function paintPartner(presence) {
    if (!state.partner) return;
    const name = state.partner.name || 'Faith In Member';
    $('[data-partner-name]').textContent = name;
    $('[data-partner-avatar]').innerHTML = `${avatar(state.partner, 'avatar w-10 h-10 text-[13px]')}${presence?.active ? '<span class="msg-dot"></span>' : ''}`;

    const status = $('[data-partner-status]');
    const label = presenceLabel(presence);
    if (label === 'typing') {
      status.innerHTML = '<span class="msg-typing"><span></span><span></span><span></span></span><span class="ml-1.5">typing…</span>';
      status.className = 'text-[12px] text-brand leading-tight mt-0.5 flex items-center';
    } else {
      status.textContent = label;
      status.className = `text-[12px] leading-tight mt-0.5 ${presence?.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`;
    }

    $('[data-info-name]').textContent = name;
    $('[data-info-avatar]').innerHTML = avatar(state.partner, 'avatar w-24 h-24 text-[26px]');
    const profileLink = $('[data-info-profile]');
    if (profileLink) profileLink.href = state.partner.uid ? `/profile?member=${encodeURIComponent(state.partner.uid)}` : '/profile';
  }

  /** Every image in the loaded page of the conversation, newest first. */
  function paintSharedMedia() {
    const host = $('[data-info-media]');
    if (!host) return;
    const images = state.messages
      .filter(message => message.attachment && message.attachment.type === 'image' && message.attachment.data_url)
      .reverse()
      .slice(0, 9);
    host.innerHTML = images.length
      ? images.map(message => `<img alt="${esc(message.attachment.name || 'Shared image')}" class="aspect-square w-full object-cover rounded-lg" src="${esc(message.attachment.data_url)}"/>`).join('')
      : '<p class="col-span-3 text-[12.5px] text-muted">Images shared in this conversation appear here.</p>';
  }

  function messageBubble(message) {
    const mine = !!message.mine;
    const attachment = message.attachment;
    const media = attachment && attachment.type === 'image' && attachment.data_url
      ? `<img alt="${esc(attachment.name || 'Shared image')}" class="rounded-xl mt-1 max-h-72 w-auto" src="${esc(attachment.data_url)}"/>`
      : (attachment
        ? `<span class="flex items-center gap-2 mt-1 text-[13px]"><i class="fa-regular fa-file"></i>${esc(attachment.name || 'Attachment')}</span>`
        : '');
    const body = message.body ? esc(message.body) : '';
    return `<div class="flex items-end gap-2 ${mine ? 'justify-end' : ''}">
      ${mine ? '' : `<span class="shrink-0 mb-1">${avatar(state.partner, 'avatar w-7 h-7 text-[11px]')}</span>`}
      <div class="flex flex-col gap-1 ${mine ? 'items-end' : 'items-start'} min-w-0 max-w-full">
        <div class="msg-bubble${mine ? ' is-mine' : ''}${message.pending ? ' opacity-60' : ''}">${body}${media}</div>
        <span class="text-[10.5px] text-faint px-2 flex items-center gap-1">
          ${esc(message.pending ? 'Sending…' : clockTime(message.created_at))}
          ${mine && !message.pending ? `<i class="fa-solid fa-check${state.seen ? '-double text-brand' : ''}"></i>` : ''}
        </span>
      </div>
    </div>`;
  }

  function renderMessages() {
    const rows = state.messages.concat(state.pending);
    if (!rows.length) {
      messagesHost.innerHTML = `<div class="m-auto text-center px-6">
        <span class="inline-block">${avatar(state.partner, 'avatar w-16 h-16 text-[20px]')}</span>
        <p class="mt-3 text-[14px] font-semibold">${esc(state.partner?.name || 'Faith In Member')}</p>
        <p class="mt-1 text-[13px] text-muted">Say hello and start the conversation.</p>
      </div>`;
      return;
    }

    const parts = [];
    if (state.hasMore) {
      parts.push('<button class="btn btn-ghost self-center text-[13px]" data-load-older type="button">Load earlier messages</button>');
    }
    let lastDay = '';
    rows.forEach(message => {
      const day = dayLabel(message.created_at) || 'Today';
      if (day !== lastDay) {
        lastDay = day;
        parts.push(`<span class="msg-day">${esc(day)}</span>`);
      }
      parts.push(messageBubble(message));
    });
    messagesHost.innerHTML = parts.join('');
  }

  function atBottom() {
    return messagesHost.scrollHeight - messagesHost.scrollTop - messagesHost.clientHeight < 80;
  }

  function scrollToLatest(behavior = 'auto') {
    messagesHost.scrollTo({ top: messagesHost.scrollHeight, behavior });
  }

  function markRead() {
    if (!state.threadId) return;
    const latest = state.messages[state.messages.length - 1];
    const key = `${state.threadId}:${latest ? latest.id : ''}`;
    if (state.lastReadMarkedFor === key) return;
    state.lastReadMarkedFor = key;
    api.request('cv_social_mark_thread_read', { thread_id: state.threadId }).catch(() => {});
  }

  function watchMessages(threadId) {
    if (state.stopMessages) state.stopMessages();
    state.stopMessages = window.cvDataSubscribe('thread_messages', { thread_id: threadId }, payload => {
      if (payload.thread_id !== state.threadId) return;
      const wasAtBottom = state.stickToBottom || atBottom();
      state.messages = payload.items || [];
      state.hasMore = payload.has_more || 0;
      state.oldestAt = payload.oldest_at || '';
      state.seen = payload.seen || 0;
      if (payload.other_user && payload.other_user.uid) state.partner = payload.other_user;
      // Anything the server has echoed back is no longer pending.
      state.pending = state.pending.filter(item => !state.messages.some(message => message.body === item.body && message.mine));
      paintPartner(payload.presence);
      renderMessages();
      paintSharedMedia();
      if (wasAtBottom) { scrollToLatest(); state.stickToBottom = true; }
      if (!document.hidden) markRead();
    }, error => {
      messagesHost.innerHTML = `<p class="m-auto text-center text-[13.5px] text-muted">${esc(error.message)}</p>`;
    });
  }

  function showConversationPane() {
    // One pane at a time below md; both side by side above it.
    inboxPane.classList.add('hidden', 'md:flex');
    conversationPane.classList.remove('hidden');
    conversationPane.classList.add('flex');
  }

  function showInboxPane() {
    inboxPane.classList.remove('hidden');
    conversationPane.classList.add('hidden');
    conversationPane.classList.remove('flex');
    conversationPane.classList.add('md:flex');
  }

  async function openThread(options) {
    let resolved;
    try {
      resolved = await api.request('cv_social_open_thread', options);
    } catch (error) {
      toast(error.message);
      return;
    }

    state.threadId = resolved.thread_id;
    state.partner = resolved.other_user;
    state.messages = [];
    state.pending = [];
    state.hasMore = 0;
    state.seen = 0;
    state.stickToBottom = true;
    state.lastReadMarkedFor = '';
    state.attachment = null;
    clearAttachment();

    header.hidden = false;
    composer.hidden = false;
    paintPartner(null);
    renderMessages();
    paintSharedMedia();
    renderInbox();
    showConversationPane();
    input.focus({ preventScroll: true });

    const url = new URL(location.href);
    url.searchParams.delete('to');
    url.searchParams.set('thread', state.threadId);
    history.replaceState({}, '', url);

    // An unsent conversation has no document to listen to yet; the first
    // message creates it and the subscription is started then.
    if (resolved.exists) {
      watchMessages(state.threadId);
      startPresence();
    } else if (state.stopMessages) {
      state.stopMessages();
      state.stopMessages = null;
    }
  }

  async function loadOlder(button) {
    if (!state.oldestAt || !state.threadId) return;
    button.disabled = true;
    button.textContent = 'Loading…';
    try {
      const page = await api.request('cv_social_get_message_thread', {
        thread_id: state.threadId,
        before: state.oldestAt
      });
      const anchorHeight = messagesHost.scrollHeight;
      state.messages = (page.items || []).concat(state.messages);
      state.hasMore = page.has_more || 0;
      state.oldestAt = page.oldest_at || '';
      state.stickToBottom = false;
      renderMessages();
      paintSharedMedia();
      // Keep the reader's place rather than jumping to the top of the page.
      messagesHost.scrollTop = messagesHost.scrollHeight - anchorHeight;
    } catch (error) {
      toast(error.message);
      button.disabled = false;
      button.textContent = 'Load earlier messages';
    }
  }

  /* ── presence and typing ────────────────────────────────────────────────── */

  function sendPresence(typing) {
    if (!state.threadId) return;
    state.typingActive = typing;
    state.typingSentAt = Date.now();
    api.request('cv_social_set_thread_presence', { thread_id: state.threadId, typing: typing ? 1 : 0 }).catch(() => {});
  }

  function startPresence() {
    stopPresence();
    sendPresence(false);
    state.presenceTimer = setInterval(() => {
      if (document.hidden || !state.threadId) return;
      sendPresence(state.typingActive);
    }, PRESENCE_INTERVAL_MS);
  }

  function stopPresence() {
    if (state.presenceTimer) clearInterval(state.presenceTimer);
    state.presenceTimer = null;
  }

  function noteTyping() {
    if (!state.threadId) return;
    if (!state.typingActive || Date.now() - state.typingSentAt > TYPING_THROTTLE_MS) sendPresence(true);
    clearTimeout(state.typingTimer);
    state.typingTimer = setTimeout(() => { if (state.typingActive) sendPresence(false); }, TYPING_RELEASE_MS);
  }

  /* ── attachments ────────────────────────────────────────────────────────── */

  function clearAttachment() {
    state.attachment = null;
    const preview = $('[data-attach-preview]');
    preview.classList.add('hidden');
    preview.classList.remove('flex');
    $('[data-attach-input]').value = '';
  }

  function showAttachment(attachment) {
    state.attachment = attachment;
    const preview = $('[data-attach-preview]');
    $('[data-attach-name]').textContent = attachment.name;
    preview.classList.remove('hidden');
    preview.classList.add('flex');
  }

  /**
   * Reads an image and, if needed, shrinks it until the encoded data URL fits
   * inside a Firestore document. Attachments ride along with the message, so
   * an oversized original would be rejected outright rather than sent large.
   */
  function readImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('That image could not be read.'));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('That image could not be read.'));
        image.onload = () => {
          const scale = Math.min(1, ATTACHMENT_MAX_EDGE / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
          let quality = 0.82;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          while (dataUrl.length > ATTACHMENT_MAX_BYTES && quality > 0.4) {
            quality -= 0.12;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          if (dataUrl.length > ATTACHMENT_MAX_BYTES) {
            reject(new Error('That image is too large to send. Try a smaller one.'));
            return;
          }
          resolve({ type: 'image', name: file.name || 'image.jpg', data_url: dataUrl });
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ── sending ────────────────────────────────────────────────────────────── */

  async function send() {
    const body = input.value.trim();
    const attachment = state.attachment;
    if (!body && !attachment) return;
    if (!state.threadId) return;

    const sendButton = $('[data-send]');
    sendButton.disabled = true;
    input.value = '';
    input.style.height = 'auto';
    clearTimeout(state.typingTimer);
    if (state.typingActive) sendPresence(false);

    const optimistic = { id: `pending-${Date.now()}`, body, attachment, mine: true, pending: true, created_at: new Date().toISOString() };
    state.pending.push(optimistic);
    state.stickToBottom = true;
    renderMessages();
    scrollToLatest('smooth');
    clearAttachment();

    try {
      const wasNew = !state.stopMessages;
      await api.request('cv_social_send_message', {
        thread_id: state.threadId,
        recipient_uid: state.partner?.uid || '',
        body,
        attachment: attachment ? JSON.stringify(attachment) : ''
      });
      // The first message is what creates the thread document, so this is the
      // point at which there is something to listen to.
      if (wasNew) { watchMessages(state.threadId); startPresence(); }
    } catch (error) {
      state.pending = state.pending.filter(item => item !== optimistic);
      renderMessages();
      input.value = body;
      if (attachment) showAttachment(attachment);
      toast(error.message);
    } finally {
      sendButton.disabled = false;
      input.focus({ preventScroll: true });
    }
  }

  /* ── new message ────────────────────────────────────────────────────────── */

  function openNewMessage() {
    newModal.classList.remove('hidden');
    newModal.classList.add('flex');
    const msgInput = $('#msg-people');
    if (msgInput) {
      msgInput.value = '';
      msgInput.focus();
    }
    searchPeople('');
  }

  function closeNewMessage() {
    newModal.classList.add('hidden');
    newModal.classList.remove('flex');
  }

  let peopleToken = 0;
  async function searchPeople(term = '') {
    const token = ++peopleToken;
    const query = String(term || '').trim();
    peopleList.innerHTML = '<p class="p-6 text-center text-[13px] text-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading members…</p>';
    try {
      const result = await api.request('cv_social_search_message_users', { search: query });
      if (token !== peopleToken) return;
      const items = result.items || result.users || [];
      if (!items.length) {
        peopleList.innerHTML = query
          ? '<p class="p-6 text-center text-[13px] text-muted">No members matched that name.</p>'
          : '<p class="p-6 text-center text-[13px] text-muted">No members found yet.</p>';
        return;
      }
      peopleList.innerHTML = items.map(person => `<button class="w-full flex items-center gap-3 p-2.5 rounded-xl row-hover text-left transition" type="button" data-person-uid="${esc(person.uid || '')}">
          ${avatar(person, 'avatar w-10 h-10 text-[13px]')}
          <span class="min-w-0 flex-1">
            <span class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[14px] font-semibold truncate">${esc(person.name || 'Faith In Member')}</span>
              ${person.is_following ? '<span class="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-brand-soft text-brand font-mono">Following</span>' : ''}
            </span>
            <span class="block text-[12px] text-muted truncate">${esc([person.role, person.church, person.ministry].filter(Boolean).join(' · ') || person.headline || 'Faith In member')}</span>
          </span>
          <i class="fa-solid fa-chevron-right text-[11px] text-faint ml-auto"></i>
        </button>`).join('');
    } catch (error) {
      if (token !== peopleToken) return;
      peopleList.innerHTML = `<p class="p-6 text-center text-[13px] text-muted">${esc(error.message)}</p>`;
    }
  }

  /* ── wiring ─────────────────────────────────────────────────────────────── */

  inbox.addEventListener('click', event => {
    const row = event.target.closest('[data-thread-id]');
    if (row) openThread({ thread_id: row.dataset.threadId });
  });

  messagesHost.addEventListener('click', event => {
    const older = event.target.closest('[data-load-older]');
    if (older) loadOlder(older);
  });

  messagesHost.addEventListener('scroll', () => { state.stickToBottom = atBottom(); }, { passive: true });

  $('#msg-search').addEventListener('input', event => { state.filter = event.target.value; renderInbox(); });

  $('[data-filter-unread]').addEventListener('click', event => {
    state.unreadOnly = !state.unreadOnly;
    event.currentTarget.classList.toggle('!bg-brand-soft', state.unreadOnly);
    event.currentTarget.classList.toggle('!text-brand', state.unreadOnly);
    event.currentTarget.title = state.unreadOnly ? 'Show all conversations' : 'Show unread only';
    renderInbox();
  });

  $('[data-back]').addEventListener('click', showInboxPane);

  $('[data-info-toggle]').addEventListener('click', event => {
    const open = infoPane.classList.contains('hidden');
    infoPane.classList.toggle('hidden', !open);
    infoPane.classList.toggle('flex', open);
    event.currentTarget.setAttribute('aria-expanded', String(open));
  });

  form.addEventListener('submit', event => { event.preventDefault(); send(); });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
    noteTyping();
  });

  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); }
  });

  $('[data-attach]').addEventListener('click', () => $('[data-attach-input]').click());
  $('[data-attach-clear]').addEventListener('click', clearAttachment);
  $('[data-attach-input]').addEventListener('change', async event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try { showAttachment(await readImage(file)); }
    catch (error) { toast(error.message); clearAttachment(); }
  });

  $('[data-new-message]').addEventListener('click', openNewMessage);
  $('[data-new-close]').addEventListener('click', closeNewMessage);
  newModal.addEventListener('click', event => { if (event.target === newModal) closeNewMessage(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && newModal.classList.contains('flex')) closeNewMessage(); });

  let peopleTimer = null;
  $('#msg-people').addEventListener('input', event => {
    clearTimeout(peopleTimer);
    const term = event.target.value;
    peopleTimer = setTimeout(() => searchPeople(term), 260);
  });

  peopleList.addEventListener('click', event => {
    const person = event.target.closest('[data-person-uid]');
    if (!person) return;
    closeNewMessage();
    openThread({ recipient_uid: person.dataset.personUid });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    markRead();
    if (state.threadId && state.stopMessages) sendPresence(state.typingActive);
  });

  window.addEventListener('pagehide', () => {
    if (state.stopThreads) state.stopThreads();
    if (state.stopMessages) state.stopMessages();
    stopPresence();
  });

  /* The header search box is shared chrome; on this page it filters the inbox. */
  document.addEventListener('fi:search', event => {
    state.filter = event.detail.query || '';
    $('#msg-search').value = state.filter;
    renderInbox();
  });

  /* ── start ──────────────────────────────────────────────────────────────── */

  function signedOut() {
    inbox.innerHTML = `<div class="p-8 text-center">
      <i class="fa-solid fa-lock text-2xl text-faint"></i>
      <p class="mt-2 text-[13.5px] text-muted">Sign in to read your conversations.</p>
      <button class="btn btn-primary mt-3" data-open-auth type="button">Sign in</button>
    </div>`;
    messagesHost.innerHTML = '<p class="m-auto text-center text-[13.5px] text-muted">Your private messages stay between you and the member you are writing to.</p>';
  }

  function start(user) {
    if (!user) { signedOut(); return; }
    watchThreads();
    const params = new URLSearchParams(location.search);
    const thread = params.get('thread');
    const to = params.get('to');
    if (thread) openThread({ thread_id: thread });
    else if (to) openThread({ recipient_uid: to });
  }

  let started = false;
  function startOnce(user) {
    if (started) return;
    started = true;
    start(user);
  }

  document.addEventListener('fi:session', event => startOnce(event.detail.user));
  // The session may already have resolved before this file ran.
  if (live.user) startOnce(live.user);
})();
