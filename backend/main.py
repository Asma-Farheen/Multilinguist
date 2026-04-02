# ================================================================
#  GRAMA AI - Backend (FastAPI)
#  Multilingual Rural AI Assistant
#  LLM: Groq (Llama 3 - Free Tier)  |  STT: Whisper  |  TTS: gTTS
# ================================================================

import os
import io
import logging
import tempfile
from typing import Optional

import json
import httpx
import aiofiles
from gtts import gTTS
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, Response
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# ----------------------------------------------------------------
# Logging
# ----------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("grama-ai")

# ----------------------------------------------------------------
# App Init
# ----------------------------------------------------------------
app = FastAPI(
    title="Grama AI Backend",
    description="Voice-first multilingual AI assistant for rural India",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------------------
# Config
# ----------------------------------------------------------------
GROQ_API_KEY   = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL     = os.getenv("GROQ_MODEL", "llama3-8b-8192")   # Free tier model
GROQ_API_URL   = "https://api.groq.com/openai/v1/chat/completions"

# ----------------------------------------------------------------
# Language Prompts
# ----------------------------------------------------------------
LANGUAGE_PROMPTS = {
    "te-IN": "You are Grama AI, a certified expert in Indian agriculture, rural healthcare, and government schemes. Answer ONLY in Telugu (తెలుగు). Provide practical, expert advice. Maximum 3 short, easy-to-follow sentences.",
    "hi-IN": "You are Grama AI, a certified expert in Indian agriculture, rural healthcare, and government schemes. Answer ONLY in Hindi (हिंदी). Provide practical, expert advice. Maximum 3 short, easy-to-follow sentences.",
    "ta-IN": "You are Grama AI, a certified expert in Indian agriculture, rural healthcare, and government schemes. Answer ONLY in Tamil (தமிழ்). Provide practical, expert advice. Maximum 3 short, easy-to-follow sentences.",
    "kn-IN": "You are Grama AI, a certified expert in Indian agriculture, rural healthcare, and government schemes. Answer ONLY in Kannada (ಕನ್ನಡ). Provide practical, expert advice. Maximum 3 short, easy-to-follow sentences.",
    "ml-IN": "You are Grama AI, a certified expert in Indian agriculture, rural healthcare, and government schemes. Answer ONLY in Malayalam (മലയാളം). Provide practical, expert advice. Maximum 3 short, easy-to-follow sentences.",
    "en-IN": "You are Grama AI, a certified expert in Indian agriculture, rural healthcare, and government schemes. Answer in simple, direct English. Provide practical, expert advice. Maximum 3 short sentences.",
}

CATEGORY_HINTS = {
    "farming":    "Focus on agriculture, crops, irrigation, soil, fertilizers, and farming best practices.",
    "health":     "Focus on basic health, common symptoms, home remedies, and when to visit a doctor.",
    "government": "Focus on Indian government schemes like PM Kisan, Ration Card, MNREGA, PM Awas Yojana.",
    "weather":    "Give general weather advice for farming and daily life.",
    "market":     "Focus on agricultural market prices, selling tips, and Mandi information.",
    "general":    "Answer helpfully and simply.",
}

# ----------------------------------------------------------------
# Request / Response Models
# ----------------------------------------------------------------
class ChatRequest(BaseModel):
    question:      str
    language:      str  = "te-IN"
    category:      str  = "general"
    system_prompt: Optional[str] = None

class ChatResponse(BaseModel):
    answer:   str
    language: str
    category: str
    model:    str

# ----------------------------------------------------------------
# HEALTH CHECK
# ----------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "status": "ok",
        "app": "Grama AI Backend",
        "version": "1.0.0",
        "groq_configured": bool(GROQ_API_KEY),
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

# ----------------------------------------------------------------
# CHAT ENDPOINT  (Text → AI → Text)
# ----------------------------------------------------------------
@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    lang       = req.language if req.language in LANGUAGE_PROMPTS else "en-IN"
    sys_prompt = req.system_prompt or build_system_prompt(lang, req.category)

    log.info("Chat | lang=%s category=%s | q=%s", lang, req.category, req.question[:60])

    # Call Groq LLM
    answer = await call_groq(req.question, sys_prompt)

    return ChatResponse(
        answer=answer,
        language=lang,
        category=req.category,
        model=GROQ_MODEL,
    )

# ----------------------------------------------------------------
# SPEECH-TO-TEXT ENDPOINT  (Audio → Text)
# ----------------------------------------------------------------
@app.post("/api/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    language: str     = Form("te"),
):
    """
    Accepts audio file (webm/wav/mp3), returns transcribed text via Whisper.
    """
    # Map BCP47 lang code to Whisper lang code
    lang_map = {
        "te-IN": "te", "hi-IN": "hi", "ta-IN": "ta",
        "kn-IN": "kn", "ml-IN": "ml", "en-IN": "en",
    }
    whisper_lang = lang_map.get(language, language[:2])

    # Save upload to temp file
    suffix = ".webm"
    if audio.filename:
        ext = os.path.splitext(audio.filename)[-1]
        if ext in [".wav", ".mp3", ".webm", ".ogg", ".m4a"]:
            suffix = ext

    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            content = await audio.read()
            tmp.write(content)
            tmp_path = tmp.name

        text = await run_whisper(tmp_path, whisper_lang)
        os.unlink(tmp_path)

        log.info("Transcribed | lang=%s | text=%s", whisper_lang, text[:60])
        return {"text": text, "language": language}

    except Exception as e:
        log.error("Transcription error: %s", e)
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


# ----------------------------------------------------------------
# VOICE PIPELINE  (Audio → Text → AI → Text)
# ----------------------------------------------------------------
@app.post("/api/voice-chat")
async def voice_chat(
    audio:    UploadFile = File(...),
    language: str        = Form("te-IN"),
    category: str        = Form("general"),
):
    """
    Full pipeline: audio → Whisper STT → Groq LLM → response text
    """
    # Step 1: Transcribe
    lang_map = {"te-IN":"te","hi-IN":"hi","ta-IN":"ta","kn-IN":"kn","ml-IN":"ml","en-IN":"en"}
    whisper_lang = lang_map.get(language, "te")

    suffix = ".webm"
    if audio.filename:
        ext = os.path.splitext(audio.filename)[-1]
        if ext: suffix = ext

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    try:
        question = await transcribe_groq(tmp_path)
        os.unlink(tmp_path)
    except Exception as e:
        os.unlink(tmp_path)
        raise HTTPException(status_code=500, detail=f"Groq STT failed: {str(e)}")

    if not question.strip():
        return {"question": "", "answer": "No speech detected", "language": "en-IN"}

    # Step 2: Get AI answer + context detection (Special Feature)
    sys_prompt = """
    You are Grama AI, an expert for rural India.
    1. Detect the user's intent/topic: farming, health, government, weather, market, or general.
    2. Detect the language natively.
    3. Provide expert, practical advice in THAT language.
    4. Keep it to 2-3 short, clear sentences.
    
    Return ONLY valid JSON:
    {
      "answer": "your practical expert advice",
      "lang_code": "te-IN / hi-IN / ta-IN / etc",
      "category": "farming / health / government / weather / market / general"
    }
    """
    
    response_json = await call_groq_json(question, sys_prompt)

    return {
        "question": question,
        "answer":   response_json.get("answer", "Error processing response"),
        "language": response_json.get("lang_code", language),
        "category": response_json.get("category", category),
        "model":    GROQ_MODEL,
    }


# ----------------------------------------------------------------
# HELPERS
# ----------------------------------------------------------------
def build_system_prompt(lang: str, category: str) -> str:
    base   = LANGUAGE_PROMPTS.get(lang, LANGUAGE_PROMPTS["en-IN"])
    hint   = CATEGORY_HINTS.get(category, CATEGORY_HINTS["general"])
    return f"{base}\n\nContext: {hint}"


async def call_groq(question: str, system_prompt: str) -> str:
    """
    Calls Groq API (Llama 3 - free tier).
    Falls back to built-in response if API key missing.
    """
    if not GROQ_API_KEY:
        log.warning("GROQ_API_KEY not set - using fallback response")
        return get_fallback_response(question, system_prompt)

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type":  "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system",  "content": system_prompt},
            {"role": "user",    "content": question},
        ],
        "max_tokens":   300,
        "temperature":  0.4,
        "top_p":        0.9,
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            res = await client.post(GROQ_API_URL, json=payload, headers=headers)
            res.raise_for_status()
            data = res.json()
            return data["choices"][0]["message"]["content"].strip()
    except httpx.TimeoutException:
        log.error("Groq API timeout")
        return get_fallback_response(question, system_prompt)
    except Exception as e:
        log.error("Groq API error: %s", e)
        return get_fallback_response(question, system_prompt)


