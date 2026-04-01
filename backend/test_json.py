import asyncio
from dotenv import load_dotenv
import main
import json

load_dotenv(".env")
main.GROQ_API_KEY = main.os.getenv("GROQ_API_KEY")

async def test():
    print("Testing call_groq_json...")
    sys_prompt = "You are Grama AI for rural India. Detect the language of the user's input. Answer the question natively in the EXACT same language (e.g. if Telugu, write Telugu script). Keep it to 2 simple sentences. Return ONLY valid JSON: {\"answer\": \"your answer\", \"lang_code\": \"te-IN/hi-IN/ta-IN/kn-IN/ml-IN/en-IN/etc\"}"
    question = "వ్యవసాయంలో నీటిపారుదల ఎలా పెంచాలి?" # Telugu question
    res = await main.call_groq_json(question, sys_prompt)
    print("AI Response:", json.dumps(res, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    asyncio.run(test())
