import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, MapPin, Clock, Building2, ExternalLink, Lock,
  Sparkles, Target, Zap, CheckCircle2, ArrowRight,
  Search, TrendingUp, Star, ChevronRight, LogIn,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import routes from '@/constants/routes';
import Button from '@/components/ui/button';
import { fetchJobs, type Job } from '@/api/jobService';
import { SEO } from '@/components/SEO';

/* ─── Component ───────────────────────────────────────────────────────── */
const JobsPublicPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!user || !!localStorage.getItem('access_token');

  // Only fetch real jobs for authenticated users
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    (async () => {
      try {
        const resp = await fetchJobs({ limit: 10 });
        setJobs(resp.jobs || []);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated]);

  const handleGate = (url?: string | null) => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate(routes.login);
    } else if (url) {
      window.open(url, '_blank');
    } else {
      navigate(routes.jobListings);
    }
  };

  const handleViewMore = () => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', routes.jobListings);
      navigate(routes.login);
    } else {
      navigate(routes.jobListings);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-500">
      <SEO 
        title="Job Listings - AI for Job"
        description="Browse curated job opportunities and AI-powered interview practice. Find your dream job and prepare with our Ai for job. Practice coding, behavioral, and technical interviews."
        keywords="job listings, job search, career opportunities, Ai for job practice, job preparation, tech jobs, software engineer jobs"
        url="https://aiforjob.ai/jobs"
      />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-slate-950">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[500px] bg-blue-500/8 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute right-[-80px] top-[120px] w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
            <span className="text-sm font-semibold tracking-wide">FIND ROLES WORTH YOUR TIME</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-5"
          >
            Know your fit before{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
              you apply.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Browse hand-picked roles from companies that are actually hiring. See how well
            you match — and walk into the interview already knowing what they'll ask.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="primary" className="px-8 py-4 text-base font-semibold w-full sm:w-auto shadow-lg shadow-blue-500/25" onClick={handleViewMore}>
              See All Open Roles
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" className="px-8 py-4 text-base font-semibold w-full sm:w-auto" onClick={() => navigate('/interview_round')}>
              <Target className="w-5 h-5 mr-2" />
              Practice for a Specific Role
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── What we offer ─────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">More Than a Job Board</p>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              We help you show up prepared
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Anyone can send you a list of jobs. We help you understand where you stand,
              what's missing, and how to fix it — before the interview.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Search className="w-6 h-6" />,
                title: "Jobs that actually match you",
                desc: "Every listing is tagged by the skills, seniority, and tech stack it needs. Filter by what you know — not just by job title.",
                bullets: ["Skill-mapped job descriptions", "Seniority-level filters", "Remote / hybrid / on-site tags"],
                color: "blue",
              },
              {
                icon: <Target className="w-6 h-6" />,
                title: "See your fit before applying",
                desc: "Drop your resume against any JD. Get a match score and a plain-English gap report — so you know what to work on before you hit send.",
                bullets: ["ATS keyword gap analysis", "Realistic match % score", "No more guessing"],
                color: "indigo",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Prep for the exact questions",
                desc: "See what interviewers at each company actually ask. Practice in a live mock session and get instant feedback on your answers.",
                bullets: ["Company-specific question sets", "Instant answer scoring", "Written model answers included"],
                color: "emerald",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 hover:border-blue-400/50 dark:hover:border-blue-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${card.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                  card.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
                    'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  }`}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{card.desc}</p>
                <ul className="space-y-1.5">
                  {card.bullets.map((b, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Social proof strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-10 border-t border-slate-200 dark:border-slate-800">
            {[
              { icon: <TrendingUp className="w-4 h-4" />, label: "100+ mock interviews completed" },
              { icon: <Briefcase className="w-4 h-4" />, label: "300+ resumes analyzed" },
              { icon: <Star className="w-4 h-4" />, label: "4.9 / 5 from candidates" },
              { icon: <Building2 className="w-4 h-4" />, label: "Roles from top Indian & global tech cos" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                <span className="text-blue-500 dark:text-blue-400">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Jobs Section ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Fresh Listings</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
              What's open right now
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
              Pulled daily from our partner boards and direct company postings. No stale listings.
            </p>
          </div>

          {/* Unauthenticated: lock gate — no fake jobs shown */}
          {!isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              {/* Blurred fake rows for atmosphere */}
              <div className="space-y-3 p-6 blur-sm pointer-events-none select-none" aria-hidden="true">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/5" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/5" />
                    </div>
                    <div className="w-24 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex-shrink-0" />
                  </div>
                ))}
              </div>

              {/* Lock overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 dark:bg-slate-950/80 backdrop-blur-[2px] px-6 py-10 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-200 dark:border-blue-700">
                  <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  Sign in to see live job listings
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-7 max-w-sm">
                  Create a free account to browse hundreds of real, verified openings — curated daily from top companies.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="primary" onClick={() => { localStorage.setItem('redirectAfterLogin', routes.jobListings); navigate(routes.signup); }} className="px-7 py-3 h-auto font-semibold">
                    <LogIn className="w-4 h-4 mr-2" />
                    Create free account
                  </Button>
                  <Button variant="outline" onClick={() => { localStorage.setItem('redirectAfterLogin', routes.jobListings); navigate(routes.login); }} className="px-7 py-3 h-auto font-semibold">
                    Sign in
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto" />
              <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm font-medium">Grabbing the latest roles…</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.length > 0 ? (
                <>
                  {jobs.map((job) => (
                    <div
                      key={job.job_id}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:border-blue-500/40 transition-all duration-300 group shadow-sm hover:shadow-md"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-800">
                              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {job.title}
                              </h3>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{job.company}</p>
                              <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                                {job.location && (
                                  <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                    <MapPin className="w-3 h-3" />{job.location}
                                  </span>
                                )}
                                {job.employment_type && (
                                  <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                    <Clock className="w-3 h-3" />{job.employment_type}
                                  </span>
                                )}
                                {(job.salary_min > 0 || job.salary_max > 0) && (
                                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 px-2 py-0.5 rounded">
                                    ${job.salary_min}–${job.salary_max}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">
                                {job.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 md:w-40 flex-shrink-0">
                          <Button variant="primary" onClick={() => handleGate(job.redirect_url)} className="w-full justify-center text-sm">
                            Apply Now
                          </Button>
                          {job.redirect_url && (
                            <Button variant="outline" className="w-full justify-center text-sm" onClick={() => window.open(job.redirect_url!, '_blank')}>
                              See Details
                              <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <Button variant="outline" onClick={() => navigate(routes.jobListings)} className="px-8 py-3 h-auto font-semibold">
                      Browse all listings
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-700 dark:text-white mb-1">Nothing live at the moment</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">New roles get added every day — worth checking back soon.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default JobsPublicPage;

