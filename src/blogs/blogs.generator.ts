import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { AiConfigService } from '../ai-config/ai-config.service';

const CATEGORIES = ['Interview Prep', 'Resume Building', 'Career Growth', 'Technical Skills', 'AI in Recruitment'];

const IMAGES = [
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600",
  "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600",
  "https://images.unsplash.com/photo-1507537295325-2df920f01de6?q=80&w=600",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600",
  "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600"
];

const AUTHORS = ['Karman Singh', 'Rahat Bhatia', 'Advitya Dua'];

@Injectable()
export class BlogsGeneratorService {
  private readonly logger = new Logger(BlogsGeneratorService.name);
  private readonly blogsDir = path.join(process.cwd(), 'blogs_content');

  constructor(private readonly aiConfigService: AiConfigService) {}

  @Cron('0 0 * * *') // Runs everyday at midnight
  async handleDailyBlog() {
    this.logger.log('Starting daily blog generation via Groq...');
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const randomImage = IMAGES[Math.floor(Math.random() * IMAGES.length)];
    const randomAuthor = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
    
    const prompt = `
You are an expert tech career writer.
Pick a hot trending topic in the category: '${cat}'.
Write a complete useful markdown blog post of about 400-600 words.

Output EXACTLY in this format with the frontmatter at the top:
---
title: "A Unique Title Here"
slug: "a-unique-slug-here"
category: "${cat}"
author: "${randomAuthor}"
date: "${new Date().toISOString().split('T')[0]}"
excerpt: "Catchy 1 sentence excerpt describing the contents."
coverImage: "Provide a real high-quality absolute Unsplash image URL that matches the article topic perfectly if you have one. If you are unsure and can't provide a living absolute URL, write EXCLUSIVELY 'DEFAULT_IMAGE'."
---

# [Title]

## Introduction
## Important Concepts / Strategies
## Pro Tips
## Conclusion
`;

    try {
      const groqKey = await this.aiConfigService.getActiveKey('groq');
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      let content = res.data.choices[0].message.content;
      const slugMatch = content.match(/slug:\s*"([^"]+)"/);
      const slug = slugMatch ? slugMatch[1] : `daily-blog-${Date.now()}`;
      
      const coverImageMatch = content.match(/coverImage:\s*"([^"]+)"/);
      const coverImage = coverImageMatch ? coverImageMatch[1] : 'DEFAULT_IMAGE';

      if (coverImage === 'DEFAULT_IMAGE' || !coverImage.startsWith('http')) {
         const fallback = IMAGES[Math.floor(Math.random() * IMAGES.length)];
         content = content.replace(/coverImage:\s*"Provide a real high-quality absolute Unsplash[^"]+"/, `coverImage: "${fallback}"`);
         content = content.replace(/coverImage:\s*"DEFAULT_IMAGE"/, `coverImage: "${fallback}"`);
      }

      const filePath = path.join(this.blogsDir, `${slug}.md`);
      
      // Ensure directory exists just in case
      if (!fs.existsSync(this.blogsDir)) {
          fs.mkdirSync(this.blogsDir, { recursive: true });
      }

      fs.writeFileSync(filePath, content);
      this.logger.log(`✅ Daily blog generated and saved: ${slug}.md`);
    } catch (err) {
      this.logger.error('❌ Failed to generate daily blog:', err);
    }
  }
}
