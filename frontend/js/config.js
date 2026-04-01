'use strict';

// ============================================================
// CONFIG & DATA (Server linking & App Data)
// ============================================================
const CONFIG = {
  backendUrl: localStorage.getItem('gramaBackendUrl') || 'https://multilinguist.onrender.com',
  speechRate:  parseFloat(localStorage.getItem('gramaSpeechRate') || '1.0'),
  language:    localStorage.getItem('gramaLanguage') || 'te-IN',
  theme:       localStorage.getItem('gramaTheme') || 'warm',
  maxHistory:  10,
};

const LANG_DATA = {
  'te-IN': { name: 'Telugu', prompt: 'నొక్కండి మాట్లాడండి', listening: 'వింటున్నాను...', thinking: 'ఆలోచిస్తున్నాను...', micLabel: 'మాట్లాడు', noSpeech: 'మళ్ళీ ప్రయత్నించండి', error: 'తప్పు జరిగింది' },
  'hi-IN': { name: 'Hindi', prompt: 'बोलने के लिए दबाएं', listening: 'सुन रहा हूँ...', thinking: 'सोच रहा हूँ...', micLabel: 'बोलें', noSpeech: 'दोबारा कोशिश करें', error: 'गलती हुई' },
  'ta-IN': { name: 'Tamil', prompt: 'பேச அழுத்துங்கள்', listening: 'கேட்கிறேன்...', thinking: 'யோசிக்கிறேன்...', micLabel: 'பேசு', noSpeech: 'மீண்டும் முயற்சிக்கவும்', error: 'பிழை ஏற்பட்டது' },
  'kn-IN': { name: 'Kannada', prompt: 'ಮಾತನಾಡಲು ಒತ್ತಿರಿ', listening: 'ಕೇಳುತ್ತಿದ್ದೇನೆ...', thinking: 'ಯೋಚಿಸುತ್ತಿದ್ದೇನೆ...', micLabel: 'ಮಾತಾಡು', noSpeech: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ', error: 'ತಪ್ಪಾಯಿತು' },
  'ml-IN': { name: 'Malayalam', prompt: 'സംസാരിക്കാൻ അമർത്തുക', listening: 'കേൾക്കുന്നു...', thinking: 'ചിന്തിക്കുന്നു...', micLabel: 'സംസാരിക്കുക', noSpeech: 'വീണ്ടും ശ്രമിക്കുക', error: 'പിശക് സംഭവിച്ചു' },
  'en-IN': { name: 'English', prompt: 'Tap to speak', listening: 'Listening...', thinking: 'Thinking...', micLabel: 'Speak', noSpeech: 'Please try again', error: 'Something went wrong' },
};

const CATEGORY_DATA = {
  farming:    { emoji: '🌾', label: 'Farming', color: '#27AE60' },
  health:     { emoji: '💊', label: 'Health', color: '#E74C3C' },
  government: { emoji: '🏛️', label: 'Govt Schemes', color: '#2980B9' },
  weather:    { emoji: '🌦️', label: 'Weather', color: '#8E44AD' },
  market:     { emoji: '🛒', label: 'Market Price', color: '#E67E22' },
  general:    { emoji: '💬', label: 'General', color: '#7F8C8D' },
};

const state = {
  currentScreen: 'splash',
  currentLang: CONFIG.language,
  currentCategory: 'farming',
  lastQuestion: '',
  lastAnswer: '',
  isListening: false,
  isSpeaking: false,
  speechRate: CONFIG.speechRate,
  history: JSON.parse(localStorage.getItem('gramaHistory') || '[]'),
  synth: window.speechSynthesis,
  voices: [],
};

// Global DOM Helpers
const $ = (id) => document.getElementById(id);
const el = (sel) => document.querySelector(sel);
