# 🌿 Grama AI Assistant — గ్రామ AI

> **Voice-first multilingual AI for rural India** — No reading or writing needed.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue.svg)]()
[![Languages](https://img.shields.io/badge/Languages-Telugu%20%7C%20Hindi%20%7C%20Tamil%20%7C%20Kannada%20%7C%20Malayalam-orange)]()

---

## 📱 What is Grama AI?

Grama AI is a **voice-first AI assistant** designed for rural users who **cannot read or write**. Users tap a big microphone button, speak in their language, and hear the answer spoken back — no typing needed.

### Key Features
| Feature | Details |
|---|---|
| 🎤 Voice Input | Tap mic → speak → get answer |
| 🔊 Voice Output | AI answer auto-spoken in your language |
| 🌐 6 Languages | Telugu, Hindi, Tamil, Kannada, Malayalam, English |
| 🌾 Rural Focus | Farming, Health, Govt Schemes, Market Prices |
| 📴 Offline-First | Works on slow internet (PWA + Service Worker) |
| 📲 Installable | Add to home screen like a native app |

---

## 🗂 Project Structure

```
Multilinguist/
├── frontend/
│   ├── index.html        ← Main app (single page)
│   ├── styles.css        ← Antigravity design system
│   ├── app.js            ← App logic, voice, AI calls
│   ├── sw.js             ← Service Worker (offline)
│   └── manifest.json     ← PWA manifest
│
├── backend/
│   ├── main.py           ← FastAPI server
│   ├── requirements.txt  ← Python dependencies
│   └── .env.example      ← Environment variable template
│
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Option A — Frontend Only (No Backend, Works Immediately)

The frontend works **stand-alone** without a backend using the built-in browser Speech API and local fallback responses.

1. Open `frontend/index.html` in Chrome (desktop or Android)
2. Allow microphone permission when prompted
3. Tap the big orange mic button and speak!

> ⚠️ **Voice recognition requires Google Chrome** (desktop or Android). Safari/Firefox have limited support for Indian languages.

---

### Option B — Full Stack (With Groq AI Backend)

#### Step 1 — Get a Free Groq API Key
1. Go to [https://console.groq.com/keys](https://console.groq.com/keys)
2. Sign up (free) → Create API Key → Copy it

#### Step 2 — Setup Backend

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env     # Windows
cp .env.example .env       # Mac/Linux

# Add your Groq key to .env
# GROQ_API_KEY=gsk_your_key_here

# Start backend
python main.py
# → Runs at http://localhost:8000
```

#### Step 3 — Connect Frontend to Backend

1. Open the app in Chrome → tap ⚙️ Settings
2. Set **Backend URL** to `http://localhost:8000`
3. Tap ✓ Done

#### Step 4 — Optional: Enable Whisper STT (Server-side)

```bash
# Install Whisper (requires ~1GB download for base model)
pip install openai-whisper

# For better Indian language accuracy:
# Change WHISPER_MODEL=small in .env
```

---

## 📖 API Reference

### `POST /api/chat` — Text Chat
```json
// Request
{
  "question": "వ్యవసాయంలో నీటిపారుదల ఎలా పెంచాలి?",
  "language": "te-IN",
  "category": "farming"
}

// Response
{
  "answer": "నీటిపారుదల పెంచడానికి...",
  "language": "te-IN",
  "category": "farming",
  "model": "llama3-8b-8192"
}
```

### `POST /api/transcribe` — Audio → Text (Whisper)
```
Form Data:
  audio: <audio file .webm/.wav/.mp3>
  language: te-IN

Response:
  { "text": "transcribed text", "language": "te-IN" }
```

### `POST /api/voice-chat` — Full Pipeline (Audio → AI → Text)
```
Form Data:
  audio: <audio file>
  language: te-IN
  category: farming

Response:
  { "question": "...", "answer": "...", "language": "te-IN", ... }
```

---

## 🌐 Supported Languages

| Language | Code | Script |
|---|---|---|
| Telugu | `te-IN` | తెలుగు |
| Hindi | `hi-IN` | हिंदी |
| Tamil | `ta-IN` | தமிழ் |
| Kannada | `kn-IN` | ಕನ್ನಡ |
| Malayalam | `ml-IN` | മലയാളം |
| English | `en-IN` | English |

---

## ☁️ Free Hosting Options

| Service | What to Deploy | Free Tier |
|---|---|---|
| **Vercel** | Frontend (`/frontend`) | ✅ Always free |
| **Render** | Backend (`/backend`) | ✅ 750 hrs/month |
| **Replit** | Both (full stack) | ✅ Free + easy |
| **Railway** | Backend | $5 credit/month |

### Deploy Frontend to Vercel
```bash
npx vercel --cwd frontend
```

### Deploy Backend to Render
1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo → set **Root Dir** to `backend`
4. Build: `pip install -r requirements.txt`
5. Start: `python main.py`
6. Add environment variable: `GROQ_API_KEY=your_key`

---

## 🎨 Design System

Grama AI uses the **Antigravity UI** design language:

- **Floating elements** with soft shadows
- **Large touch targets** (min 48×48px) for easy tap
- **Icon-first** navigation — no reading required
- **3 themes**: 🌅 Warm (orange), 🌿 Nature (green), 🌊 Sky (blue)
- **Animations**: floating avatar, wave bars, ring pulses
- **PWA**: installable, offline support, fullscreen

---

## 📋 Use Cases

| Category | Example Questions |
|---|---|
| 🌾 Farming | "How to improve rice yield?" / "When to plant cotton?" |
| 💊 Health | "What to do for fever?" / "Baby not eating, what to do?" |
| 🏛️ Government | "PM Kisan scheme details" / "How to apply for ration card?" |
| 🌦️ Weather | "Will it rain tomorrow?" / "Is it good for sowing?" |
| 🛒 Market | "Today's onion price?" / "Where is nearest mandi?" |

---

## 🛠 Tech Stack

| Layer | Technology | Cost |
|---|---|---|
| Frontend | HTML5 + CSS3 + Vanilla JS | Free |
| STT (Browser) | Web Speech API | Free |
| TTS (Browser) | SpeechSynthesis API | Free |
| LLM | Groq + Llama 3 8B | Free |
| STT (Server) | OpenAI Whisper | Free |
| Backend | Python FastAPI | Free |
| Hosting | Vercel + Render | Free |

---

## 🔒 Privacy

- No user data stored on server
- Conversation history stored locally (browser localStorage only)
- Last 10 conversations kept on device

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built with ❤️ for rural India — గ్రామ భారతదేశం కోసం*
