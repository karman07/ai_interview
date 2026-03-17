import os
import requests
from dotenv import load_dotenv

load_dotenv(dotenv_path="/Users/karmansingh/Desktop/work/ai_interview/backend/.env")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

docs_content_dir = "/Users/karmansingh/Desktop/work/ai_interview/backend/docs_content"

def generate_robust_doc(topic, subtopic):
    prompt = f"""
    You are an expert technical documentation writer.
    Write a 800-1000 word comprehensive guide on: '{subtopic}' inside the category: '{topic}'.
    
    Structure it perfectly using Markdown:
    - Use # Main Title for the top title
    - Use ## Subheadings for core sections (e.g. ## Overview, ## Core Concepts)
    - Use code blocks ```sql or ```python if relevant
    - Include Bullet points and bold text where emphasizing key definitions.
    
    Make it look elite and fully complete for a software engineering guide.
    """
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    
    try:
        res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=data)
        return res.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"Error {e}")
        return None

for topic in os.listdir(docs_content_dir):
    topic_path = os.path.join(docs_content_dir, topic)
    if os.path.isdir(topic_path):
        for file in os.listdir(topic_path):
            if file.endswith(".md"):
                subtopic = file.replace(".md", "")
                print(f"Generating robust doc for {topic} -> {subtopic}...")
                content = generate_robust_doc(topic, subtopic)
                if content:
                    with open(os.path.join(topic_path, file), "w") as f:
                        f.write(content)
                    print(f"✅ Created robust file: {file}")

print("Done generating all docs!")
