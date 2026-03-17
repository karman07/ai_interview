import os
import requests
import json
import time

# Load env variables if utilizing python-dotenv
from dotenv import load_dotenv
load_dotenv(dotenv_path="/Users/karmansingh/Desktop/work/ai_interview/backend/.env")

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
DOCS_DIR = "/Users/karmansingh/Desktop/work/ai_interview/backend/docs_content"

def get_seo_topics():
    prompt = """
    You are an expert tech blog optimizer. Give me a JSON list of 4 deep Master Themes to document today.
    Example master themes: "Mobile App Development", "Backend Engineering", "Machine Learning & AI", "System Architecture"
    
    For EACH Master Theme:
    Provide 3 "sub_topics_folders" (e.g., "Flutter", "React Native", "Android Native").
    Inside each sub_folder, provide 4 "inner_folders" (e.g., "Dart Core", "State Management", "UI Widgets", "APIs & Networking").
    Inside those, provide 5 Articles each.
    
    Return STRICTLY this structure:
    [
       {
         "topic": "Mobile App Development",
         "subtopic_folders": [
            {
               "folder": "Flutter",
               "inner_folders": [
                  {
                     "name": "State Management",
                     "articles": [
                        {"name": "Riverpod with StateNotifier", "slug": "flutter-riverpod"},
                        {"name": "Clean Architecture with Bloc", "slug": "flutter-bloc"}
                     ]
                  }
               ]
            }
         ]
       }
    ]
    """
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7
    }
    try:
        res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=data)
        content = res.json()['choices'][0]['message']['content']
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        return json.loads(content)
    except Exception as e:
        print(f"Failed to fetch themes: {e}")
        return []

def generate_seo_article(topic, subtopic):
    prompt = f"""
    Write a 1200-word, high-SEO-ranking technical guide on '{subtopic}' for the category '{topic}'.
    Make sure to include:
    1. A SEO Meta Title & Meta Description at the top using standard text titles like `**Meta Title:**` and `**Meta Description:**`. **Do NOT use markdown tables or preformatted codeblocks for meta content.**
    2. # Main Title
    3. ## Detailed H2 Subheadings
    4. Code snippets to enhance authority.
    5. Bold keywords like architecture, scalability, latency where accurate.
    Ensure perfect Markdown formatting.
    """
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.6
    }
    try:
        res = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=data)
        return res.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"Failed article: {e}")
        return None

def run_daily_cron():
    print("🚀 Running daily 4-Level SEO document builder...")
    topics_list = get_seo_topics()
    
    if not topics_list:
        print("No topics returned. Aborting.")
        return

    # Delete everything inside currently to fulfill "remove all the data for now"
    import shutil
    if os.path.exists(DOCS_DIR):
        print("Purging current docs index folders...")
        for t in os.listdir(DOCS_DIR):
             t_path = os.path.join(DOCS_DIR, t)
             if os.path.isdir(t_path):
                 shutil.rmtree(t_path)

    for item in topics_list:
        topic_name = item['topic']
        topic_path = os.path.join(DOCS_DIR, topic_name)

        if 'subtopic_folders' not in item:
            continue

        for group in item['subtopic_folders']:
            folder_name = group.get('folder', 'General')
            group_path = os.path.join(topic_path, folder_name)

            for inner in group.get('inner_folders', []):
                inner_name = inner.get('name', 'General')
                final_path = os.path.join(group_path, inner_name)
                os.makedirs(final_path, exist_ok=True)

                for art in inner.get('articles', []):
                    art_name = art['name']
                    slug_name = art['slug']
                    file_path = os.path.join(final_path, f"{slug_name}.md")

                    print(f"Generating for {topic_name} -> {folder_name} -> {inner_name} -> {art_name}")
                    content = generate_seo_article(topic_name, art_name)

                    if content:
                        with open(file_path, "w") as f:
                            f.write(content)
                        print(f"✅ Created 4-Tier SEO doc: {slug_name}.md")
                    time.sleep(10)

if __name__ == "__main__":
    print("Auto docs generation is currently disabled.")
    # while True:
    #     try:
    #         run_daily_cron()
    #     except Exception as e:
    #         print(f"Cron iteration crashed: {e}")
    #     print("\n🎉 Seeding finished for today! Sleeping for 24 hours...")
    #     time.sleep(86400)
