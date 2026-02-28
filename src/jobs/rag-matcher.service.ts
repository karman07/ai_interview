import { Injectable } from '@nestjs/common';

@Injectable()
export class RagMatcherService {
    private readonly TECH_SKILLS = new Set([
        'python', 'java', 'javascript', 'typescript', 'react', 'angular', 'vue',
        'node', 'nodejs', 'django', 'flask', 'fastapi', 'spring', 'sql', 'nosql',
        'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes', 'aws',
        'azure', 'gcp', 'api', 'rest', 'graphql', 'microservices', 'agile', 'scrum',
        'git', 'ci/cd', 'devops', 'machine learning', 'ml', 'ai', 'data science',
        'tensorflow', 'pytorch', 'pandas', 'numpy', 'spark', 'hadoop', 'kafka',
        'android', 'ios', 'swift', 'kotlin', 'flutter', 'react native', 'html',
        'css', 'sass', 'webpack', 'elasticsearch', 'rabbitmq', 'testing',
        'junit', 'pytest', 'selenium', 'cypress', 'c++', 'golang', 'rust', 'scala',
        'ruby', 'php', 'laravel', 'rails', '.net', 'c#', 'asp.net', 'blazor'
    ]);

    private readonly STOP_WORDS = new Set([
        'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has',
        'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was',
        'will', 'with', 'we', 'you', 'your', 'our', 'this', 'should', 'can',
        'may', 'must', 'have', 'had', 'but', 'or', 'not', 'been', 'which'
    ]);

    private cleanText(text: string): string {
        let cleaned = text.toLowerCase();
        cleaned = cleaned.replace(/http\S+|www\S+/g, '');
        cleaned = cleaned.replace(/\S+@\S+/g, '');
        cleaned = cleaned.replace(/[^a-z0-9\s\+#\.\-]/g, ' ');
        return cleaned.replace(/\s+/g, ' ').trim();
    }

    private extractKeywords(text: string, topN: number = 30): Array<[string, number]> {
        const cleanedText = this.cleanText(text);
        const words = cleanedText.split(' ');
        const wordFreq = new Map<string, number>();

        const bigrams: string[] = [];

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (word.length < 2) continue;

            if (!this.STOP_WORDS.has(word)) {
                wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
            }

            if (i < words.length - 1) {
                const nextWord = words[i + 1];
                if (nextWord.length >= 2) {
                    bigrams.push(`${word} ${nextWord}`);
                }
            }
        }

        for (const bigram of bigrams) {
            wordFreq.set(bigram, (wordFreq.get(bigram) || 0) + 0.5);
        }

        for (const [word, count] of wordFreq.entries()) {
            if (this.TECH_SKILLS.has(word)) {
                wordFreq.set(word, count * 2.0);
            }
        }

        const sortedKeywords = Array.from(wordFreq.entries()).sort((a, b) => b[1] - a[1]).slice(0, topN);

        if (sortedKeywords.length > 0) {
            const maxFreq = sortedKeywords[0][1];
            return sortedKeywords.map(([word, freq]) => [word, freq / maxFreq]);
        }
        return [];
    }

    private extractSkills(text: string): Set<string> {
        const cleanedText = this.cleanText(text);
        const foundSkills = new Set<string>();

        for (const skill of this.TECH_SKILLS) {
            if (cleanedText.includes(skill)) {
                foundSkills.add(skill);
            }
        }
        return foundSkills;
    }

    private calculateKeywordMatch(resumeKeywords: Array<[string, number]>, jobText: string): number {
        if (resumeKeywords.length === 0) return 0.0;

        const jobTextClean = this.cleanText(jobText);
        let totalWeight = 0.0;
        let matchedWeight = 0.0;

        for (const [keyword, weight] of resumeKeywords) {
            totalWeight += weight;

            if (jobTextClean.includes(keyword)) {
                let positionBonus = 1.0;
                const keywordPos = jobTextClean.indexOf(keyword);

                if (keywordPos < 200) positionBonus = 1.5;
                else if (keywordPos < 500) positionBonus = 1.2;

                const regex = new RegExp(keyword, 'g');
                const matches = jobTextClean.match(regex);
                const occurrences = Math.min(matches ? matches.length : 0, 3);

                matchedWeight += weight * positionBonus * Math.sqrt(occurrences);
            }
        }

        if (totalWeight === 0) return 0.0;
        return Math.min(matchedWeight / totalWeight, 1.0);
    }

    private calculateSkillMatch(resumeSkills: Set<string>, jobText: string): number {
        if (resumeSkills.size === 0) return 0.0;

        const jobSkills = this.extractSkills(jobText);
        if (jobSkills.size === 0) return 0.0;

        let intersectionCount = 0;
        for (const skill of resumeSkills) {
            if (jobSkills.has(skill)) {
                intersectionCount++;
            }
        }

        const union = new Set([...resumeSkills, ...jobSkills]).size;
        if (union === 0) return 0.0;

        return intersectionCount / union;
    }

    private calculateTextSimilarity(text1: string, text2: string): number {
        const words1 = new Set(this.cleanText(text1).split(' '));
        const words2 = new Set(this.cleanText(text2).split(' '));

        for (const stopWord of this.STOP_WORDS) {
            words1.delete(stopWord);
            words2.delete(stopWord);
        }

        if (words1.size === 0 || words2.size === 0) return 0.0;

        let intersectionCount = 0;
        for (const word of words1) {
            if (words2.has(word)) intersectionCount++;
        }

        const union = new Set([...words1, ...words2]).size;
        if (union === 0) return 0.0;

        return intersectionCount / union;
    }

    public matchResumeToJob(resumeText: string, job: any): number {
        const resumeKeywords = this.extractKeywords(resumeText, 40);
        const resumeSkills = this.extractSkills(resumeText);

        const jobTitle = job.title || '';
        const jobDescription = job.description || '';
        const jobCompany = job.company_display_name || '';
        const jobFullText = `${jobTitle} ${jobTitle} ${jobDescription} ${jobCompany}`;

        const keywordScore = this.calculateKeywordMatch(resumeKeywords, jobFullText);
        const skillScore = this.calculateSkillMatch(resumeSkills, jobFullText);
        const textSimScore = this.calculateTextSimilarity(resumeText.slice(0, 1000), jobFullText.slice(0, 1000));

        const titleMatch = this.calculateKeywordMatch(resumeKeywords.slice(0, 10), jobTitle);

        const finalScore = (
            keywordScore * 0.35 +
            skillScore * 0.35 +
            textSimScore * 0.15 +
            titleMatch * 0.15
        );

        return Math.min(finalScore, 1.0);
    }
}
