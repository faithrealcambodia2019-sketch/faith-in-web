/* Faith In — accessible multilingual parallel Bible reader. */
(() => {
  'use strict';

  const api = window.FIData;
  const ui = window.FI;
  if (!api || !ui) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = ui.esc;
  const STORAGE_KEY = 'faithin:bible:preferences:v1';
  const state = {
    versions: [],
    books: [],
    primaryVersion: 'KHMER_OLD_1954',
    secondaryVersion: 'KJV',
    book: 'John',
    chapter: 3,
    fontSize: 18,
    query: '',
    requestId: 0,
    primary: null,
    secondary: null
  };

  const elements = {
    book: $('#bible-book'),
    chapter: $('#bible-chapter'),
    primaryVersion: $('#bible-primary-version'),
    secondaryVersion: $('#bible-secondary-version'),
    previous: $('#bible-previous'),
    next: $('#bible-next'),
    swap: $('#bible-swap'),
    search: $('#bible-search'),
    status: $('#bible-reader-status'),
    fontLabel: $('#bible-font-label')
  };

  function safeStorage(method, value) {
    try {
      if (method === 'read') return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {}
    return null;
  }

  function safeExternalUrl(value) {
    try {
      const parsed = new URL(String(value || ''), location.origin);
      return parsed.protocol === 'https:' ? parsed.href : '';
    } catch {
      return '';
    }
  }

  function currentBook() {
    return state.books.find(book => book.name === state.book) || state.books[0] || { name: 'John', chapters: 21 };
  }

  function currentVersion(id) {
    return state.versions.find(version => version.id === id) || state.versions[0] || {
      id,
      label: id,
      languageLabel: 'Bible',
      attribution: '',
      attributionUrl: ''
    };
  }

  function savePreferences() {
    safeStorage('write', {
      primaryVersion: state.primaryVersion,
      secondaryVersion: state.secondaryVersion,
      book: state.book,
      chapter: state.chapter,
      fontSize: state.fontSize
    });
    const params = new URLSearchParams({
      book: state.book,
      chapter: String(state.chapter),
      primary: state.primaryVersion,
      compare: state.secondaryVersion
    });
    history.replaceState(null, '', `${location.pathname}?${params.toString()}`);
  }

  function restorePreferences(defaults) {
    const stored = safeStorage('read') || {};
    const params = new URLSearchParams(location.search);
    const requested = {
      primaryVersion: params.get('primary') || stored.primaryVersion || defaults.primaryVersion,
      secondaryVersion: params.get('compare') || stored.secondaryVersion || defaults.secondaryVersion,
      book: params.get('book') || stored.book || defaults.book,
      chapter: Number(params.get('chapter') || stored.chapter || defaults.chapter),
      fontSize: Number(stored.fontSize || 18)
    };
    if (state.versions.some(version => version.id === requested.primaryVersion)) state.primaryVersion = requested.primaryVersion;
    if (state.versions.some(version => version.id === requested.secondaryVersion)) state.secondaryVersion = requested.secondaryVersion;
    if (state.books.some(book => book.name === requested.book)) state.book = requested.book;
    const book = currentBook();
    state.chapter = Number.isInteger(requested.chapter) && requested.chapter >= 1 && requested.chapter <= book.chapters ? requested.chapter : 1;
    state.fontSize = Math.min(24, Math.max(16, Number.isFinite(requested.fontSize) ? requested.fontSize : 18));
  }

  function renderVersionOptions(select, selected) {
    const languages = [];
    state.versions.forEach(version => {
      let group = languages.find(item => item.label === version.languageLabel);
      if (!group) {
        group = { label: version.languageLabel, items: [] };
        languages.push(group);
      }
      group.items.push(version);
    });
    select.innerHTML = languages.map(group => `
      <optgroup label="${esc(group.label)}">
        ${group.items.map(version => `<option value="${esc(version.id)}"${version.id === selected ? ' selected' : ''}>${esc(version.shortLabel)} — ${esc(version.label)}${version.available === false ? ' • official access needed' : ''}</option>`).join('')}
      </optgroup>`).join('');
  }

  function renderBookOptions() {
    elements.book.innerHTML = state.books.map(book => `<option value="${esc(book.name)}"${book.name === state.book ? ' selected' : ''}>${esc(book.name)}</option>`).join('');
  }

  function renderChapterOptions() {
    const chapters = currentBook().chapters || 1;
    elements.chapter.innerHTML = Array.from({ length: chapters }, (_, index) => index + 1)
      .map(chapter => `<option value="${chapter}"${chapter === state.chapter ? ' selected' : ''}>${chapter}</option>`).join('');
    const atBeginning = state.book === state.books[0]?.name && state.chapter === 1;
    const lastBook = state.books[state.books.length - 1];
    const atEnd = state.book === lastBook?.name && state.chapter === lastBook?.chapters;
    elements.previous.disabled = atBeginning;
    elements.next.disabled = atEnd;
  }

  function applyFontSize() {
    document.documentElement.style.setProperty('--bible-reader-size', `${state.fontSize}px`);
    elements.fontLabel.textContent = `${state.fontSize}px`;
  }

  function renderControls() {
    renderBookOptions();
    renderChapterOptions();
    renderVersionOptions(elements.primaryVersion, state.primaryVersion);
    renderVersionOptions(elements.secondaryVersion, state.secondaryVersion);
    applyFontSize();
  }

  function setPanelLoading(side) {
    const panel = $(`[data-bible-panel="${side}"]`);
    const version = currentVersion(state[`${side}Version`]);
    $('[data-bible-language]', panel).textContent = version.languageLabel;
    $('[data-bible-version]', panel).textContent = version.label;
    const verses = $('[data-bible-verses]', panel);
    verses.className = 'fi-bible-verses is-loading';
    verses.setAttribute('aria-busy', 'true');
    verses.innerHTML = '<div class="fi-bible-loading"><span></span><span></span><span></span><span></span></div>';
    $('[data-bible-attribution]', panel).innerHTML = '';
  }

  function renderAttribution(panel, data, version) {
    const attribution = data.attribution || version.attribution || '';
    const href = safeExternalUrl(data.attributionUrl || version.attributionUrl || '');
    const target = $('[data-bible-attribution]', panel);
    target.innerHTML = attribution
      ? `${href ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(attribution)}</a>` : esc(attribution)}`
      : '';
  }

  function renderSetup(panel, data, version) {
    const verses = $('[data-bible-verses]', panel);
    verses.className = 'fi-bible-verses';
    verses.setAttribute('aria-busy', 'false');
    verses.innerHTML = `
      <div class="fi-bible-setup">
        <span class="fi-bible-setup-icon"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i></span>
        <h3>Official Khmer access is required</h3>
        <p>${esc(data.message || 'Connect the publisher-authorized Bible service to show this translation inside Faith In.')}</p>
        <div class="fi-bible-setup-actions">
          ${safeExternalUrl(data.readUrl) ? `<a class="btn btn-primary" href="${esc(safeExternalUrl(data.readUrl))}" target="_blank" rel="noopener noreferrer">Read official ${esc(version.shortLabel)}<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>` : ''}
          ${safeExternalUrl(data.setupUrl) ? `<a class="btn btn-neutral" href="${esc(safeExternalUrl(data.setupUrl))}" target="_blank" rel="noopener noreferrer">Connect publisher access</a>` : ''}
        </div>
      </div>`;
  }

  function renderPanelError(side, message) {
    state[side] = null;
    const panel = $(`[data-bible-panel="${side}"]`);
    const verses = $('[data-bible-verses]', panel);
    verses.className = 'fi-bible-verses';
    verses.setAttribute('aria-busy', 'false');
    verses.innerHTML = `<div class="fi-bible-panel-error"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i><p>${esc(message)}</p><button class="btn btn-outline" type="button" data-retry-bible>Try again</button></div>`;
  }

  function renderPanel(side, data) {
    const panel = $(`[data-bible-panel="${side}"]`);
    const version = currentVersion(state[`${side}Version`]);
    state[side] = data;
    $('[data-bible-language]', panel).textContent = version.languageLabel;
    $('[data-bible-version]', panel).textContent = data.versionLabel || version.label;
    renderAttribution(panel, data, version);

    if (data.status !== 'ready') {
      renderSetup(panel, data, version);
      return;
    }

    const verses = $('[data-bible-verses]', panel);
    verses.className = `fi-bible-verses${version.language === 'km' ? ' is-khmer' : ''}`;
    verses.setAttribute('aria-busy', 'false');
    verses.innerHTML = (data.items || []).map((verse, index) => `
      <button class="fi-bible-verse" type="button" data-copy-verse="${side}:${index}" data-search-text="${esc(String(verse.text || '').toLocaleLowerCase())}" title="Copy ${esc(verse.reference || `verse ${verse.v}`)}">
        <sup>${Number(verse.v) || ''}</sup><span>${esc(verse.text || '')}</span><i class="fa-regular fa-copy" aria-hidden="true"></i>
      </button>`).join('') || '<p class="fi-bible-empty">No verses were returned for this chapter.</p>';
  }

  function applySearch(query) {
    state.query = String(query || '').trim().toLocaleLowerCase();
    let visible = 0;
    $$('.fi-bible-verse').forEach(row => {
      const matches = !state.query || (row.dataset.searchText || '').includes(state.query);
      row.hidden = !matches;
      if (matches) visible += 1;
    });
    elements.status.textContent = state.query
      ? `${visible} matching verse${visible === 1 ? '' : 's'} in ${state.book} ${state.chapter}`
      : `Showing ${state.book} ${state.chapter} in two translations`;
  }

  async function loadBible() {
    const requestId = ++state.requestId;
    setPanelLoading('primary');
    setPanelLoading('secondary');
    elements.status.textContent = `Loading ${state.book} ${state.chapter}…`;
    savePreferences();
    const params = { book: state.book, chapter: state.chapter };
    const primaryRequest = api.request('cv_bible_get_verses', { ...params, version: state.primaryVersion });
    const secondaryRequest = api.request('cv_bible_get_verses', { ...params, version: state.secondaryVersion });
    const results = await Promise.allSettled([primaryRequest, secondaryRequest]);
    if (requestId !== state.requestId) return;
    results.forEach((result, index) => {
      const side = index === 0 ? 'primary' : 'secondary';
      if (result.status === 'fulfilled') renderPanel(side, result.value || {});
      else renderPanelError(side, result.reason?.message || 'This translation could not be loaded.');
    });
    applySearch(elements.search.value);
  }

  function moveChapter(direction) {
    const bookIndex = state.books.findIndex(book => book.name === state.book);
    const book = currentBook();
    if (direction < 0 && state.chapter > 1) state.chapter -= 1;
    else if (direction > 0 && state.chapter < book.chapters) state.chapter += 1;
    else {
      const nextBook = state.books[bookIndex + direction];
      if (!nextBook) return;
      state.book = nextBook.name;
      state.chapter = direction < 0 ? nextBook.chapters : 1;
    }
    renderBookOptions();
    renderChapterOptions();
    elements.search.value = '';
    loadBible();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function copyText(value, successMessage) {
    if (!value) return;
    const complete = () => ui.toast(successMessage);
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(value).then(complete).catch(() => {});
  }

  function bindEvents() {
    elements.book.addEventListener('change', event => {
      state.book = event.target.value;
      state.chapter = 1;
      renderChapterOptions();
      loadBible();
    });
    elements.chapter.addEventListener('change', event => {
      state.chapter = Number(event.target.value) || 1;
      renderChapterOptions();
      loadBible();
    });
    elements.primaryVersion.addEventListener('change', event => {
      state.primaryVersion = event.target.value;
      loadBible();
    });
    elements.secondaryVersion.addEventListener('change', event => {
      state.secondaryVersion = event.target.value;
      loadBible();
    });
    elements.previous.addEventListener('click', () => moveChapter(-1));
    elements.next.addEventListener('click', () => moveChapter(1));
    elements.swap.addEventListener('click', () => {
      [state.primaryVersion, state.secondaryVersion] = [state.secondaryVersion, state.primaryVersion];
      renderVersionOptions(elements.primaryVersion, state.primaryVersion);
      renderVersionOptions(elements.secondaryVersion, state.secondaryVersion);
      loadBible();
    });
    elements.search.addEventListener('input', event => applySearch(event.target.value));
    $('#bible-font-decrease').addEventListener('click', () => {
      state.fontSize = Math.max(16, state.fontSize - 1);
      applyFontSize();
      savePreferences();
    });
    $('#bible-font-increase').addEventListener('click', () => {
      state.fontSize = Math.min(24, state.fontSize + 1);
      applyFontSize();
      savePreferences();
    });
    document.addEventListener('click', event => {
      const retry = event.target.closest('[data-retry-bible]');
      if (retry) return loadBible();
      const verseButton = event.target.closest('[data-copy-verse]');
      if (verseButton) {
        const [side, rawIndex] = verseButton.dataset.copyVerse.split(':');
        const verse = state[side]?.items?.[Number(rawIndex)];
        if (verse) copyText(`${verse.text}\n— ${verse.reference} (${currentVersion(state[`${side}Version`]).shortLabel})`, 'Verse copied');
        return;
      }
      const chapterButton = event.target.closest('[data-copy-chapter]');
      if (chapterButton) {
        const side = chapterButton.dataset.copyChapter;
        const data = state[side];
        const version = currentVersion(state[`${side}Version`]);
        const text = (data?.items || []).map(verse => `${verse.v} ${verse.text}`).join('\n');
        copyText(`${state.book} ${state.chapter} (${version.shortLabel})\n\n${text}`, 'Chapter copied');
      }
    });
    document.addEventListener('fi:search', event => {
      const query = String(event.detail?.query || '').trim();
      const reference = query.match(/^(.+?)\s+(\d+)(?::\d+(?:-\d+)?)?$/);
      const book = reference && state.books.find(item => item.name.toLocaleLowerCase() === reference[1].toLocaleLowerCase());
      const chapter = Number(reference?.[2]);
      if (book && Number.isInteger(chapter) && chapter >= 1 && chapter <= book.chapters) {
        state.book = book.name;
        state.chapter = chapter;
        elements.search.value = '';
        renderBookOptions();
        renderChapterOptions();
        loadBible();
      } else {
        elements.search.value = query;
        applySearch(query);
      }
    });
  }

  async function init() {
    bindEvents();
    try {
      const catalog = await api.request('cv_bible_get_versions');
      state.versions = Array.isArray(catalog.versions) ? catalog.versions : [];
      state.books = Array.isArray(catalog.books) ? catalog.books : [];
      if (!state.versions.length || !state.books.length) throw new Error('The Bible catalog is unavailable.');
      restorePreferences(catalog.defaults || {});
      renderControls();
      await loadBible();
    } catch (error) {
      elements.status.textContent = error?.message || 'The Bible reader could not start.';
      renderPanelError('primary', elements.status.textContent);
      renderPanelError('secondary', elements.status.textContent);
    }
  }

  init();
})();
