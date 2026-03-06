import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import { InterviewProvider } from "@/contexts/InterviewContext";
import { ResultsProvider } from "@/contexts/ResultsContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationToast from "@/components/common/NotificationToast";
import PricingDialog from "@/pages/Pricing/PricingDialog";
import routes from "@/constants/routes";
import AuthPage from "./pages/Auth/AuthPage";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import ProtectedRoute from "./routes/ProtectedRoute";
import Profile from "./pages/Profile/Profile";
import { PricingProvider } from "@/contexts/PricingContext";
import Footer from "./components/layout/Footer";
import ResumeDashboard from "@/pages/Dashboard/ResumeDashboard";
import { useAuth } from "@/contexts/AuthContext";
import InterviewApp from "./pages/Interview/Interview";
import ResourcesHub from "./pages/Resources/Resources";
import JobSearch from "./pages/Job/JobSearch";
import SubjectsPage from "./pages/Subjects/SubjectsPage";
import SubjectDetailsPage from "./pages/Subjects/SubjectDetailsPage";
import { SubjectsProvider } from "./contexts/SubjectsContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import LessonDetailsPage from "./pages/Lessons/LessonDetailsPage";
import { LessonsProvider } from "./contexts/LessonsContext";
import InterviewHome from "./pages/Interview_round/InterviewHome";
import InterviewStart from "./pages/Interview_round/InterviewStart";
import InterviewRoomPage from "./pages/Interview_round/InterviewRoomPage";
import InterviewHistory from "./pages/Interview_round/InterviewHistory";
import InterviewResultsV2 from "./pages/Interview_round/InterviewResultsV2";
import InterviewSessionDetails from "./pages/Interview_round/InterviewSessionDetails";
import { AnalyticsProvider } from "./contexts/AnalyticsContext";
import AnalyticsTest from "./pages/Test/AnalyticsTest";
import ContactPage from "./pages/contact/ContactPage";
import JobsPublicPage from "./pages/JobsPublic";
import EmployeePortal from "./pages/Employee/EmployeePortal";
import ResumeBuilder from "./pages/ResumeBuilder";

const RedirectIfLoggedIn = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (user) return <Navigate to={routes.dashboard} replace />;
  return children;
};

function App() {
  const location = useLocation();

  // Pages where Navbar shouldn't show
  const hideNavbarRoutes = [
    routes.login,
    routes.signup,
    routes.verifyEmail,
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
  ];
  const shouldHideNavbar =
    hideNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/subjects/") ||
    location.pathname.startsWith("/lessons/") ||
    location.pathname.startsWith("/interview/start/") ||
    location.pathname.startsWith("/interview/room/") ||
    location.pathname.startsWith("/interview/results/") ||
    location.pathname.startsWith("/employee/");

  return (
    <NotificationProvider>
      <AnalyticsProvider>
        <PricingProvider>
          <InterviewProvider>
            <ResultsProvider>
              <PricingDialog />
              <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
                {!shouldHideNavbar && <Navbar />}

                <NotificationToast />

                <div className="flex-grow">
                  <Routes>
                    {/* Public Routes */}
                    <Route path={routes.home} element={<Home />} />
                    <Route path={routes.about} element={<About />} />
                    <Route path={routes.contact} element={<ContactPage />} />
                    <Route path={routes.jobsPublic} element={<JobsPublicPage />} />
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
                        <div className="flex min-h-screen">
                          <Sidebar />
                          <div className="flex-1">
                            <InterviewRoomPage />
                          </div>
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
