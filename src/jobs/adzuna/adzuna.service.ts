import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class AdzunaService {
    private readonly logger = new Logger(AdzunaService.name);
    private readonly BASE_URL = 'https://api.adzuna.com/v1/api';
    private client: AxiosInstance;
    private appId: string;
    private appKey: string;
    private country: string;
    private resultsPerPage: number;

    constructor(private configService: ConfigService) {
        this.appId = this.configService.get<string>('ADZUNA_APP_ID');
        this.appKey = this.configService.get<string>('ADZUNA_APP_KEY');
        this.country = this.configService.get<string>('ADZUNA_COUNTRY', 'us');
        this.resultsPerPage = this.configService.get<number>('ADZUNA_RESULTS_PER_PAGE', 50);

        this.client = axios.create({
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; JobMatchBot/1.0)',
            },
        });
    }

    private buildUrl(endpoint: string, countryCode: string = this.country): string {
        return `${this.BASE_URL}/jobs/${countryCode}/${endpoint}`;
    }

    private async makeRequestWithRetry(endpoint: string, countryCode: string = this.country, params: any = {}, retries = 2): Promise<any> {
        const url = this.buildUrl(endpoint, countryCode);
        const requestParams = {
            app_id: this.appId,
            app_key: this.appKey,
            results_per_page: this.resultsPerPage,
            ...params
        };

        for (let attempt = 1; attempt <= retries + 1; attempt++) {
            try {
                this.logger.log(`Calling Adzuna API: ${url}`);
                const response = await this.client.get(url, { params: requestParams });
                return response.data;
            } catch (error) {
                if (attempt === retries + 1) {
                    this.logger.error(`Adzuna request failed after ${attempt} attempts: ${error.message} Data: ${JSON.stringify(error.response?.data)}`);
                    throw new HttpException(`API returned error: ${error.message}`, HttpStatus.BAD_GATEWAY);
                }
                const waitTime = Math.min(Math.pow(2, attempt) * 1000, 15000);
                this.logger.warn(`Adzuna API retry attempt ${attempt} failed. Waiting ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    async searchJobs(what?: string, page: number = 1, countryCode: string = this.country): Promise<any> {
        const endpoint = `search/${page}`;
        const params: any = {};
        if (what) params.what = what;

        this.logger.log(`Searching Adzuna: page=${page}, what=${what}, country=${countryCode}`);
        return await this.makeRequestWithRetry(endpoint, countryCode, params);
    }

    async fetchAllJobs(maxPages: number = 5, what?: string, countryCode: string = this.country): Promise<any[]> {
        const allJobs: any[] = [];
        let page = 1;

        this.logger.log(`Starting job fetch (max ${maxPages} pages, ${this.resultsPerPage} per page, what='${what}', country='${countryCode}')`);

        while (page <= maxPages) {
            try {
                const result = await this.searchJobs(what, page, countryCode);
                const jobs = result.results || [];

                if (jobs.length === 0) {
                    this.logger.log(`No more jobs found at page ${page}`);
                    break;
                }

                allJobs.push(...jobs);
                const count = result.count || 0;
                const totalFetched = page * this.resultsPerPage;

                this.logger.log(`Fetched page ${page}/${maxPages}: ${jobs.length} jobs (total: ${allJobs.length}/${count})`);

                if (totalFetched >= count) {
                    this.logger.log(`Reached end of results (total available: ${count})`);
                    break;
                }
                page++;
            } catch (error) {
                this.logger.error(`Failed to fetch page ${page}: ${error.message}`);
                if (allJobs.length > 0) {
                    this.logger.log(`Returning ${allJobs.length} jobs fetched before error`);
                }
                break;
            }
        }

        this.logger.log(`Total jobs fetched from Adzuna: ${allJobs.length}`);
        return allJobs;
    }

    async getJobCategories(countryCode: string = this.country): Promise<any[]> {
        const result = await this.makeRequestWithRetry('categories', countryCode);
        return result.results || [];
    }

    parseJobData(job: any): any {
        const titleLower = (job.title || '').toLowerCase();
        const descriptionLower = (job.description || '').toLowerCase();

        const internshipKeywords = ['intern', 'internship', 'co-op', 'coop'];
        const isInternship = internshipKeywords.some(kw => titleLower.includes(kw) || descriptionLower.includes(kw));

        let jobLevel = 'MID_LEVEL';
        if (isInternship || titleLower.includes('entry') || titleLower.includes('junior')) {
            jobLevel = 'ENTRY_LEVEL';
        } else if (['senior', 'lead', 'principal'].some(kw => titleLower.includes(kw))) {
            jobLevel = 'SENIOR_LEVEL';
        } else if (['director', 'vp', 'chief', 'head of'].some(kw => titleLower.includes(kw))) {
            jobLevel = 'EXECUTIVE';
        }

        let employmentType = 'FULL_TIME';
        const contractType = (job.contract_type || '').toLowerCase();
        const contractTime = (job.contract_time || '').toLowerCase();

        if (isInternship) {
            employmentType = 'INTERNSHIP';
        } else if (contractTime.includes('part') || contractType.includes('part_time')) {
            employmentType = 'PART_TIME';
        } else if (contractType.includes('contract') || contractType.includes('temporary')) {
            employmentType = 'CONTRACTOR';
        }

        const remoteKeywords = ['remote', 'work from home', 'wfh', 'telecommute'];
        const isRemote = remoteKeywords.some(kw => titleLower.includes(kw) || descriptionLower.includes(kw));

        const locationData = job.location || {};

        return {
            adzuna_id: job.id,
            title: job.title,
            description: job.description,
            company_display_name: job.company?.display_name,
            location: locationData.display_name,
            location_structured: {
                city: locationData.area && locationData.area.length > 3 ? locationData.area[3] : null,
                state: locationData.area && locationData.area.length > 1 ? locationData.area[1] : null,
                country: locationData.area && locationData.area.length > 0 ? locationData.area[0] : null,
                lat: locationData.latitude,
                lon: locationData.longitude,
            },
            employmentType,
            jobLevel,
            salary_min: job.salary_min,
            salary_max: job.salary_max,
            salary_currency: 'USD',
            category: job.category?.label,
            contract_time: job.contract_time,
            redirect_url: job.redirect_url,
            is_internship: isInternship,
            is_remote: isRemote,
            raw_data: job,
        };
    }
}
