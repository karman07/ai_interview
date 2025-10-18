import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import { InterviewProvider } from "@/contexts/InterviewContext";
import { ResultsProvider } from "@/contexts/ResultsContext";
import PricingPage from "@/pages/Pricing/Pricing";
import routes from "@/constants/routes";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ProtectedRoute from "./routes/ProtectedRoute";
import Profile from "./pages/Profile/Profile";
import CompleteProfile from "./pages/Profile/CompleteProfile";
import { PricingProvider } from "@/contexts/PricingContext";
import Footer from "./components/layout/Footer";
import ResumeDashboard from "@/pages/Dashboard/ResumeDashboard";
// import { userStore } from "@/api/http";
import { useAuth } from "@/contexts/AuthContext";
import InterviewApp from "./pages/Interview/Interview";
import ResourcesHub from "./pages/Resources/Resources";
import JobSearchApp from "./pages/Job/JobSearch";
import SubjectsPage from "./pages/Subjects/SubjectsPage";
import SubjectDetailsPage from "./pages/Subjects/SubjectDetailsPage";
import { SubjectsProvider } from "./contexts/SubjectsContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import LessonDetailsPage from "./pages/Lessons/LessonDetailsPage";
import { LessonsProvider } from "./contexts/LessonsContext";
import InterviewHome from "./pages/Interview_round/InterviewHome";
import InterviewStart from "./pages/Interview_round/InterviewStart";
import InterviewRoomPage from "./pages/Interview_round/InterviewRoomPage";
// import { AnalyticsProvider } from '@/contexts/AnalyticsContext';

import { AnalyticsProvider } from "./contexts/AnalyticsContext";
import AnalyticsTest from "./pages/Test/AnalyticsTest";
import { DSAQuestionsProvider } from "./contexts/DSAQuestionsContext";
import { DSAProgressProvider } from "./contexts/DSAProgressContext";
import { CodeExecutionProvider } from "./contexts/CodeExecutionContext";
import DSADashboard from "./pages/DSA/DSADashboard";
import DSAQuestionsList from "./pages/DSA/DSAQuestionsList";
import DSAQuestionSolvePage from "./pages/DSA/DSAQuestionSolvePage";

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
    routes.profile,
    routes.completeProfile,
    routes.dashboard,
    routes.interview,
    routes.resources,
    routes.jobListings,
    routes.subjects,
    routes.subjectDetails,
    routes.lessonDetails,
    routes.interviewHome,
    routes.dsaDashboard,
    routes.dsaQuestions,
  ];
  const shouldHideNavbar =
    hideNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/subjects/") ||
    location.pathname.startsWith("/lessons/") ||
    location.pathname.startsWith("/interview/start/") ||
    location.pathname.startsWith("/interview/room/") ||
    location.pathname.startsWith("/dsa/");

  return (
    <AnalyticsProvider>
      <PricingProvider>
        <div className="bg-gray-50 min-h-screen flex flex-col">
          {!shouldHideNavbar && <Navbar />}

          <div className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path={routes.home} element={<Home />} />
            <Route path={routes.about} element={<About />} />
            <Route
              path={routes.interview}
              element={
                <div className="flex min-h-screen">
                  <Sidebar />
                  <div className="flex-1">
                    <InterviewProvider>
                      <ResultsProvider>
                        <InterviewApp />
                      </ResultsProvider>
                    </InterviewProvider>
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
                    <JobSearchApp />
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
            <Route path={routes.pricing} element={<PricingPage />} />

            {/* Login / Signup with redirect if already logged in */}
            <Route
              path={routes.login}
              element={
                <RedirectIfLoggedIn>
                  <Login />
                </RedirectIfLoggedIn>
              }
            />
            <Route
              path={routes.signup}
              element={
                <RedirectIfLoggedIn>
                  <Signup />
                </RedirectIfLoggedIn>
              }
            />

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

              <Route path={routes.profile} element={<Profile />} />
              <Route
                path={routes.completeProfile}
                element={<CompleteProfile />}
              />
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

            {/* DSA Routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path={routes.dsaDashboard}
                element={
                  <div className="flex min-h-screen">
                    <Sidebar />
                    <div className="flex-1">
                      <DSAQuestionsProvider>
                        <DSAProgressProvider>
                          <DSADashboard />
                        </DSAProgressProvider>
                      </DSAQuestionsProvider>
                    </div>
                  </div>
                }
              />
              <Route
                path={routes.dsaQuestions}
                element={
                  <div className="flex min-h-screen">
                    <Sidebar />
                    <div className="flex-1">
                      <DSAQuestionsProvider>
                        <DSAProgressProvider>
                          <DSAQuestionsList />
                        </DSAProgressProvider>
                      </DSAQuestionsProvider>
                    </div>
                  </div>
                }
              />
              <Route
                path={routes.dsaQuestionDetails(":questionId")}
                element={
                  <div className="flex min-h-screen">
                    <Sidebar />
                    <div className="flex-1">
                      <DSAQuestionsProvider>
                        <DSAProgressProvider>
                          <CodeExecutionProvider>
                            <DSAQuestionSolvePage />
                          </CodeExecutionProvider>
                        </DSAProgressProvider>
                      </DSAQuestionsProvider>
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
    </PricingProvider>
    </AnalyticsProvider>
  );
}

export default App;