async def call_groq_json(question: str, system_prompt: str) -> dict:
    if not GROQ_API_KEY:
        log.warning("GROQ_API_KEY not set - using fallback response")
        return {"answer": get_fallback_response(question, "en-IN"), "lang_code": "en-IN"}

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type":  "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system",  "content": system_prompt},
            {"role": "user",    "content": question},
        ],
        "max_tokens":   300,
        "temperature":  0.3,
    }

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            res = await client.post(GROQ_API_URL, json=payload, headers=headers)
            res.raise_for_status()
            data = res.json()["choices"][0]["message"]["content"]
            return json.loads(data)
    except Exception as e:
        log.error("Groq JSON API error: %s", e)
        return {"answer": get_fallback_response(question, "en-IN"), "lang_code": "en-IN"}

async def transcribe_groq(audio_path: str) -> str:
    if not GROQ_API_KEY:
        return ""
        
    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            with open(audio_path, "rb") as f:
                files = {"file": ("audio.webm", f, "audio/webm")}
                data = {
                    "model": "whisper-large-v3",
                    "prompt": "Grama AI, Farming, Health, Mandi Price, PM-Kisan, Indian village, Rural agriculture."
                }
                res = await client.post(url, headers=headers, files=files, data=data)
                res.raise_for_status()
                return res.json().get("text", "").strip()
    except Exception as e:
        log.error("Groq STT error: %s", e)
        return ""
    """
    Runs OpenAI Whisper STT locally.
    Falls back to placeholder if Whisper not installed.
    """
    try:
        import whisper                              # type: ignore
        model = whisper.load_model("base")          # Use "small" for better accuracy
        result = model.transcribe(audio_path, language=language, fp16=False)
        return result.get("text", "").strip()
    except ImportError:
        log.warning("Whisper not installed. pip install openai-whisper")
        return "[Whisper not installed - please install openai-whisper]"
    except Exception as e:
        log.error("Whisper error: %s", e)
        raise


