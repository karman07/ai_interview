#!/usr/bin/env python3

import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("Available models:")
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"- {model.name}")

# Test a simple generation
try:
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Hello")
    print(f"\nTest successful with gemini-pro: {response.text[:50]}...")
except Exception as e:
    print(f"gemini-pro failed: {e}")

try:
    model = genai.GenerativeModel('gemini-1.5-pro')
    response = model.generate_content("Hello")
    print(f"Test successful with gemini-1.5-pro: {response.text[:50]}...")
except Exception as e:
    print(f"gemini-1.5-pro failed: {e}")