'use strict';

// ============================================================
// API & SERVER LINKING (Communicating with the Bot Server)
// ============================================================

async function processAudioBlob(audioBlob) {
  showScreen('thinking');
  $('thinking-query').textContent = "Processing audio on server...";

  // Prepare the file upload package
  const formData = new FormData();
  formData.append('audio', audioBlob, 'record.webm');
  formData.append('language', state.currentLang);
  formData.append('category', state.currentCategory);

  try {
    // Connect to the backend
    const res = await fetch(`${CONFIG.backendUrl}/api/voice-chat`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      
      // Auto-update UI to detected context
      if (data.language) applyLanguage(data.language);
      if (data.category) applyCategory(data.category);
      
      state.lastAnswer = data.answer;
      saveToHistory(data.question || "🎤 Audio input", data.answer, data.category);
      
      // Display what the bot said
      displayResponse(data.question || "🎤 Audio input", data.answer, data.category);
    } else {
      throw new Error(`Server returned ${res.status}`);
    }
  } catch (e) {
    console.error("Audio processing failed", e);
    const fallbackAnswer = LANG_DATA[state.currentLang]?.error || 'Error connecting to the server. Please check your network.';
    displayResponse("Audio Process Fail", fallbackAnswer, state.currentCategory);
  }
}