def get_fallback_response(question: str, language: str) -> str:
    q = question.lower()
    if "te" in language:
        return "నేను గ్రామ AI ని. వ్యవసాయం, ఆరోగ్యం మరియు ప్రభుత్వ పథకాల గురించి నన్ను అడగండి."
    elif "hi" in language:
        return "मैं ग्राम एआई हूं। खेती, स्वास्थ्य और सरकारी योजनाओं के बारे में मुझसे पूछें।"
    elif "ta" in language:
        return "நான் கிராம AI. விவசாயம், சுகாதாரம் மற்றும் திட்டங்கள் பற்றி என்னிடம் கேளுங்கள்."
    elif "kn" in language:
        return "ನಾನು ಗ್ರಾಮ AI. ಕೃಷಿ, ಆರೋಗ್ಯ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ."
    elif "ml" in language:
        return "ഞാൻ ഗ്രാമ AI ആണ്. കൃഷി, ആരോഗ്യം, സർക്കാർ പദ്ധതികൾ എന്നിവയെക്കുറിച്ച് എന്നോട് ചോദിക്കുക."
    else:
        return "I am Grama AI. I can help with farming, health, and government schemes. Please ask your question."


@app.get("/api/tts")
async def text_to_speech(text: str, lang: str = "te-IN"):
    """
    Backend TTS fallback using gTTS.
    """
    try:
        # BCP47 to gtts code
        map_code = {
            "te-IN": "te", "hi-IN": "hi", "ta-IN": "ta", "kn-IN": "kn", "ml-IN": "ml", "en-IN": "en"
        }
        g_lang = map_code.get(lang, "en")
        
        tts = gTTS(text=text, lang=g_lang)
        
        # Save to memory
        buf = io.BytesIO()
        tts.write_to_fp(buf)
        buf.seek(0)
        
        return Response(content=buf.read(), media_type="audio/mpeg")
    except Exception as e:
        log.error("TTS Error: %s", e)
        raise HTTPException(status_code=500, detail="Voice synthesis failed")

# ----------------------------------------------------------------
# RUN (development)
# ----------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
