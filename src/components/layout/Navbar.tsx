import { Link, useNavigate } from "react-router-dom";
import { useState} from "react";
import routes from "@/constants/routes";
import Button from "../ui/Button";
import colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(routes.home);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuthenticated = !!user || !!localStorage.getItem('access_token');

  const navLinks = [
    { to: routes.home, label: "Home" },
    { to: routes.about, label: "About" },
    // { to: routes.interview, label: "Interview" },
    { to: routes.pricing, label: "Pricing" }
  ];

  const handleLogout = async () => {
    localStorage.removeItem('access_token');
    await logout();
    setActiveLink(routes.home);
  };

  return (
    <nav 
      className="w-full fixed top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 shadow-lg"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: 'rgba(99, 102, 241, 0.15)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-18">
          {/* Enhanced Logo */}
          <Link 
            to={routes.home} 
            className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
            onClick={() => setActiveLink(routes.home)}
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:rotate-3"
              style={{ 
                backgroundColor: colors.primary,
                background: `linear-gradient(135deg, ${colors.primary} 0%, rgba(99, 102, 241, 0.8) 100%)`
              }}
            >
              <span className="bg-gradient-to-br from-white to-gray-100 bg-clip-text text-transparent">
                AI
              </span>
            </div>
            <div className="flex flex-col">
              <span 
                className="text-2xl font-bold transition-colors duration-200 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
              >
                Interview
              </span>
              <span className="text-xs text-gray-500 -mt-1">Smart Interviews</span>
            </div>
          </Link>

          {/* Enhanced Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setActiveLink(link.to)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative group overflow-hidden hover:shadow-md ${
                  activeLink === link.to ? 'text-indigo-600' : ''
                }`}
                style={{
                  color: activeLink === link.to ? colors.primary : colors.text
                }}
              >
                {link.label}
                
                {/* Active indicator - glowing underline */}
                <div 
                  className={`absolute bottom-1 left-1/2 h-0.5 rounded-full transition-all duration-300 ${
                    activeLink === link.to ? 'w-8 opacity-100 shadow-lg' : 'w-0 opacity-0'
                  }`}
                  style={{ 
                    backgroundColor: colors.primary,
                    transform: 'translateX(-50%)',
                    boxShadow: activeLink === link.to ? `0 0 8px ${colors.primary}` : 'none'
                  }}
                />
                
                {/* Hover effect */}
                {activeLink !== link.to && (
                  <>
                    <div 
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-5 transition-all duration-300"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <div className="absolute bottom-1 left-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent group-hover:w-6 transition-all duration-300" 
                         style={{ transform: 'translateX(-50%)' }} />
                  </>
                )}
              </Link>
            ))}
          </div>

          {/* Enhanced Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="primary"
                  onClick={() => navigate(routes.dashboard)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleLogout}
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button 
                  variant="primary"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Enhanced Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 rounded-xl transition-all duration-200 hover:bg-gray-100"
            style={{ color: colors.text }}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span 
                className={`block w-6 h-0.5 rounded-full transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-1.5' : 'mb-1.5'
                }`}
                style={{ backgroundColor: colors.text }}
              />
              <span 
                className={`block w-6 h-0.5 rounded-full transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : 'mb-1.5'
                }`}
                style={{ backgroundColor: colors.text }}
              />
              <span 
                className={`block w-6 h-0.5 rounded-full transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
                style={{ backgroundColor: colors.text }}
              />
            </div>
          </button>
        </div>

        {/* Enhanced Mobile menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
          }`}
        >
          <div 
            className="py-6 space-y-3 border-t mt-4" 
            style={{ borderColor: 'rgba(99, 102, 241, 0.15)' }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => {
                  setActiveLink(link.to);
                  setIsMenuOpen(false);
                }}
                className={`block px-6 py-4 rounded-xl font-semibold transition-all duration-200 relative overflow-hidden ${
                  activeLink === link.to ? 'text-indigo-600' : 'hover:bg-gray-50'
                }`}
                style={{
                  color: activeLink === link.to ? colors.primary : colors.text
                }}
              >
                {link.label}
                
                {/* Active indicator for mobile */}
                <div 
                  className={`absolute left-2 top-1/2 w-1 h-6 rounded-full transition-all duration-300 ${
                    activeLink === link.to ? 'opacity-100 shadow-lg' : 'opacity-0'
                  }`}
                  style={{ 
                    backgroundColor: colors.primary,
                    transform: 'translateY(-50%)',
                    boxShadow: activeLink === link.to ? `0 0 8px ${colors.primary}` : 'none'
                  }}
                />
              </Link>
            ))}
            
            {/* Mobile Auth Buttons */}
            <div className="pt-4 space-y-3 border-t" style={{ borderColor: 'rgba(99, 102, 241, 0.15)' }}>
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200 mx-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">Authenticated</span>
                  </div>
                  <Button 
                    variant="primary"
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                  >
                    Login
                  </Button>
                  <Button 
                    variant="primary"
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}