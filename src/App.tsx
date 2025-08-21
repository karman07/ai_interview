import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Interview from "@/pages/Interview";
import PricingPage from "@/pages/Pricing/Pricing";
import routes from "@/constants/routes";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ProtectedRoute from "./routes/ProtectedRoute";
import Profile from "./pages/Profile/Profile";
import CompleteProfile from "./pages/Profile/CompleteProfile";
import { PricingProvider } from "@/contexts/PricingContext";
import Footer from "./components/layout/Footer";

function App() {
  const location = useLocation();

  // Pages where Navbar shouldn't show
  const hideNavbarRoutes = [routes.login, routes.signup, routes.profile, routes.completeProfile];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <PricingProvider>
      <div className="bg-gray-50 min-h-screen flex flex-col">
        {!shouldHideNavbar && <Navbar />}

        <div className="flex-grow">
          <Routes>
            <Route path={routes.home} element={<Home />} />
            <Route path={routes.about} element={<About />} />
            <Route path={routes.interview} element={<Interview />} />
            <Route path={routes.pricing} element={<PricingPage />} />

            <Route path={routes.login} element={<Login />} />
            <Route path={routes.signup} element={<Signup />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path={routes.profile} element={<Profile />} />
              <Route path={routes.completeProfile} element={<CompleteProfile />} />
            </Route>
          </Routes>
        </div>

        {!shouldHideNavbar && <Footer />}
      </div>
    </PricingProvider>
  );
}

export default App;
