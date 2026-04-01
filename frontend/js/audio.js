'use strict';

// ============================================================
// AUDIO & SPEECH (Microphone & Text-To-Speech bot voices)
// ============================================================

let mediaRecorder;
let audioChunks = [];

async function startListening() {
  stopSpeaking();
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    // Collect chunks of audio as the user speaks
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    // When the user stops talking, we package the audio
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
      // We pass it to the server (func defined in api.js)
      processAudioBlob(audioBlob);
    };

    mediaRecorder.start();
    state.isListening = true;
    $('mic-btn').classList.add('listening');
    $('interim-text').textContent = 'Speak in ANY language...';
    
    // UI Change
    showScreen('listening');
  } catch (err) {
    console.error('mic err:', err);
    showToast('🎤 Voice not supported or mic denied.');
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
// TEXT-TO-SPEECH (Bot Talking Back)
// ------------------------------------------------------------

function loadVoices() {
  state.voices = state.synth.getVoices();
  if (!state.voices.length) {
    state.synth.onvoiceschanged = () => {
      state.voices = state.synth.getVoices();
    };
  }
}

function getBestVoice(langCode) {
  const voices = state.voices;
  let v = voices.find(v => v.lang === langCode);
  if (v) return v;
  const prefix = langCode.split('-')[0];
  v = voices.find(v => v.lang.startsWith(prefix));
  return v || null;
}

function speakText(text) {
  if (!state.synth) return;
  stopSpeaking(); // Stop anything currently talking

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.currentLang;
  utterance.rate = state.speechRate;

  const voice = getBestVoice(state.currentLang);
  if (voice) utterance.voice = voice;

  utterance.onstart = () => {
    state.isSpeaking = true;
    $('speaking-indicator').classList.add('visible');
  };

  utterance.onend = () => {
    state.isSpeaking = false;
    $('speaking-indicator').classList.remove('visible');
  };

  utterance.onerror = () => {
    state.isSpeaking = false;
    $('speaking-indicator').classList.remove('visible');
  };

  state.synth.speak(utterance);
}

function stopSpeaking() {
  if (state.synth && state.synth.speaking) {
    state.synth.cancel();
  }
  state.isSpeaking = false;
  const indicator = $('speaking-indicator');
  if (indicator) indicator.classList.remove('visible');
}
