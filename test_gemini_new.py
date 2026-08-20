import os
from dotenv import load_dotenv

# Load API key from .env file
load_dotenv("apps/api/.env")

API_KEY = os.getenv("GEMINI_API_KEY")

print("=" * 50)
print("GEMINI API TEST (NEW SDK)")
print("=" * 50)

if not API_KEY:
    print("❌ GEMINI_API_KEY not found in .env file!")
    exit(1)

print(f"✅ API Key found: {API_KEY[:15]}...{API_KEY[-10:]}")

try:
    # Try different import styles
    try:
        # Style 1: New SDK
        from google import genai
        client = genai.Client(api_key=API_KEY)
        print("✅ Using google.genai client (Style 1)")
    except ImportError:
        try:
            # Style 2: Alternative import
            import google.genai as genai
            client = genai.Client(api_key=API_KEY)
            print("✅ Using google.genai client (Style 2)")
        except ImportError:
            try:
                # Style 3: Old SDK (fallback)
                import google.generativeai as genai
                genai.configure(api_key=API_KEY)
                model = genai.GenerativeModel("gemini-1.5-flash")
                print("✅ Using google.generativeai client (Style 3 - deprecated)")
                
                # Test with old SDK
                response = model.generate_content(
                    "Say 'Hello! Gemini is working correctly.' in exactly one sentence."
                )
                print(f"✅ SUCCESS! Response: {response.text}")
                print("\n🎉 Gemini API is working correctly!")
                exit(0)
            except ImportError:
                print("❌ No Gemini SDK found. Please install: pip install google-genai")
                exit(1)
    
    # If using new SDK, test it
    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents="Say 'Hello! Gemini is working correctly with the new SDK.' in exactly one sentence."
    )
    
    print(f"✅ SUCCESS! Response: {response.text}")
    print("\n🎉 Gemini API is working correctly!")

except Exception as e:
    print(f"\n❌ ERROR: {e}")
    print("\nPossible issues:")
    print("   1. API key is invalid or expired")
    print("   2. The specified model is not accessible")
    print("   3. Network issue")