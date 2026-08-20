import os
import google.generativeai as genai

# Load API key from .env file
from dotenv import load_dotenv
load_dotenv("apps/api/.env")

API_KEY = os.getenv("GEMINI_API_KEY")

print("=" * 50)
print("GEMINI API TEST")
print("=" * 50)

if not API_KEY:
    print("❌ GEMINI_API_KEY not found in .env file!")
    print("   Please add: GEMINI_API_KEY=your_key_here")
    exit(1)

print(f"✅ API Key found: {API_KEY[:15]}...{API_KEY[-10:]}")

try:
    # Configure Gemini
    genai.configure(api_key=API_KEY)
    
    # List available models
    print("\n📋 Available Models:")
    models = genai.list_models()
    gemini_models = [m.name for m in models if "gemini" in m.name]
    
    if gemini_models:
        print(f"   ✅ Found {len(gemini_models)} Gemini models:")
        for model in gemini_models[:5]:
            print(f"      - {model}")
    else:
        print("   ❌ No Gemini models found")
    
    # Test with a simple prompt
    print("\n🧪 Testing with simple prompt...")
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    response = model.generate_content(
        "Say 'Hello! Gemini is working correctly.' in exactly one sentence."
    )
    
    print(f"✅ SUCCESS! Response: {response.text}")
    print("\n🎉 Gemini API is working correctly!")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    print("\nPossible issues:")
    print("   1. API key is invalid or expired")
    print("   2. API key doesn't have Gemini access")
    print("   3. Network issue")