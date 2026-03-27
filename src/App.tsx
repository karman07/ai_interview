import { lazy, Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
// Home is the landing page — keep eager for instant first paint
import Home from "@/pages/Home";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import { InterviewProvider } from "@/contexts/InterviewContext";
import { ResultsProvider } from "@/contexts/ResultsContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationToast from "@/components/common/NotificationToast";
import NotificationPrompt from "@/components/common/NotificationPrompt";
import routes from "@/constants/routes";
import { PricingProvider } from "@/contexts/PricingContext";
import Footer from "./components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/layout/ScrollToTop";
import WebVitalsMonitor from "@/components/common/WebVitalsMonitor";
import { SubjectsProvider } from "./contexts/SubjectsContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import { LessonsProvider } from "./contexts/LessonsContext";
import { AnalyticsProvider } from "./contexts/AnalyticsContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import UniversityRoute from "./routes/UniversityRoute";
import RollNumberDialog from "@/components/common/RollNumberDialog";

// ── Lazy-loaded pages (each becomes its own JS chunk) ─────────────────────
const About                   = lazy(() => import("@/pages/About"));
const PricingPage             = lazy(() => import("@/pages/Pricing/PricingPage"));
const PricingDialog           = lazy(() => import("@/pages/Pricing/PricingDialog"));
const ContactPage             = lazy(() => import("@/pages/contact/ContactPage"));
const JobsPublicPage          = lazy(() => import("@/pages/JobsPublic"));
const PrivacyPolicy           = lazy(() => import("@/pages/Legal/PrivacyPolicy"));
const TermsOfService          = lazy(() => import("@/pages/Legal/TermsOfService"));
const CookiePolicy            = lazy(() => import("@/pages/Legal/CookiePolicy"));
const AuthPage                = lazy(() => import("./pages/Auth/AuthPage"));
const VerifyEmail             = lazy(() => import("./pages/Auth/VerifyEmail"));
const VerifyPhone             = lazy(() => import("./pages/Auth/VerifyPhone"));
const UniversityLogin         = lazy(() => import('./pages/Auth/UniversityLogin'));
const StudentDashboard        = lazy(() => import('./pages/Student/StudentDashboard'));
const Profile                 = lazy(() => import("./pages/Profile/Profile"));
const ResumeDashboard         = lazy(() => import("@/pages/Dashboard/ResumeDashboard"));
const InterviewApp            = lazy(() => import("./pages/Interview/Interview"));
const ResourcesHub            = lazy(() => import("./pages/Resources/Resources"));
const JobSearch               = lazy(() => import("./pages/Job/JobSearch"));
const SubjectsPage            = lazy(() => import("./pages/Subjects/SubjectsPage"));
const SubjectDetailsPage      = lazy(() => import("./pages/Subjects/SubjectDetailsPage"));
const LessonDetailsPage       = lazy(() => import("./pages/Lessons/LessonDetailsPage"));
const InterviewHome           = lazy(() => import("./pages/Interview_round/InterviewHome"));
const InterviewStart          = lazy(() => import("./pages/Interview_round/InterviewStart"));
const InterviewRoomPage       = lazy(() => import("./pages/Interview_round/InterviewRoomPage"));
const InterviewHistory        = lazy(() => import("./pages/Interview_round/InterviewHistory"));
const InterviewResultsV2      = lazy(() => import("./pages/Interview_round/InterviewResultsV2"));
const InterviewSessionDetails = lazy(() => import("./pages/Interview_round/InterviewSessionDetails"));
const AnalyticsTest           = lazy(() => import("./pages/Test/AnalyticsTest"));
const EmployeePortal          = lazy(() => import("./pages/Employee/EmployeePortal"));
const ResumeBuilder           = lazy(() => import("./pages/ResumeBuilder"));
const FeedbackInbox           = lazy(() => import("@/pages/Student/FeedbackInbox"));
const StudentAssignments      = lazy(() => import("@/pages/Student/Assignments"));
const StudentClasses          = lazy(() => import("@/pages/Student/Classes"));
const StudentClassDetail      = lazy(() => import("@/pages/Student/ClassDetail"));
const BlogsPage               = lazy(() => import("@/pages/Blogs/BlogsPage"));
const BlogDetailPage          = lazy(() => import("@/pages/Blogs/BlogDetailPage"));

// ── Minimal loading fallback (no layout shift) ────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const RedirectIfLoggedIn = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={routes.dashboard} replace />;
  return children;
};

import { useNotifications } from "@/hooks/useNotifications";

