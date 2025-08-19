import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Interview from "@/pages/Interview";
import routes from "@/constants/routes";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ProtectedRoute from "./routes/ProtectedRoute";
import Profile from "./pages/Profile/Profile";
import CompleteProfile from "./pages/Profile/CompleteProfile";

function App() {
  return (
    <div className="bg-gray-50">
      <Navbar />
      <Routes>
        <Route path={routes.home} element={<Home />} />
        <Route path={routes.about} element={<About />} />
        <Route path={routes.interview} element={<Interview />} />

        <Route path={routes.login} element={<Login />} />
        <Route path={routes.signup} element={<Signup />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path={routes.profile} element={<Profile />} />
          <Route path={routes.completeProfile} element={<CompleteProfile />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
