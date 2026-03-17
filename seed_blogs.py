import os
import json
import requests
import datetime
import random
from dotenv import load_dotenv

# Read local Env files
load_dotenv()
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
OUTPUT_DIR = "/Users/karmansingh/Desktop/work/ai_interview/backend/blogs_content"

categories = ['Interview Prep', 'Resume Building', 'Career Growth', 'Technical Skills', 'AI in Recruitment']

# High-quality real absolute image URLs
IMAGES = [
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600",
    "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600",
    "https://images.unsplash.com/photo-1507537295325-2df920f01de6?q=80&w=600",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600",
    "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600"
]

AUTHORS = ['Karman Singh', 'Rahat Bhatia', 'Advitya Dua']

topics = [
    "How explicitly explain Big O Cognitive Maps during Live Walkthroughs",
    "Optimizing GraphQL nodes setups over standard CRUD buffers layouts",
    "Decoding AI-assisted hiring filters: What managers look for in descriptions",
    "Handling System Design bottlenecks explicitly: Load balancer nodes framing",
    "Microservice boundaries: Avoid distributed monolith overlaps boundary structures",
    "Beating Interview Burnout: Pacing stress thresholds seamlessly diagnostics setup",
    "Building your first CI/CD boundary test pipeline from scratch bundles",
    "The STAR Framework: Dimensioning behavioral fragments cleanly templates setups",
    "From Junior to Senior: Mental paradigm thresholds mapped implicitly frame layouts",
    "Optimizing Database indexing strategies for massive tables scaling benchmarks"
]

def generate_blog(topic, category):
    slug = topic.lower().replace(" ", "-").replace(":", "").replace(",", "").replace("/", "")
    print(f"Generating for: {topic} ...")
    
    prompt = f"""
    You are a professional HR and Technical content writer.
    Generate a complete markdown blog with the following details:
    Topic: {topic}
    Category: {category}

    Output EXACTLY in this format with the frontmatter at the top:
    ---
    title: "{topic}"
    slug: "{slug}"
    category: "{category}"
    author: "{random.choice(AUTHORS)}"
    date: "{datetime.date.today().isoformat()}"
    excerpt: "A short catchy 1 sentence summary of the article."
    coverImage: "{random.choice(IMAGES)}"
    ---

    # {topic}

    Follow this structure in markdown:
    ## Introduction
    ## Core Points (use bullet points or emojis)
    ## Golden Rules / Pro Tips
    ## Conclusion
    """

    res = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }
    )

    if res.status_code == 200:
        content = res.json()["choices"][0]["message"]["content"]
        filepath = os.path.join(OUTPUT_DIR, f"{slug}.md")
        # Write file
        with open(filepath, "w") as f:
            f.write(content)
        print(f"✅ Created {filepath}")
    else:
        print(f"❌ Failed to generate: {res.text}")

# Trigger loops
for i in range(10):
    cat = categories[i % len(categories)]
    generate_blog(topics[i], cat)
