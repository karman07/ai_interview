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

// Wrapper to redirect logged-in users from public routes
import { useAuth } from "@/contexts/AuthContext";
import InterviewApp from "./pages/Interview/Interview";
import ResourcesHub from "./pages/Resources/Resources";
import JobSearchApp from "./pages/Job/JobSearch";
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
    routes.jobListings
  ];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
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
                        <InterviewApp/>
                      </ResultsProvider>
                    </InterviewProvider>
                  </div>
                </div>
              }
            />

            <Route path={routes.jobListings} element={
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1">
                  <JobSearchApp />
                </div>
              </div>
            } />

            <Route path={routes.resources} element={                
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1">
                  <ResourcesHub />
                </div>
              </div>
            } />
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
              <Route path={routes.completeProfile} element={<CompleteProfile />} />
            </Route>

            {/* Catch-all: redirect unknown routes to home */}
            <Route path="*" element={<Navigate to={routes.home} replace />} />
          </Routes>
        </div>

        {!shouldHideNavbar && <Footer />}
      </div>
    </PricingProvider>
  );
}

export default App;
