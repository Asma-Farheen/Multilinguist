# 🏆 Grama AI - Complete Offline Hackathon Setup 🚀

Follow these **5 Steps** to run your Grama AI 100% offline at the hackathon venue (No Internet Required!).

---

### **🛡️ STEP 1: Install the Local "Brain" (Ollama)**
1.  **Download & Install:** [https://ollama.com/download](https://ollama.com/download)
2.  **Open your Terminal** (Command Prompt or PowerShell).
3.  **Pull the Multi-lingual Language Model:**
    ```bash
    ollama pull llama3.1:8b
    ```
    *(Tip: Do this Step while you still have good internet!)*

---

### **🛠️ STEP 2: Configure your Backend for Local Mode**
1.  Open the file: `backend/.env`
2.  **Delete the Groq lines** and replace them with:
    ```env
    BACKEND_MODE=local
    OLLAMA_URL=http://localhost:11434/api/chat
    GROQ_MODEL=llama3.1:8b
    ```

---

### **🎙️ STEP 3: Install Local Speech-to-Text (Whisper)**
To transcribe your voice without the internet, you need to install the Whisper library.
1.  Open your backend folder:
    ```bash
    cd backend
    pip install -r requirements.txt
    pip install openai-whisper torch
    ```
2.  The backend will now automatically use your **CPU/GPU** to recognize your voice instead of the cloud!

---

### **🚀 STEP 4: Start the System Locally**

1.  **Start the Backend:**
    ```bash
    cd backend
    python main.py
    ```
    *(It will start on http://localhost:8000)*

2.  **Start the Frontend:**
    ```bash
    cd frontend
    python -m http.server 9999
    ```
    *(It will start on http://localhost:9999)*

---

### **📱 STEP 5: Use it on your Phone (Offline Village Mode)**

If you want to show it on a phone at the hackathon:
1.  Connect your phone and laptop to the **same Wi-Fi router** (even if the router has no internet).
2.  Find your **Laptop's IP Address** (e.g., `192.168.1.5`).
3.  On your phone's browser, open: `http://192.168.1.5:9999`
4.  Go to **⚙️ Settings** inside Grama AI on the phone.
5.  Change **Backend URL** to: `http://192.168.1.5:8000`
6.  **Success!** You now have a mini "Village Server" where everyone can talk to the AI 100% offline!

---

**🌿 Grama AI — Empowering Villages, with or without Internet.** 🌿
