import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, MapPin, Clock, Building2, ExternalLink, Lock,
  Sparkles, Target, Zap, CheckCircle2, ArrowRight, IndianRupee,
  Search, TrendingUp, Star, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import routes from '@/constants/routes';
import Button from '@/components/ui/button';
import { fetchJobs, type Job } from '@/api/jobService';

/* ─── Static sample jobs ─────────────────────────────────────────────── */
const SAMPLE_JOBS = [
  {
    id: "s1",
    title: "SDE-2 — Backend",
    company: "Zepto",
    location: "Bengaluru, India",
    employment_type: "Full-time",
    salary: "₹25 – 35 LPA",
    tags: ["Node.js", "Golang", "Kafka", "PostgreSQL"],
    description: "Work on the core order fulfillment and inventory systems powering 10-minute grocery delivery at scale. You'll own micro-services end-to-end, from design to production.",
    badge: "Hiring now",
    badgeColor: "emerald",
  },
  {
    id: "s2",
    title: "Frontend Engineer",
    company: "Razorpay",
    location: "Remote · India",
    employment_type: "Full-time",
    salary: "₹18 – 28 LPA",
    tags: ["React", "TypeScript", "GraphQL", "Design Systems"],
    description: "Join the Payments UX tribe to build the checkout and dashboard experiences used by 8M+ businesses. Strong focus on performance, accessibility, and component architecture.",
    badge: "Remote-friendly",
    badgeColor: "blue",
  },
  {
    id: "s3",
    title: "Data Engineer",
    company: "PhonePe",
    location: "Bengaluru, India",
    employment_type: "Full-time",
    salary: "₹20 – 28 LPA",
    tags: ["Spark", "dbt", "Airflow", "BigQuery"],
    description: "Build and maintain the real-time and batch data pipelines that power PhonePe's analytics and ML infrastructure. Own data quality, latency SLAs, and pipeline observability.",
    badge: "High growth",
    badgeColor: "purple",
  },
  {
    id: "s4",
    title: "Backend Engineer — Platform",
    company: "Swiggy",
    location: "Bengaluru, India",
    employment_type: "Full-time",
    salary: "₹22 – 32 LPA",
    tags: ["Java", "Spring Boot", "Redis", "AWS"],
    description: "Own services within the restaurant and logistics platform that handles millions of orders daily. Focus on reliability, latency, and designing for 10× traffic spikes.",
    badge: "Series I",
    badgeColor: "orange",
  },
];

const badgeStyle: Record<string, string> = {
  emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50",
  blue:    "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50",
  purple:  "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50",
  orange:  "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50",
};

