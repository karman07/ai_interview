import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { AiConfigService } from '../ai-config/ai-config.service';

const CATEGORIES = ['Interview Prep', 'Resume Building', 'Career Growth', 'Technical Skills', 'AI in Recruitment'];

const IMAGES = [
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=600',
  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600',
  'https://images.unsplash.com/photo-1507537295325-2df920f01de6?q=80&w=600',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600',
  'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=600',
];

const AUTHORS = ['Karman Singh', 'Rahat Bhatia', 'Advitya Dua'];

@Injectable()
export class BlogsGeneratorService implements OnModuleInit {
  private readonly logger = new Logger(BlogsGeneratorService.name);
  private readonly blogsDir = path.join(process.cwd(), 'blogs_content');
  private readonly DAILY_TARGET = 2;

  constructor(private readonly aiConfigService: AiConfigService) {}

  async onModuleInit() {
    try {
      await this.ensureBlogCountForToday(this.DAILY_TARGET);
    } catch (err) {
      this.logger.error('Failed startup blog bootstrap:', err);
    }
  }

  private getBlogCountForDate(date: string): number {
    if (!fs.existsSync(this.blogsDir)) return 0;
    const files = fs.readdirSync(this.blogsDir).filter((f) => f.endsWith('.md'));
    let count = 0;
    files.forEach((file) => {
      const content = fs.readFileSync(path.join(this.blogsDir, file), 'utf-8');
      const match = content.match(/^date:\s*"?(\d{4}-\d{2}-\d{2})"?\s*$/m);
      if (match?.[1] === date) count += 1;
    });
    return count;
  }

  private async ensureBlogCountForToday(minCount: number) {
    const today = new Date().toISOString().split('T')[0];
    const existing = this.getBlogCountForDate(today);
    if (existing >= minCount) {
      this.logger.log(`Blog target already met for ${today} (${existing}/${minCount})`);
      return;
    }

    const missing = minCount - existing;
    this.logger.log(`Generating ${missing} blog(s) for ${today} to reach ${minCount}/day target...`);
    for (let i = 0; i < missing; i += 1) {
      const result = await this.generateDailyBlog();
      if (result.success) {
        this.logger.log(`✅ Daily blog generated and saved: ${result.slug}.md`);
      } else {
        this.logger.error(`❌ Failed to generate daily blog: ${result.error}`);
      }
    }
  }

  @Cron('0 0 * * *') // Runs everyday at midnight
  async handleDailyBlog() {
    this.logger.log(`Starting daily blog generation (${this.DAILY_TARGET} blogs)...`);
    for (let i = 0; i < this.DAILY_TARGET; i += 1) {
      const result = await this.generateDailyBlog();
      if (result.success) {
        this.logger.log(`✅ Daily blog generated and saved: ${result.slug}.md`);
      } else {
        this.logger.error(`❌ Failed to generate daily blog: ${result.error}`);
      }
    }
  }

  async generateDailyBlog() {
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
      const apiKey = await this.aiConfigService.getActiveKey('gemini');
      const model = await this.aiConfigService.getActiveModel('gemini');

      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      let content = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error('No content returned from Gemini');

      const slugMatch = content.match(/slug:\s*"([^"]+)"/);
      let slug = slugMatch ? slugMatch[1] : `daily-blog-${Date.now()}`;

      const coverImageMatch = content.match(/coverImage:\s*"([^"]+)"/);
      const coverImage = coverImageMatch ? coverImageMatch[1] : 'DEFAULT_IMAGE';

      if (coverImage === 'DEFAULT_IMAGE' || !coverImage.startsWith('http')) {
        const fallback = IMAGES[Math.floor(Math.random() * IMAGES.length)];
        content = content.replace(/coverImage:\s*"Provide a real high-quality absolute Unsplash[^"]+"/, `coverImage: "${fallback}"`);
        content = content.replace(/coverImage:\s*"DEFAULT_IMAGE"/, `coverImage: "${fallback}"`);
      }

      let filePath = path.join(this.blogsDir, `${slug}.md`);
      if (fs.existsSync(filePath)) {
        slug = `${slug}-${Date.now()}`;
        filePath = path.join(this.blogsDir, `${slug}.md`);
      }

      if (!fs.existsSync(this.blogsDir)) {
        fs.mkdirSync(this.blogsDir, { recursive: true });
      }

      fs.writeFileSync(filePath, content);
      return { success: true, slug };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.logger.error('❌ Failed to generate daily blog:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // Safety check every 6 hours to guarantee at least two blogs for the current day.
  @Cron('0 */6 * * *')
  async ensureDailyBlogExists() {
    await this.ensureBlogCountForToday(this.DAILY_TARGET);
  }
}
