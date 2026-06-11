import os
import json
import google.generativeai as genai

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-3.5-flash')
else:
    model = None

def generate_feedback(code: str, language: str, problem_description: str) -> str:
    """Analyze code and provide AI feedback using Gemini."""
    if not model:
        return "AI evaluation unavailable. Please configure Gemini API Key."

    prompt = f"""
    Act as a Senior Software Engineer evaluating an intern's code submission.
    
    Problem Description:
    {problem_description}
    
    Intern's Code ({language}):
    ```
    {code}
    ```
    
    Provide a concise, professional evaluation covering:
    1. Code Review (Correctness & Readability)
    2. Complexity Analysis (Time and Space complexity O-notation)
    3. Strengths
    4. Weaknesses & Improvement Suggestions
    """

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API error: {e}")
        return "Error generating AI feedback."

def generate_assessment_content(topic: str, language: str) -> dict:
    if not model:
        raise Exception("Gemini API key not configured")

    prompt = f"""
    Act as a Senior Software Engineer creating a coding assessment for an intern.
    Topic: {topic}
    Target Language: {language}

    Return a raw JSON object (NO Markdown formatting, just the JSON) with the following structure:
    {{
        "title": "String - Catchy title for the problem",
        "description": "String - Full problem description in Markdown format. Include constraints and examples.",
        "test_cases": [
            {{"input": "String - The input format", "expected_output": "String - The expected output"}}
        ]
    }}
    Provide exactly 3 test cases. Ensure the JSON is completely valid and parsable.
    """

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())
    except Exception as e:
        print(f"Gemini generation error: {e}")
        raise e