const NotificationHandler = () => {
  const { user } = useAuth();
  useNotifications(user?._id);
  return null;
};

function App() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Pages where Navbar shouldn't show
  const hideNavbarRoutes = [
    routes.login,
    routes.signup,
    routes.verifyEmail,
    routes.verifyPhone,
    routes.universityLogin,
    routes.profile,
    routes.dashboard,
    routes.interview,
    routes.resources,
    routes.jobListings,
    '/employee',
    routes.subjects,
    routes.subjectDetails,
    routes.lessonDetails,
    routes.interviewHome,
    routes.interviewHistory,
    routes.resumeBuilder,
    routes.studentFeedback,
    routes.studentAssignments,
    routes.studentClasses,
  ];
  const shouldHideNavbar =
    hideNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/subjects/") ||
    location.pathname.startsWith("/lessons/") ||
    location.pathname.startsWith("/interview/start/") ||
    location.pathname.startsWith("/interview/room/") ||
    location.pathname.startsWith("/interview/results/") ||
    location.pathname.startsWith("/employee/") ||
    location.pathname.startsWith("/student/classes/");

  return (
    <NotificationProvider>
      <NotificationHandler />
      <AnalyticsProvider userId={user?._id} isAdmin={user?.role === 'admin'}>
        <PricingProvider>
          <InterviewProvider>
            <ResultsProvider>
              <ScrollToTop />
              <WebVitalsMonitor />
              <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
                {!shouldHideNavbar && <Navbar />}

                <NotificationToast />

                <Suspense fallback={<PageLoader />}>
                  {/* PricingDialog is lazy — rendered inside Suspense */}
                  <PricingDialog />
                  {/* Roll number gate — only shows for students missing rollNumber */}
                  <RollNumberDialog />

                  <div className="flex-grow">
                    <Routes>
                    {/* Public Routes */}
                    <Route path={routes.home} element={<Home />} />
                    <Route path={routes.about} element={<About />} />
                    <Route path={routes.pricing} element={<PricingPage />} />
                    <Route path={routes.contact} element={<ContactPage />} />
                    <Route path={routes.jobsPublic} element={<JobsPublicPage />} />
                    <Route path={routes.blogs} element={<BlogsPage />} />
                    <Route path={routes.blogDetail(":slug")} element={<BlogDetailPage />} />
                    <Route path={routes.privacy} element={<PrivacyPolicy />} />
                    <Route path={routes.terms} element={<TermsOfService />} />
                    <Route path={routes.cookies} element={<CookiePolicy />} />
                    <Route
                      path={routes.interview}
                      element={
                        <div className="flex min-h-screen">
                          <Sidebar />
                          <div className="flex-1">
                            <InterviewApp />
                          </div>
                        </div>
                      }
                    />

                    <Route
                      path={routes.jobListings}
                      element={
                        <div className="flex min-h-screen">
                          <Sidebar />
                          <div className="flex-1">
                            <JobSearch />
                          </div>
                        </div>
                      }
                    />

                    <Route
                      path={routes.resources}
                      element={
                        <div className="flex min-h-screen">
                          <Sidebar />
                          <div className="flex-1">
                            <ResourcesHub />
                          </div>
                        </div>
                      }
                    />
                    <Route path="/analytics-test" element={<AnalyticsTest />} />

                    {/* Auth Routes */}
                    <Route
                      path={routes.login}
                      element={
                        <RedirectIfLoggedIn>
                          <AuthPage />
                        </RedirectIfLoggedIn>
                      }
                    />
                    <Route
                      path={routes.signup}
                      element={
                        <RedirectIfLoggedIn>
                          <AuthPage />
                        </RedirectIfLoggedIn>
                      }
                    />

                    {/* Verify Email - accessible after signup before backend login logic */}
                    <Route path={routes.verifyEmail} element={<VerifyEmail />} />

                    {/* Verify Phone - requires JWT, accessible while logged in but phone unverified */}
                    <Route path={routes.verifyPhone} element={<VerifyPhone />} />

                    {/* University Student Login */}
                    <Route
                      path={routes.universityLogin}
                      element={
                        <RedirectIfLoggedIn>
                          <UniversityLogin />
                        </RedirectIfLoggedIn>
                      }
                    />

                    {/* Student Dashboard — redirect to main dashboard (students use the same UI with university limits) */}
                    <Route path={routes.studentDashboard} element={<Navigate to={routes.dashboard} replace />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route
                        path={routes.dashboard}
                        element={
                          <div className="flex min-h-screen">
                            <Sidebar />
                            <div className="flex-1">
                              <ResumeDashboard />
                            </div>
                          </div>
                        }
                      />

                      {/* Employee Portal - Single Route */}
                      <Route path="/employee" element={<div className="flex min-h-screen"><Sidebar /><div className="flex-1"><EmployeePortal /></div></div>} />

                      <Route path={routes.profile} element={
                        <div className="flex min-h-screen">
                          <Sidebar />
                          <div className="flex-1">
                            <Profile />
                          </div>
                        </div>
                      } />
                      <Route path={routes.interviewHome} element={
                        <div className="flex min-h-screen">
                          <Sidebar />
                          <div className="flex-1">
                            <InterviewHome />
                          </div>
                        </div>
                      }
                      />
                      <Route path={routes.interviewStart(":type")} element={
                        <div className="flex min-h-screen">
                          <Sidebar />
                          <div className="flex-1">
                            <InterviewStart />
                          </div>
                        </div>
                      }
                      />
                      <Route path={routes.interviewRoom(":type")} element={
                        <div className="flex-1">
                          <InterviewRoomPage />
                        </div>
                      } />

                      <Route path={routes.interviewHistory} element={
                        <div className="flex min-h-screen">
                          <Sidebar />
                          <div className="flex-1">
                            <InterviewHistory />
                          </div>
                        </div>
                      } />

                      <Route path="/interview/results/:sessionId" element={
                        <div className="flex min-h-screen">
                          <Sidebar />
                          <div className="flex-1">
                            <InterviewResultsV2 />
                          </div>
                        </div>
                      } />
                      <Route path="/interview/details/:sessionId" element={
                        <div className="flex min-h-screen">
                          <Sidebar />
                          <div className="flex-1">
                            <InterviewSessionDetails />
                          </div>
                        </div>
                      } />
                      <Route path={routes.resumeBuilder} element={<ResumeBuilder />} />

                      {/* University-only Routes */}
                      <Route element={<UniversityRoute />}>
                        <Route path={routes.studentFeedback} element={
                          <div className="flex min-h-screen">
                            <Sidebar />
                            <div className="flex-1">
                              <FeedbackInbox />
                            </div>
                          </div>
                        } />
                        <Route path={routes.studentAssignments} element={
                          <div className="flex min-h-screen">
                            <Sidebar />
                            <div className="flex-1">
                              <StudentAssignments />
                            </div>
                          </div>
                        } />
                        <Route path={routes.studentClasses} element={
                          <div className="flex min-h-screen">
                            <Sidebar />
                            <div className="flex-1">
                              <StudentClasses />
                            </div>
                          </div>
                        } />
                        <Route path={routes.studentClassDetail(":id")} element={
                          <div className="flex min-h-screen">
                            <Sidebar />
                            <div className="flex-1">
                              <StudentClassDetail />
                            </div>
                          </div>
                        } />
                      </Route>
                    </Route>

                    <Route element={<ProtectedRoute />}>
                      <Route
                        path={routes.subjects}
                        element={
                          <div className="flex min-h-screen">
                            <Sidebar />
                            <div className="flex-1">
                              <SubjectsProvider>
                                <ProgressProvider>
                                  <SubjectsPage />
                                </ProgressProvider>
                              </SubjectsProvider>
                            </div>
                          </div>
                        }
                      />

                      <Route
                        path={routes.subjectDetails(":id")}
                        element={
                          <div className="flex min-h-screen">
                            <Sidebar />
                            <div className="flex-1">
                              <SubjectsProvider>
                                <ProgressProvider>
                                  <LessonsProvider>
                                    <SubjectDetailsPage />
                                  </LessonsProvider>
                                </ProgressProvider>
                              </SubjectsProvider>
                            </div>
                          </div>
                        }
                      />
                      <Route
                        path={routes.lessonDetails(":subjectId")}
                        element={
                          <div className="flex min-h-screen">
                            {/* <Sidebar /> */}
                            <div className="flex-1">
                              <SubjectsProvider>
                                <ProgressProvider>
                                  <LessonsProvider>
                                    <LessonDetailsPage />
                                  </LessonsProvider>
                                </ProgressProvider>
                              </SubjectsProvider>
                            </div>
                          </div>
                        }
                      />
                    </Route>



                    {/* Catch-all: redirect unknown routes to home */}
                    <Route path="*" element={<Navigate to={routes.home} replace />} />
                  </Routes>
                  </div>
                </Suspense>

                {!shouldHideNavbar && <Footer />}
              </div>
            </ResultsProvider>
          </InterviewProvider>
        </PricingProvider>
      </AnalyticsProvider>
    </NotificationProvider>
  );
}

export default App;
