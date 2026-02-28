import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as talent from '@google-cloud/talent';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CtsService {
    private readonly logger = new Logger(CtsService.name);
    private client: talent.v4beta1.JobServiceClient;
    private projectId: string;
    private parent: string;
    private enabled: boolean = false;

    constructor(private configService: ConfigService) {
        this.projectId = this.configService.get<string>('GCP_PROJECT_ID');
        this.parent = `projects/${this.projectId}/tenants/default_tenant`;

        try {
            this.client = new talent.v4beta1.JobServiceClient();
            this.enabled = true;
            this.logger.log(`CTS Client initialized for project: ${this.projectId}`);
        } catch (error) {
            this.logger.warn(`Failed to initialize CTS Client: ${error.message}. CTS integration disabled.`);
        }
    }

    private generateRequisitionId(adzunaId: string): string {
        return `req-${adzunaId}-${uuidv4().substring(0, 8)}`;
    }

    async createJob(jobData: any): Promise<string | null> {
        if (!this.enabled) {
            this.logger.debug('CTS disabled, skipping job creation');
            return null;
        }

        try {
            const job: any = {
                requisitionId: jobData.requisition_id || this.generateRequisitionId(jobData.adzuna_id),
                title: jobData.title || '',
                description: jobData.description || '',
                addresses: jobData.location ? [jobData.location] : [],
                applicationInfo: {
                    uris: jobData.redirect_url ? [jobData.redirect_url] : [],
                },
                languageCode: 'en-US',
            };

            if (jobData.salary_min && jobData.salary_max) {
                job.compensationInfo = {
                    entries: [{
                        type: 'BASE',
                        unit: 'YEARLY',
                        amount: {
                            currencyCode: jobData.salary_currency || 'USD',
                            units: parseInt(jobData.salary_min.toString(), 10),
                        },
                        range: {
                            minCompensation: {
                                currencyCode: jobData.salary_currency || 'USD',
                                units: parseInt(jobData.salary_min.toString(), 10),
                            },
                            maxCompensation: {
                                currencyCode: jobData.salary_currency || 'USD',
                                units: parseInt(jobData.salary_max.toString(), 10),
                            }
                        }
                    }]
                };
            }

            const customAttributes: any = {};
            if (jobData.is_remote) {
                customAttributes['remote'] = { stringValues: ['true'], filterable: true };
            }
            if (jobData.job_level) {
                customAttributes['level'] = { stringValues: [jobData.job_level], filterable: true };
            }

            if (Object.keys(customAttributes).length > 0) {
                job.customAttributes = customAttributes;
            }

            const [response] = await this.client.createJob({
                parent: this.parent,
                job,
            });

            this.logger.log(`Created CTS job: ${response.name}`);
            return response.name;

        } catch (error) {
            this.logger.error(`Failed to create job in CTS: ${error.message}`);
            return null;
        }
    }

    async updateJob(ctsJobName: string, jobData: any): Promise<string | null> {
        if (!this.enabled || !ctsJobName) return null;

        try {
            const job = {
                name: ctsJobName,
                title: jobData.title,
                description: jobData.description,
            };

            const [response] = await this.client.updateJob({ job });
            this.logger.log(`Updated CTS job: ${response.name}`);
            return response.name;
        } catch (error) {
            this.logger.error(`Failed to update job in CTS: ${error.message}`);
            return null;
        }
    }

    async deleteJob(ctsJobName: string): Promise<void> {
        if (!this.enabled || !ctsJobName) return;

        try {
            await this.client.deleteJob({ name: ctsJobName });
            this.logger.log(`Deleted CTS job: ${ctsJobName}`);
        } catch (error) {
            this.logger.error(`Failed to delete CTS job: ${error.message}`);
        }
    }
}