/* ─── Component ───────────────────────────────────────────────────────── */
const JobsPublicPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!user || !!localStorage.getItem('access_token');

  useEffect(() => {
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
  }, []);

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
            <span className="text-sm font-semibold tracking-wide">SMART JOB DISCOVERY</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-5"
          >
            Don't just apply.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
              Apply smart.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Browse curated roles from top companies. See your realistic match percentage before
            you apply — and prep for the exact interview questions that role requires.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="primary" className="px-8 py-4 text-base font-semibold w-full sm:w-auto shadow-lg shadow-blue-500/25" onClick={handleViewMore}>
              Browse All Jobs
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" className="px-8 py-4 text-base font-semibold w-full sm:w-auto" onClick={() => navigate('/interview_round')}>
              <Target className="w-5 h-5 mr-2" />
              Practice for a Role
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── What we offer ─────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">What We Offer</p>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Your Job Search, Upgraded
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              We don't just show you jobs. We help you understand your fit, prepare for the exact questions,
              and track your readiness — before you ever hit Apply.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Search className="w-6 h-6" />,
                title: "Role-Matched Listings",
                desc: "Every job is tagged with the skills, seniority, and tech stack it requires. Filter by what you know — not just by title.",
                bullets: ["Real JD skill mapping", "Seniority-level filters", "Remote / hybrid / on-site tags"],
                color: "blue",
              },
              {
                icon: <Target className="w-6 h-6" />,
                title: "Know Your Fit Before Applying",
                desc: "Run your resume against any JD instantly. Get a match percentage and a gap report that tells you exactly what to strengthen.",
                bullets: ["ATS keyword gap analysis", "Realistic match % score", "Know before you apply"],
                color: "indigo",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Prep for That Specific Role",
                desc: "See the interview questions most commonly asked for each role. Practice them in a live mock session with instant AI feedback.",
                bullets: ["Company-specific question sets", "Instant answer scoring", "Written model answers"],
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
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                  card.color === 'blue'    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                  card.color === 'indigo'  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
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
              { icon: <TrendingUp className="w-4 h-4" />, label: "100+ interviews taken" },
              { icon: <Briefcase className="w-4 h-4" />, label: "300+ resumes analyzed" },
              { icon: <Star className="w-4 h-4" />, label: "4.9 / 5 candidate rating" },
              { icon: <Building2 className="w-4 h-4" />, label: "Jobs from top Indian & global tech cos" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                <span className="text-blue-500 dark:text-blue-400">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample Jobs ───────────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Featured Roles</p>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
              Roles You Could Be Preparing For
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
              These are the kinds of opportunities our candidates regularly land.
              Sign up to access the full live listings and one-click prep paths.
            </p>
          </div>

          <div className="space-y-4">
            {SAMPLE_JOBS.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/8 transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-800">
                        <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {job.title}
                          </h3>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeStyle[job.badgeColor]}`}>
                            {job.badge}
                          </span>
                        </div>
                        <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">{job.company}</p>

                        <div className="flex flex-wrap gap-3 text-sm mb-3">
                          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs">
                            <MapPin className="w-3.5 h-3.5" />{job.location}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs">
                            <Clock className="w-3.5 h-3.5" />{job.employment_type}
                          </span>
                          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 px-2.5 py-1 rounded-md text-xs font-medium">
                            <IndianRupee className="w-3.5 h-3.5" />{job.salary}
                          </span>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-3">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {job.tags.map(tag => (
                            <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:w-40 flex-shrink-0">
                    <Button variant="primary" onClick={() => handleGate(null)} className="w-full justify-center text-sm">
                      {!isAuthenticated && <Lock className="w-3.5 h-3.5 mr-1.5" />}
                      Apply Now
                    </Button>
                    <Button variant="outline" className="w-full justify-center text-sm" onClick={() => navigate('/interview_round')}>
                      Prep for This
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live Jobs from API ─────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Live Listings</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
              Currently Open Roles
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
              Updated daily from our partner job boards and direct company postings.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto" />
              <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm font-medium">Fetching live listings…</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.length > 0 ? (
                jobs.map((job) => (
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
                      <div className="flex flex-col gap-2 md:w-36 flex-shrink-0">
                        <Button variant="primary" onClick={() => handleGate(job.redirect_url)} className="w-full justify-center text-sm">
                          {!isAuthenticated && <Lock className="w-3.5 h-3.5 mr-1.5" />}
                          Apply Now
                        </Button>
                        {job.redirect_url && (
                          <Button variant="outline" className="w-full justify-center text-sm" onClick={() => handleGate(job.redirect_url)}>
                            Details
                            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-700 dark:text-white mb-1">No live listings right now</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Check back soon — new roles are added daily.</p>
                </div>
              )}
            </div>
          )}

          {/* Login CTA */}
          {!isAuthenticated && !loading && (
            <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 text-center">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-5 text-blue-600 dark:text-blue-400">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unlock Full Access</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-7 max-w-lg mx-auto text-sm">
                Sign up for free to see hundreds of live listings, run resume-to-JD match checks,
                and prep for the exact questions those roles will throw at you.
              </p>
              <Button variant="primary" onClick={handleViewMore} className="px-8 py-3 h-auto text-base">
                Sign Up Free — No Card Needed
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default JobsPublicPage;
