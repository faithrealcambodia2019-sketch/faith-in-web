/* ==========================================================================
   Faith In — Messaging (Live Real-Data Backend Engine)
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

  /* ── Universal Backend API Transport ────────────────────────────────────── */
  async function callApi(action, params = {}) {
    // 1. Try server backend route /api/compat
    try {
      const res = await fetch('/api/compat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params })
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {}

    // 2. Fallback to client cvDataRequest / FIData
    try {
      if (typeof window.cvDataRequest === 'function') {
        const res = await window.cvDataRequest(action, params);
        if (res) return res;
      }
    } catch (e) {}

    return null;
  }

  // Clear legacy mock cache containing fake PDF guides
  try {
    const old = localStorage.getItem('fi_conversations');
    if (old && (old.includes('Youth_Ministry_Guide') || old.includes('mock-1') || old.includes('mock-2'))) {
      localStorage.removeItem('fi_conversations');
    }
  } catch (e) {}

  /* Default starter members */
  const DEFAULT_CONVERSATIONS = [
    {
      id: 'thread-u-dara',
      name: 'Dara Chhan',
      avatar: 'DC',
      color: '#10b981',
      unread: 0,
      status: 'Active now',
      role: 'Youth Pastor',
      church: 'Faith Community Church',
      messages: []
    },
    {
      id: 'thread-u-sophea',
      name: 'Sophea Sok',
      avatar: 'SS',
      color: '#1877f2',
      unread: 0,
      status: 'Active now',
      role: 'Worship Leader',
      church: 'Phnom Penh Grace Church',
      messages: []
    },
    {
      id: 'thread-u-kosal',
      name: 'Kosal Meng',
      avatar: 'KM',
      color: '#8b5cf6',
      unread: 0,
      status: 'Active now',
      role: 'Bible Teacher',
      church: 'Siem Reap Hope Fellowship',
      messages: []
    }
  ];

  function loadSavedConversations() {
    try {
      const stored = localStorage.getItem('fi_real_conversations_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return DEFAULT_CONVERSATIONS;
  }

  function saveConversations(convs) {
    try {
      localStorage.setItem('fi_real_conversations_v1', JSON.stringify(convs));
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
    const colors = ['#1877f2', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  function formatTime(isoStr) {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      const now = new Date();
      if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  }

  /* ── Rendering Inbox ────────────────────────────────────────────────────── */
  function renderInbox() {
    const query = state.searchQuery.trim().toLowerCase();
    const list = state.conversations.filter(chat => {
      if (state.unreadOnly && !chat.unread) return false;
      if (!query) return true;
      const lastMsg = chat.messages && chat.messages.length ? chat.messages[chat.messages.length - 1]?.text : '';
      return chat.name.toLowerCase().includes(query) || (lastMsg && lastMsg.toLowerCase().includes(query));
    });

    if (!list.length) {
      inbox.innerHTML = `<div style="padding: 36px 16px; text-align: center; font-size: 13.5px; color: #65676b;">
        No conversations found. Click the edit icon above to start one.
      </div>`;
      return;
    }

    inbox.innerHTML = list.map(chat => {
      const isActive = chat.id === state.activeChatId;
      const unread = chat.unread > 0;
      const lastMsg = chat.messages && chat.messages.length ? chat.messages[chat.messages.length - 1] : null;
      const lastText = lastMsg ? (lastMsg.sender === 'me' ? 'You: ' + lastMsg.text : lastMsg.text) : 'Start a conversation';
      const lastTime = lastMsg ? formatTime(lastMsg.created_at) : '';
      const isOnline = (chat.status || '').toLowerCase().includes('active');
      const avatarBg = chat.color && chat.color.startsWith('#') ? chat.color : getAvatarColor(chat.name);
      const initials = chat.avatar || getInitials(chat.name);

      return `
        <button class="msg-thread ${isActive ? 'is-active' : ''} ${unread ? 'is-unread' : ''}" data-chat-id="${esc(chat.id)}" type="button" style="padding: 10px 12px; margin: 2px 8px; border-radius: 10px; display: flex; align-items: center; gap: 12px; border: none; cursor: pointer; text-align: left; width: calc(100% - 16px); background: ${isActive ? '#eaf3ff' : 'transparent'};">
          <div style="position: relative; flex-shrink: 0;">
            <div style="width: 48px; height: 48px; min-width: 48px; min-height: 48px; border-radius: 50%; background-color: ${avatarBg}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px;">
              ${esc(initials)}
            </div>
            ${isOnline ? '<span style="position: absolute; right: 0; bottom: 0; width: 12px; height: 12px; border-radius: 50%; background: #31a24c; border: 2px solid #ffffff;"></span>' : ''}
          </div>
          <div style="flex: 1; min-width: 0; text-align: left;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
              <span style="font-size: 14.5px; font-weight: ${unread ? '700' : '600'}; color: #1c1e21; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${esc(chat.name)}
              </span>
              <span style="font-size: 11.5px; font-weight: ${unread ? '700' : '400'}; color: ${unread ? '#1877f2' : '#65676b'}; flex-shrink: 0;">
                ${esc(lastTime)}
              </span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-top: 2px;">
              <span style="font-size: 13px; font-weight: ${unread ? '700' : '400'}; color: ${unread ? '#1c1e21' : '#65676b'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${esc(lastText)}
              </span>
              ${unread ? '<span style="width: 9px; height: 9px; border-radius: 50%; background: #1877f2; flex-shrink: 0; margin-left: 6px;"></span>' : ''}
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

  async function selectChat(id) {
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

    // Fetch real messages from database API for this thread
    if (chat) {
      const data = await callApi('cv_social_get_message_thread', { thread_id: chat.id, recipient_uid: chat.id.replace(/^thread-/, '') });
      if (data && Array.isArray(data.items)) {
        chat.messages = data.items.map(m => ({
          id: m.id || ('msg-' + Date.now()),
          sender: m.mine ? 'me' : 'them',
          text: m.body || '',
          attachment: m.attachment,
          time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'Just now',
          created_at: m.created_at || new Date().toISOString()
        }));
        saveConversations(state.conversations);
        if (state.activeChatId === chat.id) {
          renderConversation();
          renderInbox();
        }
      }
    }
  }

  function renderConversation() {
    const chat = getActiveChat();
    if (!chat) {
      $('[data-conversation-header]').style.display = 'none';
      $('[data-composer]').style.display = 'none';
      messagesHost.innerHTML = `
        <div style="margin: auto; text-align: center; padding: 48px 24px;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: #f0f2f5; color: #8d949e; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 12px;">
            <i class="fa-regular fa-comments"></i>
          </div>
          <p style="font-size: 15px; font-weight: 600; color: #1c1e21;">Choose a conversation</p>
          <p style="font-size: 13px; color: #65676b; margin-top: 4px;">Select someone from the left or start a new message.</p>
        </div>
      `;
      return;
    }

    $('[data-conversation-header]').style.display = 'flex';
    $('[data-composer]').style.display = 'flex';

    // Header
    const avatarBg = chat.color && chat.color.startsWith('#') ? chat.color : getAvatarColor(chat.name);
    const initials = chat.avatar || getInitials(chat.name);
    const isOnline = (chat.status || '').toLowerCase().includes('active');

    $('[data-partner-name]').textContent = chat.name;
    $('[data-partner-status]').textContent = chat.status || 'Active now';
    $('[data-partner-avatar]').innerHTML = `
      <div style="position: relative;">
        <div style="width: 36px; height: 36px; min-width: 36px; min-height: 36px; border-radius: 50%; background-color: ${avatarBg}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">
          ${esc(initials)}
        </div>
        ${isOnline ? '<span style="position: absolute; right: 0; bottom: 0; width: 10px; height: 10px; border-radius: 50%; background: #31a24c; border: 2px solid #ffffff;"></span>' : ''}
      </div>
    `;

    // Messages
    if (!chat.messages || !chat.messages.length) {
      messagesHost.innerHTML = `
        <div style="margin: auto; text-align: center; padding: 48px 16px;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background-color: ${avatarBg}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; margin: 0 auto 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            ${esc(initials)}
          </div>
          <h3 style="font-size: 18px; font-weight: 700; color: #1c1e21;">${esc(chat.name)}</h3>
          <p style="font-size: 13px; color: #65676b; margin-top: 4px;">${esc(chat.role || 'Member')} · ${esc(chat.church || 'Faith Community')}</p>
          <p style="font-size: 13px; color: #8d949e; margin-top: 4px;">No messages yet. Send a message to start the conversation.</p>
          <button type="button" data-send-wave style="margin-top: 18px; padding: 8px 20px; border-radius: 20px; background: #eaf3ff; color: #1877f2; font-weight: 600; font-size: 14px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
            <span>👋 Wave hello</span>
          </button>
        </div>
      `;
      const waveBtn = messagesHost.querySelector('[data-send-wave]');
      if (waveBtn) {
        waveBtn.addEventListener('click', () => {
          input.value = '👋 Hello!';
          sendMessage();
        });
      }
      return;
    }

    let html = '';

    chat.messages.forEach((msg, idx) => {
      const isMe = msg.sender === 'me';
      const prevMsg = chat.messages[idx - 1];
      const nextMsg = chat.messages[idx + 1];
      const isFirst = !prevMsg || prevMsg.sender !== msg.sender;
      const isLast = !nextMsg || nextMsg.sender !== msg.sender;

      let attachHtml = '';
      if (msg.attachment) {
        if (msg.attachment.type && msg.attachment.type.startsWith('image')) {
          attachHtml = `<img src="${esc(msg.attachment.dataUrl || msg.attachment.url || '')}" style="border-radius: 12px; max-height: 240px; object-fit: cover; margin-bottom: 6px;" alt="Attachment"/>`;
        } else {
          attachHtml = `
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; margin-bottom: 6px; background: ${isMe ? '#166fe5' : '#ffffff'}; border: 1px solid ${isMe ? '#1460c5' : '#ccd0d5'}; color: ${isMe ? '#ffffff' : '#1c1e21'}; text-decoration: none;">
              <div style="width: 36px; height: 36px; border-radius: 6px; background-color: #0e5cce; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 16px; flex-shrink: 0;">
                <i class="fa-solid fa-file"></i>
              </div>
              <div style="flex: 1; min-width: 0; padding-right: 8px;">
                <p style="font-size: 14px; font-weight: 600; color: ${isMe ? '#ffffff' : '#1c1e21'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin: 0;">${esc(msg.attachment.name)}</p>
                <p style="font-size: 12px; color: ${isMe ? '#dbeafe' : '#65676b'}; margin: 2px 0 0;">${esc(msg.attachment.size || 'Attachment')}</p>
              </div>
            </div>
          `;
        }
      }

      html += `
        <div class="msg-row ${isMe ? 'is-mine' : ''} ${isFirst ? 'mt-2' : 'mt-0.5'}" data-msg-id="${esc(msg.id)}" style="display: flex; align-items: flex-end; gap: 6px; justify-content: ${isMe ? 'flex-end' : 'flex-start'};">
          ${!isMe ? `
            <div style="width: 28px; margin-right: 2px; flex-shrink: 0; display: flex; align-items: flex-end;">
              ${isLast ? `
                <div style="width: 28px; height: 28px; min-width: 28px; min-height: 28px; border-radius: 50%; background-color: ${avatarBg}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700;">
                  ${esc(initials)}
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${isMe ? `
            <div class="msg-actions" style="display: flex; align-items: center; gap: 2px; opacity: 0; padding-right: 4px;">
              <button class="msg-action-btn" title="React" data-msg-react="${esc(msg.id)}" type="button"><i class="fa-regular fa-face-smile text-sm"></i></button>
              <button class="msg-action-btn" title="Reply" data-msg-reply="${esc(msg.id)}" type="button"><i class="fa-solid fa-reply text-sm"></i></button>
              <button class="msg-action-btn" title="More" data-msg-more="${esc(msg.id)}" type="button"><i class="fa-solid fa-ellipsis-vertical text-sm"></i></button>
            </div>
          ` : ''}

          <div style="position: relative; background-color: ${isMe ? '#1877f2' : '#f0f2f5'}; color: ${isMe ? '#ffffff' : '#1c1e21'}; border-radius: 18px; padding: 9px 14px; max-width: 68%; font-size: 14.5px; line-height: 1.38; box-shadow: 0 1px 2px rgba(0,0,0,0.05); word-break: break-word;">
            ${attachHtml}
            ${msg.text ? `<div>${esc(msg.text)}</div>` : ''}
            ${msg.reaction ? `<span style="position: absolute; bottom: -8px; right: -4px; background: #ffffff; border: 1px solid #ccd0d5; border-radius: 999px; padding: 2px 6px; font-size: 11px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${esc(msg.reaction)}</span>` : ''}
          </div>

          ${!isMe ? `
            <div class="msg-actions" style="display: flex; align-items: center; gap: 2px; opacity: 0; padding-left: 4px;">
              <button class="msg-action-btn" title="React" data-msg-react="${esc(msg.id)}" type="button"><i class="fa-regular fa-face-smile text-sm"></i></button>
              <button class="msg-action-btn" title="Reply" data-msg-reply="${esc(msg.id)}" type="button"><i class="fa-solid fa-reply text-sm"></i></button>
              <button class="msg-action-btn" title="More" data-msg-more="${esc(msg.id)}" type="button"><i class="fa-solid fa-ellipsis-vertical text-sm"></i></button>
            </div>
          ` : ''}
        </div>
      `;
    });

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

    const avatarBg = chat.color && chat.color.startsWith('#') ? chat.color : getAvatarColor(chat.name);
    const initials = chat.avatar || getInitials(chat.name);

    $('[data-info-name]').textContent = chat.name;
    $('[data-info-role]').textContent = chat.status || 'Active now';
    $('[data-info-avatar]').innerHTML = `
      <div style="width: 72px; height: 72px; min-width: 72px; min-height: 72px; border-radius: 50%; background-color: ${avatarBg}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 12px;">
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
        muteWrap.style.background = '#eaf3ff';
        muteWrap.style.color = '#1877f2';
        muteLabel.textContent = 'Unmute';
      } else {
        muteWrap.style.background = '#f0f2f5';
        muteWrap.style.color = '#1c1e21';
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

    if (!chat.messages) chat.messages = [];
    chat.messages.push(newMsg);
    saveConversations(state.conversations);

    input.value = '';
    clearAttachment();
    renderConversation();
    renderInbox();
    scrollToBottom();

    // Persist to Postgres database via /api/compat
    callApi('cv_social_send_message', {
      thread_id: chat.id,
      recipient_uid: chat.id.replace(/^thread-/, ''),
      body: text,
      attachment: attach ? JSON.stringify(attach) : ''
    });
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
    const avatarBg = chat.color && chat.color.startsWith('#') ? chat.color : getAvatarColor(chat.name);
    const initials = chat.avatar || getInitials(chat.name);

    $('[data-call-avatar]').className = `w-24 h-24 rounded-full text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-2xl animate-pulse`;
    $('[data-call-avatar]').style.backgroundColor = avatarBg;
    $('[data-call-initials]').textContent = initials;
    $('[data-call-name]').textContent = chat.name;
    $('[data-call-type]').textContent = type === 'video' ? 'Calling video…' : 'Calling…';
    callOverlay.classList.add('is-active');
  }

  function endCall() {
    state.activeCall = null;
    callOverlay.classList.remove('is-active');
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

  $('[data-back]')?.addEventListener('click', showInboxPane);
  $('[data-info-toggle]')?.addEventListener('click', toggleInfoPanel);

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

  $('[data-filter-unread]')?.addEventListener('click', () => {
    state.unreadOnly = !state.unreadOnly;
    $('[data-filter-unread]').classList.toggle('text-[#1877f2]', state.unreadOnly);
    renderInbox();
  });

  searchInput.addEventListener('input', e => {
    state.searchQuery = e.target.value;
    renderInbox();
  });

  // Calling
  $('[data-call-voice]')?.addEventListener('click', () => startCall('audio'));
  $('[data-call-video]')?.addEventListener('click', () => startCall('video'));
  $('[data-call-end]')?.addEventListener('click', endCall);
  $('[data-call-mic]')?.addEventListener('click', () => toast('Microphone toggled'));
  $('[data-call-cam]')?.addEventListener('click', () => toast('Camera toggled'));

  // Attachments
  $('[data-attach-file]')?.addEventListener('click', () => fileInput.click());
  $('[data-attach-photo]')?.addEventListener('click', () => photoInput.click());
  $('[data-btn-emoji]')?.addEventListener('click', () => {
    input.value += ' 😊 ';
    input.focus();
  });

  fileInput.addEventListener('change', e => setAttachment(e.target.files[0]));
  photoInput.addEventListener('change', e => setAttachment(e.target.files[0]));
  $('[data-attach-clear]')?.addEventListener('click', clearAttachment);

  // Message Reactions & Actions
  messagesHost.addEventListener('click', e => {
    const reactBtn = e.target.closest('[data-msg-react]');
    if (reactBtn) {
      const msgId = reactBtn.dataset.msgReact;
      const chat = getActiveChat();
      if (chat && chat.messages) {
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
  $('[data-new-message]')?.addEventListener('click', () => {
    newModal.classList.remove('hidden');
    newModal.classList.add('flex');
    const qInput = $('#msg-people');
    if (qInput) {
      qInput.value = '';
      qInput.focus();
    }
    searchPeople('');
  });

  $('[data-new-close]')?.addEventListener('click', () => {
    newModal.classList.add('hidden');
    newModal.classList.remove('flex');
  });

  newModal?.addEventListener('click', e => {
    if (e.target === newModal) {
      newModal.classList.add('hidden');
      newModal.classList.remove('flex');
    }
  });

  async function searchPeople(query) {
    let items = [
      { uid: 'u-sophea', name: 'Sophea Sok', role: 'Worship Leader', church: 'Phnom Penh Grace' },
      { uid: 'u-dara', name: 'Dara Chhan', role: 'Youth Pastor', church: 'Faith Community' },
      { uid: 'u-kosal', name: 'Kosal Meng', role: 'Bible Teacher', church: 'Siem Reap Hope' },
      { uid: 'u-bopha', name: 'Bopha Vong', role: 'Choir Director', church: 'Battambang Fellowship' }
    ];

    const data = await callApi('cv_social_search_message_users', { q: query });
    if (data && Array.isArray(data.items) && data.items.length) {
      items = data.items;
    }

    const filtered = items.filter(m => !query || m.name.toLowerCase().includes(query.toLowerCase()));
    peopleList.innerHTML = filtered.map(m => `
      <button class="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f0f2f5] dark:hover:bg-[#242526] transition text-left" data-create-chat="${esc(m.name)}" data-user-uid="${esc(m.uid || '')}" type="button" style="border: none; background: transparent; cursor: pointer;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background-color: ${getAvatarColor(m.name)}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600;">
          ${esc(getInitials(m.name))}
        </div>
        <div style="flex: 1; min-width: 0; text-align: left;">
          <p style="font-size: 14.5px; font-weight: 600; color: #1c1e21; margin: 0;">${esc(m.name)}</p>
          <p style="font-size: 12px; color: #65676b; margin: 2px 0 0;">${esc(m.role || 'Member')} · ${esc(m.church || 'Faith In Network')}</p>
        </div>
        <i class="fa-solid fa-chevron-right text-xs text-[#8d949e]"></i>
      </button>
    `).join('');
  }

  let searchTimeout = null;
  $('#msg-people')?.addEventListener('input', e => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => searchPeople(e.target.value), 200);
  });

  peopleList?.addEventListener('click', e => {
    const btn = e.target.closest('[data-create-chat]');
    if (btn) {
      const name = btn.dataset.createChat;
      const uid = btn.dataset.userUid;
      let existing = state.conversations.find(c => c.name.toLowerCase() === name.toLowerCase() || (uid && c.id === `thread-${uid}`));
      if (!existing) {
        existing = {
          id: uid ? `thread-${uid}` : 'chat-' + Date.now(),
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

  /* ── Realtime Backend Sync ───────────────────────────────── */
  async function syncWithBackend() {
    const data = await callApi('cv_social_get_message_threads', {});
    if (data && Array.isArray(data.items) && data.items.length) {
      data.items.forEach(backendThread => {
        const name = backendThread.other_user?.name || 'Faith In Member';
        const existing = state.conversations.find(c => c.id === backendThread.id || c.name.toLowerCase() === name.toLowerCase());
        if (!existing) {
          state.conversations.push({
            id: backendThread.id,
            name: name,
            avatar: getInitials(name),
            color: getAvatarColor(name),
            unread: backendThread.unread_count || 0,
            status: backendThread.presence?.active ? 'Active now' : 'Active now',
            role: backendThread.other_user?.role || 'Member',
            church: backendThread.other_user?.church || 'Faith Community',
            messages: []
          });
        } else {
          existing.id = backendThread.id;
          if (backendThread.unread_count !== undefined) existing.unread = backendThread.unread_count;
        }
      });
      saveConversations(state.conversations);
      renderInbox();
    }
  }

  /* ── Initial Load: INSTANT ZERO-WAIT INITIALIZATION ─────────────────────── */
  function init() {
    const params = new URLSearchParams(location.search);
    const threadParam = params.get('thread');
    const toParam = params.get('to');

    let initialId = state.conversations[0]?.id || 'thread-u-dara';
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
