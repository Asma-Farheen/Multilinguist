import os
from dotenv import load_dotenv
import httpx
import asyncio

load_dotenv(".env")
key = os.getenv("GROQ_API_KEY")
print(f"Key loaded: {bool(key)}")

async def test_groq():
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {
        "model": "llama3-8b-8192",
        "messages": [{"role": "user", "content": "hi"}],
        "max_tokens": 10
    }
    
    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(url, json=payload, headers=headers)
            print("Status Code:", res.status_code)
            print("Response:", res.text)
    except Exception as e:
        print("Exception:", e)

if __name__ == "__main__":
    asyncio.run(test_groq())
