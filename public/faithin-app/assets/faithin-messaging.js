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
    stickToBottom: true,
    replyingTo: null,
    reactions: {},
    searchQuery: '',
    searchMatches: [],
    currentMatchIdx: -1,
    pinned: {},
    muted: false,
    blocked: false
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
      ? images.map(message => `<img alt="${esc(message.attachment.name || 'Shared image')}" class="aspect-square w-full object-cover rounded-lg cursor-zoom-in hover:opacity-90 transition" data-lightbox-trigger src="${esc(message.attachment.data_url)}"/>`).join('')
      : '<p class="col-span-3 text-[12.5px] text-muted">Images shared in this conversation appear here.</p>';
  }

  /* ── reactions & pinned messages ────────────────────────────────────────── */

  function loadReactions() {
    if (!state.threadId) return;
    try {
      state.reactions = JSON.parse(localStorage.getItem(`fi_reactions_${state.threadId}`)) || {};
    } catch {
      state.reactions = {};
    }
  }

  function saveReactions() {
    if (!state.threadId) return;
    try {
      localStorage.setItem(`fi_reactions_${state.threadId}`, JSON.stringify(state.reactions));
    } catch {}
  }

  function setReaction(messageId, emoji) {
    if (!messageId) return;
    if (state.reactions[messageId] === emoji) {
      delete state.reactions[messageId];
    } else {
      state.reactions[messageId] = emoji;
    }
    saveReactions();
    renderMessages();
  }

  function loadPinned() {
    if (!state.threadId) return;
    try {
      state.pinned = JSON.parse(localStorage.getItem(`fi_pinned_${state.threadId}`)) || {};
    } catch {
      state.pinned = {};
    }
  }

  function savePinned() {
    if (!state.threadId) return;
    try {
      localStorage.setItem(`fi_pinned_${state.threadId}`, JSON.stringify(state.pinned));
    } catch {}
  }

  function togglePin(messageId) {
    if (!messageId) return;
    if (state.pinned[messageId]) {
      delete state.pinned[messageId];
      toast('Message unpinned');
    } else {
      state.pinned[messageId] = true;
      toast('Message pinned ★');
    }
    savePinned();
    renderMessages();
    renderPinnedList();
  }

  function renderPinnedList() {
    const listEl = $('[data-pinned-list]');
    const countEl = $('[data-pinned-count]');
    const pinnedIds = Object.keys(state.pinned || {});
    if (countEl) countEl.textContent = String(pinnedIds.length);
    if (!listEl) return;
    if (!pinnedIds.length) {
      listEl.innerHTML = '<p class="text-[11.5px] text-muted italic">Hover any message and click ★ to pin.</p>';
      return;
    }
    const all = state.messages.concat(state.pending);
    const pinnedMessages = all.filter(m => state.pinned[m.id]);
    if (!pinnedMessages.length) {
      listEl.innerHTML = '<p class="text-[11.5px] text-muted italic">Pinned in earlier history.</p>';
      return;
    }
    listEl.innerHTML = pinnedMessages.map(m => {
      const snippet = esc((m.body || (m.attachment && m.attachment.name) || 'Attachment').slice(0, 55));
      return `<button type="button" class="w-full text-left p-2 rounded-lg row-hover border border-line/60 bg-surface flex items-start gap-2 transition" data-jump-to-msg="${esc(m.id)}">
        <i class="fa-solid fa-star text-amber-500 text-[10px] mt-0.5 shrink-0"></i>
        <div class="min-w-0 flex-1">
          <p class="text-[12px] text-ink leading-tight line-clamp-2">${snippet}</p>
          <span class="text-[10px] text-faint mt-0.5 block">${clockTime(m.created_at)}</span>
        </div>
      </button>`;
    }).join('');
  }

  function jumpToMessage(msgId) {
    const el = document.querySelector(`[data-message-id="${msgId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const bubble = el.querySelector('.msg-bubble');
      if (bubble) {
        bubble.classList.add('is-search-active');
        setTimeout(() => bubble.classList.remove('is-search-active'), 2000);
      }
    } else {
      toast('Message is in earlier history.');
    }
  }

  /* ── replying ───────────────────────────────────────────────────────────── */

  function setReplyingTo(message) {
    const rawSnippet = (message.body || (message.attachment && message.attachment.name) || 'Attachment').slice(0, 75);
    state.replyingTo = {
      id: message.id,
      name: message.mine ? 'You' : (state.partner?.name || 'Member'),
      snippet: rawSnippet
    };
    const replyBanner = $('[data-composer-reply]');
    const replyText = $('[data-composer-reply-text]');
    if (replyBanner && replyText) {
      replyText.innerHTML = `<strong>${esc(state.replyingTo.name)}:</strong> ${esc(state.replyingTo.snippet)}`;
      replyBanner.classList.remove('hidden');
      replyBanner.classList.add('flex');
    }
    input.focus({ preventScroll: true });
  }

  function clearReplyingTo() {
    state.replyingTo = null;
    const replyBanner = $('[data-composer-reply]');
    if (replyBanner) {
      replyBanner.classList.add('hidden');
      replyBanner.classList.remove('flex');
    }
  }

  /* ── copy & delete message ──────────────────────────────────────────────── */

  function copyMessageText(messageId) {
    const all = state.messages.concat(state.pending);
    const message = all.find(m => String(m.id) === String(messageId));
    if (message && message.body) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(message.body).then(() => toast('Copied to clipboard')).catch(() => toast('Could not copy'));
      } else {
        toast('Message copied');
      }
    }
  }

  function deleteMessage(messageId) {
    state.messages = state.messages.filter(m => String(m.id) !== String(messageId));
    state.pending = state.pending.filter(m => String(m.id) !== String(messageId));
    renderMessages();
    toast('Message removed from view');
  }

  /* ── chat theme ─────────────────────────────────────────────────────────── */

  const THEMES = {
    '#0866FF': 'Facebook Blue',
    '#2F5BEA': 'Faith In Blue',
    '#059669': 'Emerald',
    '#7C3AED': 'Royal Violet',
    '#EA580C': 'Sunset Orange',
    '#E11D48': 'Rose'
  };

  function applyTheme(color) {
    const chosen = color || (state.threadId && localStorage.getItem(`fi_theme_${state.threadId}`)) || localStorage.getItem('fi_bubble_theme') || '#0866FF';
    document.documentElement.style.setProperty('--msg-mine-bg', chosen);
    const label = $('[data-theme-label]');
    if (label) label.textContent = THEMES[chosen] || 'Facebook Blue';
    document.querySelectorAll('[data-theme-color]').forEach(btn => {
      const active = btn.dataset.themeColor === chosen;
      btn.classList.toggle('ring-2', active);
      btn.classList.toggle('ring-offset-1', active);
    });
    if (color && state.threadId) {
      try {
        localStorage.setItem(`fi_theme_${state.threadId}`, color);
        localStorage.setItem('fi_bubble_theme', color);
      } catch {}
    }
  }

  /* ── in-conversation search ─────────────────────────────────────────────── */

  function toggleChatSearch(forceOpen) {
    const bar = $('[data-chat-search-bar]');
    if (!bar) return;
    const isClosed = bar.classList.contains('hidden');
    const nextOpen = typeof forceOpen === 'boolean' ? forceOpen : isClosed;
    bar.classList.toggle('hidden', !nextOpen);
    bar.classList.toggle('flex', nextOpen);
    if (nextOpen) {
      const inp = $('[data-chat-search-input]');
      if (inp) { inp.value = state.searchQuery || ''; inp.focus(); }
    } else {
      state.searchQuery = '';
      state.searchMatches = [];
      state.currentMatchIdx = -1;
      const countEl = $('[data-chat-search-count]');
      if (countEl) countEl.textContent = '0 matches';
      renderMessages();
    }
  }

  function handleChatSearch(term) {
    state.searchQuery = (term || '').trim().toLowerCase();
    state.searchMatches = [];
    state.currentMatchIdx = -1;
    const countEl = $('[data-chat-search-count]');
    if (!state.searchQuery) {
      if (countEl) countEl.textContent = '0 matches';
      renderMessages();
      return;
    }
    const all = state.messages.concat(state.pending);
    all.forEach(msg => {
      if (msg.body && msg.body.toLowerCase().includes(state.searchQuery)) {
        state.searchMatches.push(msg.id);
      }
    });
    const total = state.searchMatches.length;
    state.currentMatchIdx = total ? 0 : -1;
    if (countEl) countEl.textContent = total ? `${state.currentMatchIdx + 1}/${total}` : '0 matches';
    renderMessages();
    if (total) jumpToMatch(0);
  }

  function jumpToMatch(index) {
    const total = state.searchMatches.length;
    if (!total) return;
    state.currentMatchIdx = (index + total) % total;
    const countEl = $('[data-chat-search-count]');
    if (countEl) countEl.textContent = `${state.currentMatchIdx + 1}/${total}`;
    const targetId = state.searchMatches[state.currentMatchIdx];
    const el = document.querySelector(`[data-message-id="${targetId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const bubble = el.querySelector('.msg-bubble');
      if (bubble) {
        bubble.classList.add('is-search-active');
        setTimeout(() => bubble.classList.remove('is-search-active'), 2000);
      }
    }
  }

  /* ── calling modals ─────────────────────────────────────────────────────── */

  function startVoiceCall() {
    toast('Voice calling will be available in an upcoming update.');
  }

  function startVideoCall() {
    toast('Video calling will be available in an upcoming update.');
  }

  /* ── mute notifications ─────────────────────────────────────────────────── */

  function checkMute() {
    if (!state.threadId) return;
    state.muted = localStorage.getItem(`fi_muted_${state.threadId}`) === '1';
    const toggle = $('[data-mute-toggle]');
    if (toggle) toggle.checked = state.muted;
    const label = $('[data-menu-mute-label]');
    if (label) label.textContent = state.muted ? 'Unmute Notifications' : 'Mute Notifications';
  }

  function toggleMute() {
    if (!state.threadId) return;
    state.muted = !state.muted;
    try {
      localStorage.setItem(`fi_muted_${state.threadId}`, state.muted ? '1' : '0');
    } catch {}
    checkMute();
    toast(state.muted ? 'Notifications muted for this conversation' : 'Notifications unmuted');
  }

  /* ── block & clear chat ─────────────────────────────────────────────────── */

  function openBlockModal() {
    const modal = $('[data-block-modal]');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
  }

  function closeBlockModal() {
    const modal = $('[data-block-modal]');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  }

  // This used to set an in-memory flag, announce the member had been blocked,
  // and forget it on reload — worse than no button, because someone may be
  // relying on it. The list is now saved to the account and enforced: their
  // posts leave your feed, their notifications stop, and this conversation
  // closes. It cannot stop them writing to you — that needs server-side
  // enforcement this deployment has no service account for — so the wording
  // says what it does rather than implying more.
  async function confirmBlock() {
    const uid = state.partner?.uid;
    if (!uid) { closeBlockModal(); return toast('Open the conversation first.'); }
    try {
      await api.request('cv_block_user', { uid });
      state.blocked = true;
      closeBlockModal();
      toast(`You will no longer see ${state.partner?.name || 'this member'} in your feed or notifications.`);
      setTimeout(() => { location.href = '/messages'; }, 900);
    } catch (error) {
      closeBlockModal();
      toast(error.message);
    }
  }

  function openClearModal() {
    const modal = $('[data-clear-modal]');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
  }

  function closeClearModal() {
    const modal = $('[data-clear-modal]');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  }

  // Deliberately local: there is no endpoint that deletes a thread's history
  // for both people, and quietly clearing only your own copy while saying
  // "conversation cleared" reads as if it deleted theirs too.
  function confirmClearChat() {
    closeClearModal();
    state.messages = [];
    state.pending = [];
    renderMessages();
    toast('Cleared from this view. Reopening the chat restores it.');
  }

  /* ── scripture verse quick share ───────────────────────────────────────── */

  const SCRIPTURE_VERSES = [
    {
      ref: 'Philippians 4:13',
      text: 'I can do all things through Christ who strengthens me.',
      topic: 'Strength'
    },
    {
      ref: 'John 3:16',
      text: 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.',
      topic: 'Salvation & Love'
    },
    {
      ref: 'Psalm 23:1',
      text: 'The Lord is my shepherd; I shall not want.',
      topic: 'Comfort & Peace'
    },
    {
      ref: 'Romans 8:28',
      text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
      topic: 'Hope & Purpose'
    },
    {
      ref: 'Jeremiah 29:11',
      text: '“For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.”',
      topic: 'Future & Hope'
    },
    {
      ref: 'Proverbs 3:5-6',
      text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to Him, and He will make your paths straight.',
      topic: 'Trust & Guidance'
    },
    {
      ref: 'Matthew 11:28',
      text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
      topic: 'Rest & Peace'
    },
    {
      ref: 'Joshua 1:9',
      text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
      topic: 'Courage'
    },
    {
      ref: 'Isaiah 40:31',
      text: 'Those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
      topic: 'Perseverance'
    },
    {
      ref: '1 Corinthians 13:4, 7',
      text: 'Love is patient, love is kind... It always protects, always trusts, always hopes, always perseveres.',
      topic: 'Love'
    },
    {
      ref: 'Psalm 46:1',
      text: 'God is our refuge and strength, an ever-present help in trouble.',
      topic: 'Protection & Refuge'
    },
    {
      ref: 'Romans 15:13',
      text: 'May the God of hope fill you with all joy and peace as you trust in Him, so that you may overflow with hope by the power of the Holy Spirit.',
      topic: 'Joy & Peace'
    }
  ];

  function openVerseModal() {
    const modal = $('[data-verse-modal]');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    renderVerseList();
    const filterInput = $('[data-verse-filter]');
    if (filterInput) {
      filterInput.value = '';
      filterInput.focus();
    }
  }

  function closeVerseModal() {
    const modal = $('[data-verse-modal]');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  function renderVerseList(filter = '') {
    const listEl = $('[data-verse-list]');
    if (!listEl) return;
    const term = (filter || '').trim().toLowerCase();
    const filtered = SCRIPTURE_VERSES.filter(v => {
      if (!term) return true;
      return `${v.ref} ${v.text} ${v.topic}`.toLowerCase().includes(term);
    });

    if (!filtered.length) {
      listEl.innerHTML = '<p class="text-center text-[12.5px] text-muted p-4">No matching verses found.</p>';
      return;
    }

    listEl.innerHTML = filtered.map((v, i) => `
      <div class="msg-verse-item" data-verse-idx="${i}">
        <div class="flex items-center justify-between gap-2">
          <span class="font-bold text-[13px] text-ink flex items-center gap-1.5"><i class="fa-solid fa-book-bible text-amber-500 text-[11px]"></i>${esc(v.ref)}</span>
          <span class="text-[10.5px] font-medium text-muted px-2 py-0.5 rounded-full bg-raised">${esc(v.topic)}</span>
        </div>
        <p class="text-[12.5px] text-muted mt-1 leading-snug">“${esc(v.text)}”</p>
      </div>
    `).join('');

    listEl.querySelectorAll('.msg-verse-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = Number(item.dataset.verseIdx);
        const verse = filtered[idx];
        if (verse) insertScriptureVerse(verse);
      });
    });
  }

  function insertScriptureVerse(verse) {
    closeVerseModal();
    const snippet = `📖 "${verse.text}" — ${verse.ref}`;
    input.value = input.value ? `${input.value}\n\n${snippet}` : snippet;
    autoGrow(input);
    input.focus({ preventScroll: true });
    toast(`Inserted ${verse.ref}`);
  }

  /* ── quick emoji picker ────────────────────────────────────────────────── */

  const QUICK_EMOJIS = ['🙏', '✝️', '❤️', '🕊️', '📖', '✨', '👍', '😊', '🙌', '🕯️', '🌿', '🌟', '🤝', '⛪', '🛡️', '🤍', '🔥', '🌈'];

  function initEmojiPicker() {
    const grid = $('[data-emoji-grid]');
    if (!grid) return;
    grid.innerHTML = QUICK_EMOJIS.map(emoji => `<button type="button" class="msg-emoji-btn" data-composer-emoji="${emoji}">${emoji}</button>`).join('');
    grid.querySelectorAll('[data-composer-emoji]').forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.dataset.composerEmoji;
        input.value += emoji;
        autoGrow(input);
        input.focus({ preventScroll: true });
        toggleEmojiPicker(false);
      });
    });
  }

  function toggleEmojiPicker(force) {
    const popover = $('[data-emoji-picker]');
    if (!popover) return;
    const isClosed = popover.classList.contains('hidden');
    const nextOpen = typeof force === 'boolean' ? force : isClosed;
    popover.classList.toggle('hidden', !nextOpen);
  }

  /* ── image lightbox ────────────────────────────────────────────────────── */

  function openLightbox(src) {
    const lightbox = $('[data-image-lightbox]');
    const img = $('[data-lightbox-img]');
    if (!lightbox || !img || !src) return;
    img.src = src;
    img.classList.remove('hidden');
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
  }

  function closeLightbox() {
    const lightbox = $('[data-image-lightbox]');
    const img = $('[data-lightbox-img]');
    if (img) {
      img.removeAttribute('src');
      img.classList.add('hidden');
    }
    if (lightbox) {
      lightbox.classList.add('hidden');
      lightbox.classList.remove('flex');
    }
  }

  /* ── mark as unread ────────────────────────────────────────────────────── */

  async function markAsUnread() {
    if (!state.threadId) return;
    const thread = state.threads.find(t => t.id === state.threadId);
    if (thread) {
      thread.unread_count = 1;
    }
    state.lastReadMarkedFor = '';
    try {
      await api.request('cv_social_mark_thread_unread', { thread_id: state.threadId });
    } catch (_) {}
    renderInbox();
    showInboxPane();
    toast('Conversation marked as unread');
  }

  /* ── message bubble ─────────────────────────────────────────────────────── */

  function messageBubble(message) {
    const mine = !!message.mine;
    const isPinned = !!(state.pinned && state.pinned[message.id]);
    const attachment = message.attachment;
    const media = attachment && attachment.type === 'image' && attachment.data_url
      ? `<img alt="${esc(attachment.name || 'Shared image')}" class="rounded-xl mt-1 max-h-72 w-auto cursor-zoom-in hover:opacity-95 transition" data-lightbox-trigger src="${esc(attachment.data_url)}"/>`
      : (attachment
        ? `<span class="flex items-center gap-2 mt-1 text-[13px]"><i class="fa-regular fa-file"></i>${esc(attachment.name || 'Attachment')}</span>`
        : '');

    let bodyText = message.body ? esc(message.body) : '';
    if (state.searchQuery && bodyText.toLowerCase().includes(state.searchQuery)) {
      const regex = new RegExp(`(${state.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      bodyText = bodyText.replace(regex, '<mark class="msg-search-highlight">$1</mark>');
    }

    const replyQuote = message.reply_to
      ? `<div class="msg-reply-quote"><strong>${esc(message.reply_to.name || 'User')}:</strong> ${esc(message.reply_to.snippet || '')}</div>`
      : '';

    const reaction = state.reactions[message.id];
    const reactionPill = reaction
      ? `<button type="button" class="msg-reaction-pill" data-toggle-reaction="${esc(message.id)}" title="Click to remove reaction">${reaction}</button>`
      : '';

    const actions = `
      <div class="msg-bubble-actions">
        <button class="msg-action-btn" data-bubble-action="react" data-msg-id="${esc(message.id)}" title="React" type="button"><i class="fa-regular fa-face-smile"></i></button>
        <button class="msg-action-btn" data-bubble-action="reply" data-msg-id="${esc(message.id)}" title="Reply" type="button"><i class="fa-solid fa-reply"></i></button>
        <button class="msg-action-btn ${isPinned ? 'text-amber-500' : ''}" data-bubble-action="pin" data-msg-id="${esc(message.id)}" title="${isPinned ? 'Unpin message' : 'Pin message'}" type="button"><i class="fa-${isPinned ? 'solid' : 'regular'} fa-star"></i></button>
        <button class="msg-action-btn" data-bubble-action="copy" data-msg-id="${esc(message.id)}" title="Copy" type="button"><i class="fa-regular fa-copy"></i></button>
        <button class="msg-action-btn" data-bubble-action="delete" data-msg-id="${esc(message.id)}" title="Delete" type="button"><i class="fa-regular fa-trash-can"></i></button>
      </div>
      <div class="msg-reactions-popover" data-reactions-popover="${esc(message.id)}">
        <button type="button" data-react-emoji="❤️" data-msg-id="${esc(message.id)}" title="Love">❤️</button>
        <button type="button" data-react-emoji="👍" data-msg-id="${esc(message.id)}" title="Like">👍</button>
        <button type="button" data-react-emoji="😂" data-msg-id="${esc(message.id)}" title="Haha">😂</button>
        <button type="button" data-react-emoji="🙏" data-msg-id="${esc(message.id)}" title="Pray">🙏</button>
        <button type="button" data-react-emoji="😮" data-msg-id="${esc(message.id)}" title="Wow">😮</button>
        <button type="button" data-react-emoji="😢" data-msg-id="${esc(message.id)}" title="Sad">😢</button>
      </div>
    `;

    return `<div class="msg-row-wrap ${mine ? 'is-mine' : ''}" data-message-id="${esc(message.id || '')}">
      ${mine ? '' : `<span class="shrink-0 mb-1">${avatar(state.partner, 'avatar w-7 h-7 text-[11px]')}</span>`}
      <div class="msg-bubble-group">
        <div class="flex flex-col gap-1 ${mine ? 'items-end' : 'items-start'} min-w-0 max-w-full">
          <div class="msg-bubble${mine ? ' is-mine' : ''}${message.pending ? ' opacity-60' : ''}${isPinned ? ' is-pinned' : ''}">
            ${replyQuote}${bodyText}${media}${reactionPill}
          </div>
          <span class="text-[10.5px] text-faint px-2 flex items-center gap-1">
            ${esc(message.pending ? 'Sending…' : clockTime(message.created_at))}
            ${mine && !message.pending ? `<i class="fa-solid fa-check${state.seen ? '-double text-brand' : ''}"></i>` : ''}
          </span>
        </div>
        ${message.pending ? '' : actions}
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
      renderPinnedList();
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
    loadReactions();
    loadPinned();
    applyTheme();
    checkMute();
    clearReplyingTo();
    paintPartner(null);
    renderMessages();
    paintSharedMedia();
    renderPinnedList();
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

    let replyPayload = null;
    if (state.replyingTo) {
      replyPayload = {
        id: state.replyingTo.id,
        name: state.replyingTo.name,
        snippet: state.replyingTo.snippet
      };
      clearReplyingTo();
    }

    const optimistic = { id: `pending-${Date.now()}`, body, reply_to: replyPayload, attachment, mine: true, pending: true, created_at: new Date().toISOString() };
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
    if (older) { loadOlder(older); return; }

    const reactBtn = event.target.closest('[data-bubble-action="react"]');
    if (reactBtn) {
      event.stopPropagation();
      const msgId = reactBtn.dataset.msgId;
      const popover = document.querySelector(`[data-reactions-popover="${msgId}"]`);
      if (popover) {
        const isOpen = popover.classList.contains('is-open');
        document.querySelectorAll('.msg-reactions-popover.is-open').forEach(p => p.classList.remove('is-open'));
        if (!isOpen) popover.classList.add('is-open');
      }
      return;
    }

    const emojiBtn = event.target.closest('[data-react-emoji]');
    if (emojiBtn) {
      event.stopPropagation();
      const msgId = emojiBtn.dataset.msgId;
      const emoji = emojiBtn.dataset.reactEmoji;
      setReaction(msgId, emoji);
      document.querySelectorAll('.msg-reactions-popover.is-open').forEach(p => p.classList.remove('is-open'));
      return;
    }

    const pill = event.target.closest('[data-toggle-reaction]');
    if (pill) {
      event.stopPropagation();
      const msgId = pill.dataset.toggleReaction;
      delete state.reactions[msgId];
      saveReactions();
      renderMessages();
      return;
    }

    const replyBtn = event.target.closest('[data-bubble-action="reply"]');
    if (replyBtn) {
      event.stopPropagation();
      const msgId = replyBtn.dataset.msgId;
      const target = state.messages.concat(state.pending).find(m => String(m.id) === String(msgId));
      if (target) setReplyingTo(target);
      return;
    }

    const copyBtn = event.target.closest('[data-bubble-action="copy"]');
    if (copyBtn) {
      event.stopPropagation();
      const msgId = copyBtn.dataset.msgId;
      copyMessageText(msgId);
      return;
    }

    const pinBtn = event.target.closest('[data-bubble-action="pin"]');
    if (pinBtn) {
      event.stopPropagation();
      const msgId = pinBtn.dataset.msgId;
      togglePin(msgId);
      return;
    }

    const imgTrigger = event.target.closest('[data-lightbox-trigger]');
    if (imgTrigger) {
      event.stopPropagation();
      openLightbox(imgTrigger.src);
      return;
    }

    const deleteBtn = event.target.closest('[data-bubble-action="delete"]');
    if (deleteBtn) {
      event.stopPropagation();
      const msgId = deleteBtn.dataset.msgId;
      deleteMessage(msgId);
      return;
    }
  });

  $('[data-composer-reply-cancel]')?.addEventListener('click', clearReplyingTo);

  /* ── user functions wiring ── */
  document.querySelectorAll('[data-voice-call]').forEach(b => b.addEventListener('click', startVoiceCall));
  document.querySelectorAll('[data-video-call]').forEach(b => b.addEventListener('click', startVideoCall));

  document.querySelectorAll('[data-chat-search-toggle]').forEach(b => b.addEventListener('click', () => toggleChatSearch()));
  $('[data-chat-search-input]')?.addEventListener('input', e => handleChatSearch(e.target.value));
  $('[data-chat-search-prev]')?.addEventListener('click', () => jumpToMatch(state.currentMatchIdx - 1));
  $('[data-chat-search-next]')?.addEventListener('click', () => jumpToMatch(state.currentMatchIdx + 1));
  $('[data-chat-search-close]')?.addEventListener('click', () => toggleChatSearch(false));

  /* ── scripture quick share wiring ── */
  $('[data-verse-toggle]')?.addEventListener('click', openVerseModal);
  $('[data-verse-close]')?.addEventListener('click', closeVerseModal);
  $('[data-verse-modal]')?.addEventListener('click', e => {
    if (e.target.hasAttribute('data-verse-modal') || e.target.classList.contains('msg-verse-modal')) closeVerseModal();
  });
  $('[data-verse-filter]')?.addEventListener('input', e => renderVerseList(e.target.value));

  /* ── emoji picker wiring ── */
  initEmojiPicker();
  $('[data-emoji-toggle]')?.addEventListener('click', e => {
    e.stopPropagation();
    toggleEmojiPicker();
  });
  $('[data-emoji-close]')?.addEventListener('click', () => toggleEmojiPicker(false));

  /* ── lightbox wiring ── */
  $('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
  $('[data-image-lightbox]')?.addEventListener('click', e => {
    if (e.target.hasAttribute('data-image-lightbox') || e.target.classList.contains('msg-lightbox')) closeLightbox();
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeVerseModal();
      toggleEmojiPicker(false);
    }
  });

  /* ── mark as unread wiring ── */
  document.querySelectorAll('[data-mark-unread]').forEach(b => b.addEventListener('click', () => {
    userMenuDropdown?.classList.add('hidden');
    markAsUnread();
  }));

  /* ── info pane click wiring (jump to pinned message, open lightbox) ── */
  infoPane.addEventListener('click', event => {
    const jumpBtn = event.target.closest('[data-jump-to-msg]');
    if (jumpBtn) {
      jumpToMessage(jumpBtn.dataset.jumpToMsg);
      return;
    }
    const img = event.target.closest('[data-lightbox-trigger]');
    if (img) {
      openLightbox(img.src);
      return;
    }
  });

  const userMenuBtn = $('[data-user-menu-btn]');
  const userMenuDropdown = $('[data-user-menu-dropdown]');
  if (userMenuBtn && userMenuDropdown) {
    userMenuBtn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = !userMenuDropdown.classList.contains('hidden');
      userMenuDropdown.classList.toggle('hidden', isOpen);
      userMenuDropdown.classList.toggle('flex', !isOpen);
    });
  }

  document.querySelectorAll('[data-theme-color]').forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.themeColor));
  });

  $('[data-mute-toggle]')?.addEventListener('change', toggleMute);
  $('[data-menu-mute]')?.addEventListener('click', () => {
    toggleMute();
    userMenuDropdown?.classList.add('hidden');
  });

  document.querySelectorAll('[data-clear-chat]').forEach(b => b.addEventListener('click', () => {
    userMenuDropdown?.classList.add('hidden');
    openClearModal();
  }));
  $('[data-clear-cancel]')?.addEventListener('click', closeClearModal);
  $('[data-clear-confirm]')?.addEventListener('click', confirmClearChat);

  document.querySelectorAll('[data-block-user]').forEach(b => b.addEventListener('click', () => {
    userMenuDropdown?.classList.add('hidden');
    openBlockModal();
  }));
  $('[data-block-cancel]')?.addEventListener('click', closeBlockModal);
  $('[data-block-confirm]')?.addEventListener('click', confirmBlock);

  document.addEventListener('click', event => {
    if (!event.target.closest('.msg-bubble-actions') && !event.target.closest('.msg-reactions-popover')) {
      document.querySelectorAll('.msg-reactions-popover.is-open').forEach(p => p.classList.remove('is-open'));
    }
    if (userMenuDropdown && !userMenuDropdown.classList.contains('hidden')) {
      const root = $('[data-user-menu-root]');
      if (!root || !root.contains(event.target)) {
        userMenuDropdown.classList.add('hidden');
        userMenuDropdown.classList.remove('flex');
      }
    }
    if (!event.target.closest('[data-emoji-picker]') && !event.target.closest('[data-emoji-toggle]')) {
      toggleEmojiPicker(false);
    }
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
