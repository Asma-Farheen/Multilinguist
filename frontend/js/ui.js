'use strict';

// ============================================================
// UI LOGIC (Screens, Panels, rendering visually)
// ============================================================

function showScreen(name) {
  const current = document.querySelector('.screen.active');
  if (current) {
    current.classList.add('slide-out');
    setTimeout(() => {
      current.classList.remove('active', 'slide-out');
    }, 400);
  }
  setTimeout(() => {
    const next = $(`screen-${name}`);
    if (next) {
      next.classList.add('active');
      state.currentScreen = name;
    }
  }, 100);
}

function showToast(msg, duration = 2500) {
  const toast = $('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// Opens the final response screen
function displayResponse(question, answer, category) {
  const catData = CATEGORY_DATA[category] || CATEGORY_DATA['general'];

  $('question-text').textContent = question;
  $('response-text').textContent = answer;
  $('response-category-badge').textContent = `${catData.emoji} ${catData.label}`;
  
  if ($('response-image-emoji')) {
    $('response-image-emoji').textContent = catData.emoji;
  }

  showScreen('response');

  // Auto-speak answer from bot
  setTimeout(() => speakText(answer), 500);
}

// ------------------------------------------------------------
// PANELS (Settings & History Side Menus)
// ------------------------------------------------------------

function openPanel(name) {
  const panel = $(`${name}-panel`);
  if (!panel) return;
  panel.classList.remove('hidden');
  panel.classList.add('open');
  if (name === 'history') renderHistory();
}

function closePanel(name) {
  const panel = $(`${name}-panel`);
  if (!panel) return;
  panel.classList.remove('open');
  panel.classList.add('hidden');
}

// ------------------------------------------------------------
// DOM UPDATERS (Themes, speed, language labels)
// ------------------------------------------------------------

function applyLanguage(langCode) {
  state.currentLang = langCode;
  localStorage.setItem('gramaLanguage', langCode);
  CONFIG.language = langCode;
  
  const data = LANG_DATA[langCode] || LANG_DATA['te-IN'];

  $('avatar-prompt').textContent = data.prompt;
  $('mic-btn').querySelector('.mic-label').textContent = data.micLabel;
  $('listening-text').textContent = data.listening;

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === langCode);
  });
}

function applyTheme(theme) {
  document.body.className = document.body.className.replace(/theme-\w+/g, '');
  if (theme !== 'warm') {
    document.body.classList.add(`theme-${theme}`);
  }
  localStorage.setItem('gramaTheme', theme);
  CONFIG.theme = theme;

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

function applySpeed(speed) {
  state.speechRate = speed;
  CONFIG.speechRate = speed;
  localStorage.setItem('gramaSpeechRate', speed);
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
  });
}

// ------------------------------------------------------------
// HISTORY RENDERING
// ------------------------------------------------------------

function saveToHistory(question, answer, category) {
  const item = {
    id: Date.now(),
    question,
    answer,
    category,
    lang: state.currentLang,
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };

  state.history.unshift(item);
  if (state.history.length > CONFIG.maxHistory) {
    state.history.pop();
  }
  localStorage.setItem('gramaHistory', JSON.stringify(state.history));
  renderRecent();
}

function renderRecent() {
  const list = $('recent-list');
  if (!list) return;
  list.innerHTML = '';

  const recent = state.history.slice(0, 3);
  if (!recent.length) {
    list.innerHTML = '<p class="no-history">🌿 Your conversations will appear here</p>';
    return;
  }

  recent.forEach(item => {
    const catData = CATEGORY_DATA[item.category] || CATEGORY_DATA['general'];
    const div = document.createElement('div');
    div.className = 'recent-item';
    div.innerHTML = `
      <span class="recent-emoji">${catData.emoji}</span>
      <div class="recent-info">
        <p class="recent-q">${item.question}</p>
        <p class="recent-time">${item.time}</p>
      </div>
      <span class="recent-replay">🔊</span>
    `;
    div.addEventListener('click', () => {
      displayResponse(item.question, item.answer, item.category);
    });
    list.appendChild(div);
  });
}

function renderHistory() {
  const list = $('history-list');
  if (!list) return;
  list.innerHTML = '';

  if (!state.history.length) {
    list.innerHTML = '<p class="no-history">No conversations yet.</p>';
    return;
  }

  state.history.forEach(item => {
    const catData = CATEGORY_DATA[item.category] || CATEGORY_DATA['general'];
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <span class="history-emoji">${catData.emoji}</span>
      <div class="history-info">
        <p class="history-q">${item.question}</p>
        <p class="history-a">${item.answer.substring(0, 60)}...</p>
      </div>
    `;
    div.addEventListener('click', () => {
      closePanel('history');
      displayResponse(item.question, item.answer, item.category);
    });
    list.appendChild(div);
  });
}
