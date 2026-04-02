'use strict';

// ============================================================
// AUDIO & SPEECH (Microphone & Multilingual High-Quality TTS)
// ============================================================

let mediaRecorder;
let audioChunks = [];

async function startListening() {
  stopSpeaking();
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      processAudioBlob(audioBlob);
    };

    mediaRecorder.start();
    state.isListening = true;
    
    if ($('mic-btn')) $('mic-btn').classList.add('listening');
    if ($('listening-text')) $('listening-text').textContent = LANG_DATA[state.currentLang]?.listening || 'Listening...';
    
    showScreen('listening');
  } catch (err) {
    console.error('Mic capture error:', err.message);
    showToast('🎤 Error: Microphone permission denied or unavailable.');
    state.isListening = false;
    showScreen('home');
  }
}

function stopListening() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
  state.isListening = false;
  $('mic-btn').classList.remove('listening');
}

// ------------------------------------------------------------
// HIGH-FIDELITY TEXT-TO-SPEECH (Grama AI Voice)
// ------------------------------------------------------------

function loadVoices() {
  // Only used for Local Fallback
  if (state.synth) state.synth.getVoices();
}

/**
 * Modern High-Quality TTS with Backend Streaming Fallback.
 * This guarantees the user HEARS the bot even if their phone has no voice packs.
 */
async function speakText(text) {
  if (!text) return;
  stopSpeaking();

  console.log(`🗣️ Speaking (${state.currentLang}): ${text.substring(0, 50)}...`);

  // Target: High-quality backend stream (Fast, multi-language, accurate)
  const ttsUrl = `${CONFIG.backendUrl}/api/tts?text=${encodeURIComponent(text)}&lang=${state.currentLang}`;
  
  const audio = new Audio(ttsUrl);
  state.currentAudio = audio; 
  
  audio.onplay = () => {
    state.isSpeaking = true;
    const indicator = $('speaking-indicator');
    if (indicator) indicator.classList.add('visible');
  };
  
  audio.onended = () => resetSpeakingState();
  audio.onerror = (e) => {
    console.warn("Backend TTS failed/offline, switching to browser local voice.");
    speakTextLocal(text);
  };

  audio.play().catch(err => {
    console.warn("Interaction required or playback failed", err);
    speakTextLocal(text);
  });
}

/**
 * Local Web Speech API Fallback (Standard Browser Quality)
 */
function speakTextLocal(text) {
  if (!state.synth) return;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.currentLang;
  utterance.rate = state.speechRate;

  // Try to find a half-decent local voice
  const voices = state.synth.getVoices();
  let v = voices.find(v => v.lang === state.currentLang);
  if (!v) v = voices.find(v => v.lang.startsWith(state.currentLang.split('-')[0]));
  if (v) utterance.voice = v;

  utterance.onstart = () => {
    state.isSpeaking = true;
    const indicator = $('speaking-indicator');
    if (indicator) indicator.classList.add('visible');
  };
  utterance.onend = () => resetSpeakingState();
  utterance.onerror = () => resetSpeakingState();

  state.synth.speak(utterance);
}

function resetSpeakingState() {
  state.isSpeaking = false;
  const indicator = $('speaking-indicator');
  if (indicator) indicator.classList.remove('visible');
  state.currentAudio = null;
}

function stopSpeaking() {
  // Stop backend audio if playing
  if (state.currentAudio) {
    state.currentAudio.pause();
    state.currentAudio = null;
  }
  // Stop local synthesis if playing
  if (state.synth && state.synth.speaking) {
    state.synth.cancel();
  }
  resetSpeakingState();
}
