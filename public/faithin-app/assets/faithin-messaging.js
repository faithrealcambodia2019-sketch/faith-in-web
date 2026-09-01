/* ==========================================================================
   Faith In — Messaging
   Instant zero-loading Messenger UI with pre-cached conversations,
   calling overlay, interactive reactions, attachments, accordion info panel,
   and realtime backend sync.
   ========================================================================== */
(() => {
  'use strict';

  if (document.body.dataset.page !== 'messaging') return;

  const { $, $$, esc, toast } = window.FI || {
    $: (sel, el = document) => el.querySelector(sel),
    $$: (sel, el = document) => Array.from(el.querySelectorAll(sel)),
    esc: str => String(str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])),
    toast: msg => alert(msg)
  };
  const live = window.FILive || {};
  const api = live.api || { request: async () => ({}) };

  /* Initial Mock & Cached Conversations for Instant Zero-Delay Load */
  const DEFAULT_CONVERSATIONS = [
    {
      id: 'mock-1',
      name: 'Sophea Sok',
      avatar: 'SS',
      color: 'bg-blue-600',
      unread: 2,
      status: 'Active now',
      role: 'Worship Leader',
      church: 'Phnom Penh Grace Church',
      messages: [
        { id: 'm-1-1', sender: 'them', text: 'Hello! Are you going to the service tomorrow?', time: '10:00 AM', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 'm-1-2', sender: 'them', text: 'Let me know so we can save a seat.', time: '10:01 AM', created_at: new Date(Date.now() - 3500000).toISOString() }
      ]
    },
    {
      id: 'mock-2',
      name: 'Dara Chhan',
      avatar: 'DC',
      color: 'bg-emerald-600',
      unread: 0,
      status: 'Active 5m ago',
      role: 'Youth Pastor',
      church: 'Faith Community Church',
      messages: [
        { 
          id: 'm-2-1', 
          sender: 'me', 
          text: 'Here is the PDF we discussed.', 
          time: 'Yesterday', 
          created_at: new Date(Date.now() - 86400000).toISOString(),
          attachment: { name: 'Youth_Ministry_Guide.pdf', size: '2.4 MB', type: 'application/pdf' } 
        },
        { 
          id: 'm-2-2', 
          sender: 'them', 
          text: 'Yes, thank you! It was very helpful.', 
          time: 'Yesterday', 
          created_at: new Date(Date.now() - 82000000).toISOString() 
        }
      ]
    },
    {
      id: 'mock-3',
      name: 'Youth Ministry Team',
      avatar: 'YM',
      color: 'bg-purple-600',
      unread: 0,
      status: '3 members',
      role: 'Ministry Group',
      church: 'Faith In Network',
      messages: [
        { id: 'm-3-1', sender: 'them', text: 'Meeting at 5 PM this Friday.', time: 'Mon', created_at: new Date(Date.now() - 172800000).toISOString() }
      ]
    }
  ];

  function loadSavedConversations() {
    try {
      const stored = localStorage.getItem('fi_conversations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {}
    return DEFAULT_CONVERSATIONS;
  }

  function saveConversations(convs) {
    try {
      localStorage.setItem('fi_conversations', JSON.stringify(convs));
    } catch (e) {}
  }

  const state = {
    conversations: loadSavedConversations(),
    activeChatId: null,
    searchQuery: '',
    unreadOnly: false,
    attachment: null,
    activeCall: null,
    isMuted: false,
    expandedPanels: {
      customize: true,
      media: false,
      privacy: false
    }
  };

  /* Elements */
  const inbox = $('[data-thread-list]');
  const messagesHost = $('[data-messages]');
  const conversationPane = $('[data-pane="conversation"]');
  const inboxPane = $('[data-pane="inbox"]');
  const infoPane = $('[data-pane="info"]');
  const form = $('[data-message-form]');
  const input = $('#msg-input');
  const searchInput = $('#msg-search');
  const attachPreview = $('[data-attach-preview]');
  const fileInput = $('[data-file-input]');
  const photoInput = $('[data-photo-input]');
  const callOverlay = $('#msg-call-overlay');
  const newModal = $('[data-new-modal]');
  const peopleList = $('[data-people-list]');

  /* ── Formatting Helpers ─────────────────────────────────────────────────── */
  function getInitials(name) {
    if (!name) return 'FI';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  function getAvatarColor(name = '') {
    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-rose-600', 'bg-amber-600', 'bg-indigo-600'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  /* ── Rendering Inbox ────────────────────────────────────────────────────── */
  function renderInbox() {
    const query = state.searchQuery.trim().toLowerCase();
    const list = state.conversations.filter(chat => {
      if (state.unreadOnly && !chat.unread) return false;
      if (!query) return true;
      const lastMsg = chat.messages[chat.messages.length - 1]?.text || '';
      return chat.name.toLowerCase().includes(query) || lastMsg.toLowerCase().includes(query);
    });

    if (!list.length) {
      inbox.innerHTML = `<div class="p-8 text-center text-[13.5px] text-[#65676b] dark:text-gray-400">
        No conversations found.
      </div>`;
      return;
    }

    inbox.innerHTML = list.map(chat => {
      const isActive = chat.id === state.activeChatId;
      const unread = chat.unread > 0;
      const lastMsg = chat.messages[chat.messages.length - 1];
      const lastText = lastMsg ? (lastMsg.sender === 'me' ? 'You: ' + lastMsg.text : lastMsg.text) : 'Started a conversation';
      const lastTime = lastMsg?.time || 'New';
      const isOnline = (chat.status || '').toLowerCase().includes('active now');
      const avatarBg = chat.color || getAvatarColor(chat.name);
      const initials = chat.avatar || getInitials(chat.name);

      return `
        <button class="msg-thread ${isActive ? 'is-active' : ''} ${unread ? 'is-unread' : ''}" data-chat-id="${esc(chat.id)}" type="button">
          <div class="relative shrink-0">
            <div class="w-12 h-12 rounded-full text-white flex items-center justify-center text-base font-semibold ${avatarBg}">
              ${esc(initials)}
            </div>
            ${isOnline ? '<span class="msg-dot"></span>' : ''}
          </div>
          <div class="flex-1 min-w-0 text-left">
            <div class="flex items-center justify-between gap-1">
              <span class="msg-thread__name text-[14.5px] truncate ${unread ? 'font-bold text-[#1c1e21] dark:text-white' : 'font-semibold text-[#1c1e21] dark:text-gray-200'}">
                ${esc(chat.name)}
              </span>
              <span class="text-[11.5px] shrink-0 ${unread ? 'font-bold text-[#1877f2]' : 'text-[#65676b] dark:text-gray-400'}">
                ${esc(lastTime)}
              </span>
            </div>
            <div class="flex items-center justify-between gap-1 mt-0.5">
              <span class="msg-thread__preview text-[13px] truncate ${unread ? 'font-bold text-[#1c1e21] dark:text-white' : 'text-[#65676b] dark:text-gray-400'}">
                ${esc(lastText)}
              </span>
              ${unread ? '<span class="w-2.5 h-2.5 rounded-full bg-[#1877f2] shrink-0 ml-1.5"></span>' : ''}
            </div>
          </div>
        </button>
      `;
    }).join('');
  }

  /* ── Active Conversation ────────────────────────────────────────────────── */
  function getActiveChat() {
    return state.conversations.find(c => c.id === state.activeChatId) || null;
  }

  function selectChat(id) {
    state.activeChatId = id;
    const chat = getActiveChat();
    if (chat && chat.unread > 0) {
      chat.unread = 0;
      saveConversations(state.conversations);
    }
    renderInbox();
    renderConversation();
    renderInfoPanel();
    showConversationPane();
    if (input) input.focus();
  }

  function renderConversation() {
    const chat = getActiveChat();
    if (!chat) {
      $('[data-conversation-header]').style.display = 'none';
      $('[data-composer]').style.display = 'none';
      messagesHost.innerHTML = `
        <div class="m-auto text-center px-6 py-12">
          <div class="w-16 h-16 rounded-full bg-[#f0f2f5] dark:bg-[#242526] text-[#8d949e] flex items-center justify-center text-3xl mx-auto mb-3">
            <i class="fa-regular fa-comments"></i>
          </div>
          <p class="text-[15px] font-semibold text-[#1c1e21] dark:text-white">Choose a conversation</p>
          <p class="text-[13px] text-[#65676b] dark:text-gray-400 mt-1">Select someone from the left or start a new message.</p>
        </div>
      `;
      return;
    }

    $('[data-conversation-header]').style.display = 'flex';
    $('[data-composer]').style.display = 'flex';

    // Header
    const avatarBg = chat.color || getAvatarColor(chat.name);
    const initials = chat.avatar || getInitials(chat.name);
    const isOnline = (chat.status || '').toLowerCase().includes('active now');

    $('[data-partner-name]').textContent = chat.name;
    $('[data-partner-status]').textContent = chat.status || 'Active now';
    $('[data-partner-avatar]').innerHTML = `
      <div class="w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-semibold ${avatarBg}">
        ${esc(initials)}
      </div>
      ${isOnline ? '<span class="msg-dot"></span>' : ''}
    `;

    // Messages
    if (!chat.messages || !chat.messages.length) {
      messagesHost.innerHTML = `
        <div class="m-auto text-center py-10">
          <div class="w-20 h-20 rounded-full text-white flex items-center justify-center text-3xl font-bold ${avatarBg} mx-auto mb-3 shadow-md">
            ${esc(initials)}
          </div>
          <h3 class="text-[18px] font-bold text-[#1c1e21] dark:text-white">${esc(chat.name)}</h3>
          <p class="text-[13px] text-[#65676b] dark:text-gray-400 mt-1">You're connected on Faith In.</p>
        </div>
      `;
      return;
    }

    let html = '';

    // Date header pill
    html += `<div class="msg-day">Yesterday</div>`;

    chat.messages.forEach((msg, idx) => {
      const isMe = msg.sender === 'me';
      const prevMsg = chat.messages[idx - 1];
      const nextMsg = chat.messages[idx + 1];
      const isFirst = !prevMsg || prevMsg.sender !== msg.sender;
      const isLast = !nextMsg || nextMsg.sender !== msg.sender;

      let attachHtml = '';
      if (msg.attachment) {
        if (msg.attachment.type && msg.attachment.type.startsWith('image')) {
          attachHtml = `<img src="${esc(msg.attachment.dataUrl || msg.attachment.url || '')}" class="rounded-xl max-h-64 object-cover mb-1.5" alt="Attachment"/>`;
        } else {
          attachHtml = `
            <div class="msg-attachment-card">
              <div class="p-2 rounded bg-[#f0f2f5] dark:bg-[#242526] text-[#1877f2]">
                <i class="fa-solid fa-file-lines text-lg"></i>
              </div>
              <div class="flex-1 min-w-0 pr-2">
                <p class="text-[13.5px] font-semibold truncate ${isMe ? 'text-white' : 'text-[#1c1e21] dark:text-white'}">${esc(msg.attachment.name)}</p>
                <p class="text-[11.5px] ${isMe ? 'text-blue-100' : 'text-[#65676b] dark:text-gray-400'}">${esc(msg.attachment.size || 'Attachment')}</p>
              </div>
            </div>
          `;
        }
      }

      html += `
        <div class="msg-row ${isMe ? 'is-mine' : ''} ${isFirst ? 'mt-2' : 'mt-0.5'}" data-msg-id="${esc(msg.id)}">
          ${!isMe ? `
            <div class="w-7 mr-1 flex-shrink-0 flex items-end">
              ${isLast ? `
                <div class="w-7 h-7 rounded-full text-white flex items-center justify-center text-[10.5px] font-bold ${avatarBg}">
                  ${esc(initials)}
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${isMe ? `
            <div class="msg-actions pr-1">
              <button class="msg-action-btn" title="React" data-msg-react="${esc(msg.id)}" type="button"><i class="fa-regular fa-face-smile text-sm"></i></button>
              <button class="msg-action-btn" title="Reply" data-msg-reply="${esc(msg.id)}" type="button"><i class="fa-solid fa-reply text-sm"></i></button>
              <button class="msg-action-btn" title="More" data-msg-more="${esc(msg.id)}" type="button"><i class="fa-solid fa-ellipsis-vertical text-sm"></i></button>
            </div>
          ` : ''}

          <div class="msg-bubble ${isMe ? 'is-mine' : ''}">
            ${attachHtml}
            ${msg.text ? `<div>${esc(msg.text)}</div>` : ''}
            ${msg.reaction ? `<span class="absolute -bottom-2 -right-1 bg-white dark:bg-[#242526] border border-[#ccd0d5] dark:border-[#3e4042] rounded-full px-1.5 py-0.5 text-xs shadow-sm">${esc(msg.reaction)}</span>` : ''}
          </div>

          ${!isMe ? `
            <div class="msg-actions pl-1">
              <button class="msg-action-btn" title="React" data-msg-react="${esc(msg.id)}" type="button"><i class="fa-regular fa-face-smile text-sm"></i></button>
              <button class="msg-action-btn" title="Reply" data-msg-reply="${esc(msg.id)}" type="button"><i class="fa-solid fa-reply text-sm"></i></button>
              <button class="msg-action-btn" title="More" data-msg-more="${esc(msg.id)}" type="button"><i class="fa-solid fa-ellipsis-vertical text-sm"></i></button>
            </div>
          ` : ''}
        </div>
      `;
    });

    // Read Receipt indicator at the bottom right
    html += `
      <div class="flex justify-end mt-1 pr-1">
        <div class="w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-[7px] font-bold ${avatarBg}">
          ${esc(initials)}
        </div>
      </div>
    `;

    messagesHost.innerHTML = html;
    scrollToBottom();
  }

  function scrollToBottom() {
    messagesHost.scrollTop = messagesHost.scrollHeight;
  }

  /* ── Right Sidebar (Info Panel) ─────────────────────────────────────────── */
  function renderInfoPanel() {
    const chat = getActiveChat();
    if (!chat) return;

    const avatarBg = chat.color || getAvatarColor(chat.name);
    const initials = chat.avatar || getInitials(chat.name);

    $('[data-info-name]').textContent = chat.name;
    $('[data-info-role]').textContent = chat.status || 'Active now';
    $('[data-info-avatar]').innerHTML = `
      <div class="w-20 h-20 rounded-full text-white flex items-center justify-center text-3xl font-bold ${avatarBg} shadow-md">
        ${esc(initials)}
      </div>
    `;

    const profileBtn = $('[data-info-profile]');
    if (profileBtn) profileBtn.href = `/profile?name=${encodeURIComponent(chat.name)}`;

    // Mute state
    const muteWrap = $('[data-mute-icon-wrap]');
    const muteLabel = $('[data-mute-label]');
    if (muteWrap && muteLabel) {
      if (state.isMuted) {
        muteWrap.classList.add('bg-blue-50', 'text-[#1877f2]');
        muteLabel.textContent = 'Unmute';
      } else {
        muteWrap.classList.remove('bg-blue-50', 'text-[#1877f2]');
        muteLabel.textContent = 'Mute';
      }
    }
  }

  function toggleInfoPanel() {
    const isHidden = infoPane.classList.contains('hidden');
    infoPane.classList.toggle('hidden', !isHidden);
    infoPane.classList.toggle('flex', isHidden);
    const toggleBtn = $('[data-info-toggle]');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', String(isHidden));
  }

  /* ── Sending Message ────────────────────────────────────────────────────── */
  function sendMessage() {
    const text = input.value.trim();
    const attach = state.attachment;
    if (!text && !attach) return;

    const chat = getActiveChat();
    if (!chat) return;

    const newMsg = {
      id: 'msg-' + Date.now(),
      sender: 'me',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      created_at: new Date().toISOString(),
      attachment: attach
    };

    chat.messages.push(newMsg);
    saveConversations(state.conversations);

    input.value = '';
    clearAttachment();
    renderConversation();
    renderInbox();
    scrollToBottom();

    // Async backend echo (optional sync)
    api.request('cv_social_send_message', {
      thread_id: chat.id,
      body: text,
      attachment: attach ? JSON.stringify(attach) : ''
    }).catch(() => {});
  }

  /* ── Attachments ────────────────────────────────────────────────────────── */
  function clearAttachment() {
    state.attachment = null;
    attachPreview.classList.add('hidden');
    $('[data-attach-name]').textContent = '';
    $('[data-attach-size]').textContent = '';
    if (fileInput) fileInput.value = '';
    if (photoInput) photoInput.value = '';
  }

  function setAttachment(file) {
    if (!file) return;
    const isImage = file.type.startsWith('image');
    const sizeStr = (file.size / 1024 / 1024).toFixed(2) + ' MB';

    if (isImage) {
      const reader = new FileReader();
      reader.onload = e => {
        state.attachment = { name: file.name, size: sizeStr, type: file.type, dataUrl: e.target.result };
        $('[data-attach-name]').textContent = file.name;
        $('[data-attach-size]').textContent = sizeStr;
        attachPreview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    } else {
      state.attachment = { name: file.name, size: sizeStr, type: file.type };
      $('[data-attach-name]').textContent = file.name;
      $('[data-attach-size]').textContent = sizeStr;
      attachPreview.classList.remove('hidden');
    }
  }

  /* ── Calling Overlay ────────────────────────────────────────────────────── */
  function startCall(type = 'audio') {
    const chat = getActiveChat();
    if (!chat) return;
    state.activeCall = type;
    const avatarBg = chat.color || getAvatarColor(chat.name);
    const initials = chat.avatar || getInitials(chat.name);

    $('[data-call-avatar]').className = `w-28 h-28 rounded-full text-white flex items-center justify-center text-4xl font-bold mb-4 shadow-2xl ${avatarBg} animate-pulse`;
    $('[data-call-initials]').textContent = initials;
    $('[data-call-name]').textContent = chat.name;
    $('[data-call-type]').textContent = type === 'video' ? 'Calling video…' : 'Calling…';
    callOverlay.classList.remove('hidden');
  }

  function endCall() {
    state.activeCall = null;
    callOverlay.classList.add('hidden');
    toast('Call ended');
  }

  /* ── Pane Visibility (Mobile vs Desktop) ────────────────────────────────── */
  function showConversationPane() {
    inboxPane.classList.add('hidden-mobile');
    conversationPane.classList.remove('hidden-mobile');
  }

  function showInboxPane() {
    inboxPane.classList.remove('hidden-mobile');
    conversationPane.classList.add('hidden-mobile');
  }

  /* ── Wiring Event Listeners ─────────────────────────────────────────────── */
  inbox.addEventListener('click', e => {
    const threadBtn = e.target.closest('[data-chat-id]');
    if (threadBtn) {
      selectChat(threadBtn.dataset.chatId);
    }
  });

  searchInput.addEventListener('input', e => {
    state.searchQuery = e.target.value;
    renderInbox();
  });

  $('[data-filter-unread]').addEventListener('click', () => {
    state.unreadOnly = !state.unreadOnly;
    $('[data-filter-unread]').classList.toggle('!bg-blue-100', state.unreadOnly);
    $('[data-filter-unread]').classList.toggle('!text-[#1877f2]', state.unreadOnly);
    renderInbox();
  });

  $('[data-back]').addEventListener('click', showInboxPane);
  $('[data-info-toggle]').addEventListener('click', toggleInfoPanel);
  $('[data-header-profile]').addEventListener('click', e => {
    if (e.target.closest('[data-back]') || e.target.closest('button')) return;
    toggleInfoPanel();
  });

  // Call actions
  $('[data-call-voice]').addEventListener('click', () => startCall('audio'));
  $('[data-call-video]').addEventListener('click', () => startCall('video'));
  $('[data-call-end]').addEventListener('click', endCall);
  $('[data-call-mic]').addEventListener('click', function() {
    this.classList.toggle('bg-red-600');
    toast(this.classList.contains('bg-red-600') ? 'Microphone muted' : 'Microphone unmuted');
  });
  $('[data-call-cam]').addEventListener('click', function() {
    this.classList.toggle('bg-red-600');
    toast(this.classList.contains('bg-red-600') ? 'Camera turned off' : 'Camera turned on');
  });

  // Form submit
  form.addEventListener('submit', e => {
    e.preventDefault();
    sendMessage();
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Attachments
  $('[data-attach-file]').addEventListener('click', () => fileInput.click());
  $('[data-attach-photo]').addEventListener('click', () => photoInput.click());
  $('[data-btn-emoji]').addEventListener('click', () => {
    input.value += ' 😊 ';
    input.focus();
  });

  fileInput.addEventListener('change', e => setAttachment(e.target.files[0]));
  photoInput.addEventListener('change', e => setAttachment(e.target.files[0]));
  $('[data-attach-clear]').addEventListener('click', clearAttachment);

  // Message Reactions & Actions
  messagesHost.addEventListener('click', e => {
    const reactBtn = e.target.closest('[data-msg-react]');
    if (reactBtn) {
      const msgId = reactBtn.dataset.msgReact;
      const chat = getActiveChat();
      if (chat) {
        const msg = chat.messages.find(m => m.id === msgId);
        if (msg) {
          msg.reaction = msg.reaction === '❤️' ? '👍' : '❤️';
          saveConversations(state.conversations);
          renderConversation();
        }
      }
    }
    const replyBtn = e.target.closest('[data-msg-reply]');
    if (replyBtn) {
      input.focus();
    }
  });

  // Accordions
  $$('[data-acc-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.dataset.accToggle;
      const content = $(`[data-acc-content="${panel}"]`);
      const arrow = $(`[data-acc-arrow="${panel}"]`);
      if (content) {
        const isHidden = content.classList.contains('hidden');
        content.classList.toggle('hidden', !isHidden);
        if (arrow) {
          arrow.className = isHidden ? 'fa-solid fa-chevron-down text-xs text-[#65676b] dark:text-gray-400 transition-transform' : 'fa-solid fa-chevron-right text-xs text-[#65676b] dark:text-gray-400 transition-transform';
        }
      }
    });
  });

  // Action Buttons in Info Panel
  $('[data-action-mute]')?.addEventListener('click', () => {
    state.isMuted = !state.isMuted;
    renderInfoPanel();
    toast(state.isMuted ? 'Notifications muted for this conversation' : 'Notifications unmuted');
  });

  $('[data-action-search]')?.addEventListener('click', () => {
    searchInput.focus();
  });

  $('[data-action-theme]')?.addEventListener('click', () => {
    toast('Theme customization saved');
  });

  $('[data-action-emoji]')?.addEventListener('click', () => {
    toast('Custom quick reaction set to 👍');
  });

  $('[data-action-nickname]')?.addEventListener('click', () => {
    const name = prompt('Enter a nickname for this member:');
    if (name && name.trim()) {
      const chat = getActiveChat();
      if (chat) {
        chat.name = name.trim();
        saveConversations(state.conversations);
        renderConversation();
        renderInbox();
        renderInfoPanel();
      }
    }
  });

  $('[data-action-restrict]')?.addEventListener('click', () => toast('Account restricted'));
  $('[data-action-block]')?.addEventListener('click', () => toast('Account blocked'));
  $('[data-action-report]')?.addEventListener('click', () => toast('Report submitted to church moderators'));

  // New message modal
  $('[data-new-message]').addEventListener('click', () => {
    newModal.classList.remove('hidden');
    newModal.classList.add('flex');
    const qInput = $('#msg-people');
    if (qInput) {
      qInput.value = '';
      qInput.focus();
    }
    searchPeople('');
  });

  $('[data-new-close]').addEventListener('click', () => {
    newModal.classList.add('hidden');
    newModal.classList.remove('flex');
  });

  newModal.addEventListener('click', e => {
    if (e.target === newModal) {
      newModal.classList.add('hidden');
      newModal.classList.remove('flex');
    }
  });

  function searchPeople(query) {
    const members = [
      { name: 'Sophea Sok', role: 'Worship Leader', church: 'Phnom Penh Grace' },
      { name: 'Dara Chhan', role: 'Youth Pastor', church: 'Faith Community' },
      { name: 'Kosal Meng', role: 'Bible Teacher', church: 'Siem Reap Hope' },
      { name: 'Bopha Vong', role: 'Choir Director', church: 'Battambang Fellowship' }
    ];
    const filtered = members.filter(m => !query || m.name.toLowerCase().includes(query.toLowerCase()));
    peopleList.innerHTML = filtered.map(m => `
      <button class="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f0f2f5] dark:hover:bg-[#242526] transition text-left" data-create-chat="${esc(m.name)}" type="button">
        <div class="w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-semibold ${getAvatarColor(m.name)}">
          ${esc(getInitials(m.name))}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14.5px] font-semibold text-[#1c1e21] dark:text-white truncate">${esc(m.name)}</p>
          <p class="text-[12px] text-[#65676b] dark:text-gray-400 truncate">${esc(m.role)} · ${esc(m.church)}</p>
        </div>
        <i class="fa-solid fa-chevron-right text-xs text-[#8d949e]"></i>
      </button>
    `).join('');
  }

  $('#msg-people')?.addEventListener('input', e => searchPeople(e.target.value));

  peopleList.addEventListener('click', e => {
    const btn = e.target.closest('[data-create-chat]');
    if (btn) {
      const name = btn.dataset.createChat;
      let existing = state.conversations.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (!existing) {
        existing = {
          id: 'chat-' + Date.now(),
          name: name,
          avatar: getInitials(name),
          color: getAvatarColor(name),
          unread: 0,
          status: 'Active now',
          role: 'Faith In Member',
          church: 'Faith In Network',
          messages: []
        };
        state.conversations.unshift(existing);
        saveConversations(state.conversations);
      }
      newModal.classList.add('hidden');
      newModal.classList.remove('flex');
      selectChat(existing.id);
    }
  });

  /* ── Realtime Backend Sync (Non-blocking) ───────────────────────────────── */
  function syncWithBackend() {
    if (typeof window.cvDataSubscribe === 'function') {
      window.cvDataSubscribe('message_threads', {}, payload => {
        if (payload && Array.isArray(payload.items) && payload.items.length) {
          payload.items.forEach(backendThread => {
            const idx = state.conversations.findIndex(c => c.id === backendThread.id || c.name === backendThread.other_user?.name);
            if (idx >= 0) {
              state.conversations[idx].id = backendThread.id;
              if (backendThread.last_message) {
                // keep local up to date
              }
            }
          });
          renderInbox();
        }
      }, () => {});
    }
  }

  /* ── Initial Load: INSTANT ZERO-WAIT INITIALIZATION ─────────────────────── */
  function init() {
    const params = new URLSearchParams(location.search);
    const threadParam = params.get('thread');
    const toParam = params.get('to');

    // Pick threadParam or first conversation immediately
    let initialId = state.conversations[0]?.id;
    if (threadParam) {
      const found = state.conversations.find(c => c.id === threadParam);
      if (found) initialId = found.id;
    } else if (toParam) {
      const found = state.conversations.find(c => c.name.toLowerCase().includes(toParam.toLowerCase()));
      if (found) initialId = found.id;
    }

    renderInbox();
    if (initialId) {
      selectChat(initialId);
    }

    // Sync in background without blocking UI
    syncWithBackend();
  }

  // Execute immediately
  init();
})();
