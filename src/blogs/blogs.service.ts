import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface BlogMeta {
  title: string;
  slug: string;
  category: string;
  author: string;
  date: string;
  excerpt: string;
  coverImage: string;
}

export interface Blog extends BlogMeta {
  content: string;
}

@Injectable()
export class BlogsService {
  private readonly contentDir = path.resolve(process.cwd(), 'blogs_content');

  constructor() {
    if (!fs.existsSync(this.contentDir)) {
      fs.mkdirSync(this.contentDir, { recursive: true });
    }
  }

  private parseFrontMatter(fileContent: string): { meta: BlogMeta; content: string } {
    const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n[\s\S]*)$/);
    if (!match) {
      return { meta: {} as BlogMeta, content: fileContent };
    }

    const yamlStr = match[1];
    const content = match[2].trim();
    const meta: any = {};

    yamlStr.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').trim().replace(/^["'](.*)["']$/, '$1'); // strips outer quotes
        meta[key] = value;
      }
    });

    return { meta: meta as BlogMeta, content };
  }

  async getAll(opts?: { category?: string; search?: string }): Promise<BlogMeta[]> {
    if (!fs.existsSync(this.contentDir)) return [];
    const files = fs.readdirSync(this.contentDir).filter(f => f.endsWith('.md'));
    const list: BlogMeta[] = [];

    files.forEach(file => {
      const filePath = path.join(this.contentDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { meta } = this.parseFrontMatter(fileContent);
      if (meta.title) {
        let match = true;
        if (opts?.category && meta.category?.toLowerCase() !== opts.category.toLowerCase()) match = false;
        if (opts?.search && !meta.title.toLowerCase().includes(opts.search.toLowerCase()) && !meta.excerpt?.toLowerCase().includes(opts.search.toLowerCase())) match = false;
        
        if (match) list.push(meta);
      }
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getBySlug(slug: string): Promise<Blog> {
    const files = fs.readdirSync(this.contentDir).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(this.contentDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { meta, content } = this.parseFrontMatter(fileContent);
      if (meta.slug === slug) {
        return { ...meta, content };
      }
    }
    throw new NotFoundException('Blog not found');
  }

  async create(dto: { title: string; slug: string; category: string; content: string; excerpt: string; coverImage?: string }, author = 'Admin'): Promise<{ filename: string }> {
    const filename = `${dto.slug || Date.now()}.md`;
    const filePath = path.join(this.contentDir, filename);

    const yaml = [
      '---',
      `title: "${dto.title.replace(/"/g, "'")}"`,
      `slug: "${dto.slug}"`,
      `category: "${dto.category}"`,
      `author: "${author}"`,
      `date: "${new Date().toISOString().slice(0, 10)}"`,
      `excerpt: "${dto.excerpt.replace(/"/g, "'")}"`,
      `coverImage: "${dto.coverImage || ''}"`,
      '---',
      '',
      dto.content,
    ].join('\n');

    fs.writeFileSync(filePath, yaml, 'utf-8');
    return { filename };
  }
}
