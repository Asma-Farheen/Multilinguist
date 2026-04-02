# 🌿 Grama AI - Offline Deployment Guide 🛡️

Since Grama AI is designed for rural India with intermittent connectivity, this guide explains how to run the **entire system 100% offline** on your own laptop or local server.

---

### **1. Architecture for Offline Mode**
To work without internet, you need to replace Cloud APIs (Groq) with **Local AI Models**.
*   **STT (Speech-to-Text):** Run `OpenAI Whisper` locally on your CPU/GPU.
*   **LLM (Intelligence):** Run `Llama 3.1` locally using **Ollama**.

---

### **2. Local Setup (Ollama Method)**

1.  **Install Ollama:** [https://ollama.com/download](https://ollama.com/download)
2.  **Pull the Model:**
    ```bash
    ollama pull llama3.1:8b
    ```
3.  **Update Backend (`backend/.env`):**
    Change the `GROQ_API_URL` to your local Ollama endpoint:
    ```env
    BACKEND_MODE=local
    OLLAMA_URL=http://localhost:11434/api/generate
    ```
4.  **Local Transcription:**
    Uncomment the `whisper` and `torch` lines in `backend/requirements.txt` and install them. The backend will automatically switch to local transcription mode.

---

### **3. Running with Docker**

We have provided a `docker-compose.yml` that wraps the Frontend and Backend into one local "Network Container." 
1.  **Build:** `docker-compose up --build`
2.  **Access:** `http://localhost:9999` (No internet required!)

---

### **4. PWA (Phone Offline Support)**
Grama AI is a **Progressive Web App**. Once you visit the app once and "Add to Home Screen":
*   The **UI, Styles, and Voices** are stored permanently on your phone.
*   The app will **Launch and provide basic navigation** even without any signal.
*   The **Settings** allow you to change the "Backend URL" to a local IP (e.g. `http://192.168.1.10:8000`) if you have a local server running in your village.

---

**🌿 Grama AI is built for the common man — Connectivity should never be a barrier.** 🌿
