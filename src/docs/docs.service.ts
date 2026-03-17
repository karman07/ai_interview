import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocsService {
  private readonly docsDir = path.join(__dirname, '..', '..', '..', 'docs_content');

  getDocsTree() {
    if (!fs.existsSync(this.docsDir)) {
      fs.mkdirSync(this.docsDir, { recursive: true });
    }

    const topics = fs.readdirSync(this.docsDir);
    const tree = topics
      .filter(topic => fs.statSync(path.join(this.docsDir, topic)).isDirectory())
      .map(topic => {
        const topicPath = path.join(this.docsDir, topic);

        const buildTree = (currentPath: string): any[] => {
          const items = fs.readdirSync(currentPath, { withFileTypes: true });
          const nodes: any[] = [];
          for (const item of items) {
            const itemPath = path.join(currentPath, item.name);
            if (item.isDirectory()) {
                nodes.push({
                    name: item.name,
                    isFolder: true,
                    children: buildTree(itemPath)
                });
            } else if (item.name.endsWith('.md')) {
                const relativePath = path.relative(topicPath, itemPath).replace('.md', '');
                const slug = relativePath.toLowerCase().replace(/ /g, '-').replace(/\//g, '--');
                nodes.push({
                    name: item.name.replace('.md', ''),
                    isFolder: false,
                    slug: slug
                });
            }
          }
          return nodes;
        };

        const topLevelChildren = buildTree(topicPath);

        // We still need a flat list of ALL subtopics to maintain backward compatible counts in cards
        const flatSubtopics: any[] = [];
        const flatten = (nodesList: any[]) => {
            for (const n of nodesList) {
                if (n.isFolder) flatten(n.children);
                else flatSubtopics.push(n);
            }
        };
        flatten(topLevelChildren);

        return {
          topic,
          children: topLevelChildren,
          subtopics: flatSubtopics // used on landing card counts index
        };
      });

    return tree;
  }

  getDocContent(topicName: string, subtopicSlug: string) {
    const topicPath = path.join(this.docsDir, topicName);
    if (!fs.existsSync(topicPath)) {
      throw new NotFoundException('Topic not found');
    }

    const findFileBySlug = (currentPath: string, targetSlug: string): string | null => {
      const items = fs.readdirSync(currentPath, { withFileTypes: true });
      for (const item of items) {
         const itemPath = path.join(currentPath, item.name);
         if (item.isDirectory()) {
             const found = findFileBySlug(itemPath, targetSlug);
             if (found) return found;
         } else if (item.name.endsWith('.md')) {
             const relative = path.relative(topicPath, itemPath).replace('.md', '');
             const slug = relative.toLowerCase().replace(/ /g, '-').replace(/\//g, '--');
             if (slug === targetSlug) return itemPath;
         }
      }
      return null;
    };

    const filePath = findFileBySlug(topicPath, subtopicSlug);
    if (!filePath) {
      throw new NotFoundException('Subtopic not found');
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return { content };
  }
}
