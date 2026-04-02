'use strict';

// ============================================================
// GLOBAL EVENT DELEGATION (Bulletproof Listening)
// ============================================================

function bindGlobalEvents() {
  console.log('🔗 Attaching Global Event Listeners...');

  document.addEventListener('click', (e) => {
    // 1. Microphone Toggle
    const micBtn = e.target.closest('#mic-btn');
    if (micBtn) {
      console.log('🎤 Mic Clicked');
      if (state.isListening) {
        stopListening();
      } else {
        startListening();
      }
      return;
    }

    // 2. Category Toggles
    const catBtn = e.target.closest('.category-card');
    if (catBtn) {
      document.querySelectorAll('.category-card').forEach(b => b.classList.remove('active'));
      catBtn.classList.add('active');
      state.currentCategory = catBtn.dataset.category;
      showToast(`Topic: ${state.currentCategory}`);
      return;
    }

    // 3. Language Toggles
    const langBtn = e.target.closest('.lang-btn');
    if (langBtn) {
      const code = langBtn.dataset.lang;
      applyLanguage(code);
      showToast(`${LANG_DATA[code].name} Selected`);
      return;
    }

    // 4. Panel Controls
    if (e.target.closest('#settings-btn')) openPanel('settings');
    if (e.target.closest('#history-btn')) openPanel('history');
    if (e.target.closest('.close-panel') || e.target.closest('.panel-overlay')) {
       document.querySelectorAll('.panel').forEach(p => {
         p.classList.remove('open');
         setTimeout(() => p.classList.add('hidden'), 400);
       });
    }

    // 5. Navigation & Replay
    if (e.target.closest('#btn-home')) {
      stopSpeaking();
      showScreen('home');
    }
    if (e.target.closest('#btn-cancel')) {
      stopListening();
      showScreen('home');
    }
    if (e.target.closest('#btn-replay')) {
      speakText(state.lastAnswer);
    }
    if (e.target.closest('#new-question-btn')) {
      stopSpeaking();
      showScreen('home');
      setTimeout(startListening, 600);
    }

    // 6. Theme & Speed Selectors
    const themeBtn = e.target.closest('.theme-btn');
    if (themeBtn) {
      applyTheme(themeBtn.dataset.theme);
      showToast(`Theme: ${themeBtn.dataset.theme}`);
      return;
    }

    const speedBtn = e.target.closest('.speed-btn');
    if (speedBtn) {
      const p = parseFloat(speedBtn.dataset.speed);
      applySpeed(p);
      showToast(`Speed: ${p}x`);
      return;
    }

    if (e.target.closest('#theme-cycle')) {
      const themes = ['warm', 'nature', 'sky'];
      let idx = themes.indexOf(state.currentTheme || 'warm');
      let next = themes[(idx + 1) % themes.length];
      applyTheme(next);
      showToast(`Theme: ${next}`);
    }
  });
}

function init() {
  // Global handlers are attached ONCE at startup
  applyLanguage(CONFIG.language);
  applyTheme(CONFIG.theme);
  applySpeed(CONFIG.speechRate);
  
  if ($('api-url')) {
    $('api-url').value = CONFIG.backendUrl;
  }
  
  renderRecent();
  loadVoices();
  
  // Transition from splash
  setTimeout(() => {
    const splash = $('screen-splash');
    if (splash) {
      splash.classList.add('slide-out');
      showScreen('home');
    }
  }, 2000);

  console.log('🌱 Grama AI Initialized');
}

// Attach global events immediately
bindGlobalEvents();
