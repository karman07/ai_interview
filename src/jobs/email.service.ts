import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { JobService } from './job.service';
import { RagMatcherService } from './rag-matcher.service';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly jobService: JobService,
        private readonly ragMatcherService: RagMatcherService,
    ) { }

    async sendEmail(toEmail: string, subject: string, bodyHtml: string): Promise<boolean> {
        try {
            await this.mailerService.sendMail({
                to: toEmail,
                subject: subject,
                html: bodyHtml,
                // The 'from' address is generally configured globally in AppModule or via ENV
            });
            this.logger.log(`Email sent successfully to ${toEmail}.`);
            return true;
        } catch (error) {
            this.logger.error(`Unexpected error sending email to ${toEmail}: ${error.message}`);
            return false;
        }
    }

    async sendPersonalizedEmails(frequency?: string, email?: string): Promise<void> {
        this.logger.log(`Starting scheduled personalized email delivery (freq=${frequency || 'ALL'}, email=${email || 'ALL'})`);

        try {
            let subscriptions = [];
            if (email) {
                // We'd need to add `getSubscriptionByEmail` to JobService.
                // Assuming `getAllSubscriptions` might get all. We can filter for now.
                const allSubs = await this.jobService['emailSubscriptionsModel'].find({ email: email }).exec();
                if (allSubs) subscriptions = allSubs;
            } else {
                // Fetch active subscriptions with a matching frequency.
                // Assuming we use mongoose to find all subscriptions enabled.
                const query: any = { is_enabled: true };
                if (frequency) query.frequency = frequency;
                subscriptions = await this.jobService['emailSubscriptionsModel'].find(query).exec();
            }

            // Get a batch of active jobs to match against
            // In python, it fetched 'active' jobs matching specific constraints.
            // We will fetch up to 5000 active jobs to do semantic match.
            const [candidateJobs] = await this.jobService.getJobsWithFilters({}, 0, 5000);

            for (const sub of subscriptions) {
                const subEmail = sub.email;
                const resumeText = sub.resume_text || '';

                if (!resumeText) {
                    this.logger.warn(`No resume found for ${subEmail}, skipping`);
                    continue;
                }

                try {
                    // Filter candidate jobs by subscription hard preferences first
                    const filteredCandidates = candidateJobs.filter(job => {
                        if (sub.internship_only && !job.is_internship) return false;
                        if (sub.stipend_min) {
                            const minValid = job.salary_min && job.salary_min >= sub.stipend_min;
                            const maxValid = job.salary_max && job.salary_max >= sub.stipend_min;
                            if (!minValid && !maxValid) return false;
                        }
                        if (sub.job_level && job.job_level !== sub.job_level) return false;
                        // For location, a simple includes check if sub requested location
                        if (sub.location && job.location && !job.location.toLowerCase().includes(sub.location.toLowerCase())) return false;
                        return true;
                    });

                    // Score jobs
                    const scoredJobs: { job: any, score: number }[] = [];
                    for (const job of filteredCandidates) {
                        const score = this.ragMatcherService.matchResumeToJob(resumeText, job);
                        if (score > 0.05) {
                            scoredJobs.push({ job, score });
                        }
                    }

                    scoredJobs.sort((a, b) => b.score - a.score);
                    const topJobs = scoredJobs.slice(0, 10).map(item => item.job);

                    if (!topJobs || topJobs.length === 0) {
                        this.logger.log(`No matching jobs found for ${subEmail}`);
                        continue;
                    }

                    let jobListHtml = "<ul style='list-style-type: none; padding: 0;'>";
                    for (const job of topJobs) {
                        jobListHtml += `
                        <li style='margin-bottom: 20px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'>
                            <h3 style='margin: 0 0 10px 0; color: #1a202c; font-size: 18px;'>${job.title}</h3>
                            <p style='margin: 5px 0; color: #4a5568;'><strong>Company:</strong> ${job.company_display_name || 'Unknown'}</p>
                            <p style='margin: 5px 0; color: #4a5568;'><strong>Location:</strong> ${job.location || 'Not specified'}</p>
                            <a href='${job.redirect_url || '#'}' style='display: inline-block; margin-top: 15px; padding: 10px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;'>View Job Details</a>
                        </li>
                        `;
                    }
                    jobListHtml += "</ul>";

                    const bodyHtml = `
                    <html>
                    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                        <h2 style='color: #2c3e50;'>Your Personalized Job Matches</h2>
                        <p>Based on your resume and preferences, here are the top ${topJobs.length} job opportunities for you:</p>
                        ${jobListHtml}
                        <hr style='margin: 30px 0; border: none; border-top: 1px solid #e0e0e0;'>
                        <p style='font-size: 12px; color: #95a5a6;'>
                            You're receiving this because you subscribed to job alerts at aiforjob.ai<br>
                            <a href='#' style='color: #3498db;'>Update preferences</a> | <a href='#' style='color: #e74c3c;'>Unsubscribe</a>
                        </p>
                    </body>
                    </html>
                    `;

                    await this.sendEmail(
                        subEmail,
                        `🎯 ${topJobs.length} Personalized Job Matches for You`,
                        bodyHtml
                    );
                    this.logger.log(`Sent ${topJobs.length} job matches to ${subEmail}`);

                } catch (error) {
                    this.logger.error(`Error matching jobs for ${subEmail}: ${error.message}`);
                    continue;
                }
            }

            this.logger.log(`Personalized email delivery completed for ${subscriptions.length} users`);
        } catch (error) {
            this.logger.error(`Personalized email delivery failed: ${error.message}`);
        }
    }
}
