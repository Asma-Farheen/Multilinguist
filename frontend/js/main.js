'use strict';

// ============================================================
// MAIN INITIATION (Setting up Buttons & Core Logic)
// ============================================================

function init() {
  bindEvents();
  applyLanguage(CONFIG.language);
  applyTheme(CONFIG.theme);
  applySpeed(CONFIG.speechRate);
  
  if ($('api-url')) {
    $('api-url').value = CONFIG.backendUrl;
  }
  
  renderRecent();
  loadVoices();
  setTimeout(loadVoices, 500); // Trigger again for Chrome bug
  
  console.log('🌱 Grama AI Initialized');
}

function bindEvents() {
  // Splash Screen transition
  const splash = $('screen-splash');
  if (splash) {
    setTimeout(() => {
      splash.classList.add('slide-out');
      showScreen('home');
    }, 2500);
  }

  // Settings Panel Actions
  if ($('settings-btn')) $('settings-btn').addEventListener('click', () => openPanel('settings'));
  if ($('history-btn')) $('history-btn').addEventListener('click', () => openPanel('history'));
  
  document.querySelectorAll('.close-panel').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.panel').classList.remove('open');
      e.target.closest('.panel').classList.add('hidden');
    });
  });

  // Settings: Backend URL
  if ($('save-settings')) {
    $('save-settings').addEventListener('click', () => {
      const url = $('api-url').value.trim();
      CONFIG.backendUrl = url;
      localStorage.setItem('gramaBackendUrl', url);
      showToast('Settings saved successfully!');
      closePanel('settings');
    });
  }

  // Microphone Main Button
  const micBtn = $('mic-btn');
  if (micBtn) {
    micBtn.addEventListener('mousedown', startListening);
    micBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startListening(); }, {passive: false});
    micBtn.addEventListener('mouseup', stopListening);
    micBtn.addEventListener('mouseleave', Object); // Just in case
    micBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopListening(); }, {passive: false});
  }

  // Back Buttons
  if ($('btn-home')) $('btn-home').addEventListener('click', () => {
    stopSpeaking();
    showScreen('home');
  });
  if ($('btn-cancel')) $('btn-cancel').addEventListener('click', () => {
    stopListening();
    showScreen('home');
  });

  // Replay Audio Response Button
  if ($('btn-replay')) $('btn-replay').addEventListener('click', () => speakText(state.lastAnswer));

  // Language Toggles
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const code = e.currentTarget.dataset.lang;
      applyLanguage(code);
      showToast(`${LANG_DATA[code].name} Selected`);
    });
  });

  // Category Toggles
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      state.currentCategory = e.currentTarget.dataset.cat;
    });
  });

  // Theme Toggles
  let themeIndex = 0;
  const themes = ['warm', 'nature', 'sky'];
  if ($('theme-cycle')) {
    $('theme-cycle').addEventListener('click', () => {
      themeIndex = (themeIndex + 1) % themes.length;
      applyTheme(themes[themeIndex]);
      showToast(`Interface: ${themes[themeIndex]}`);
    });
  }

  // Speed Toggles
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const p = parseFloat(e.currentTarget.dataset.speed);
      applySpeed(p);
      showToast(`Speech Speed: ${p}x`);
    });
  });

  // Ask Again Button
  if ($('new-question-btn')) {
    $('new-question-btn').addEventListener('click', () => {
      stopSpeaking();
      showScreen('home');
      setTimeout(startListening, 500);
    });
  }
}

