import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import routes from "@/constants/routes";
import Button from "../ui/button";
import colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(routes.home);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuthenticated = !!user || !!localStorage.getItem('access_token');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: routes.home, label: "Home" },
    { to: routes.about, label: "About" },
    { to: routes.pricing, label: "Team" },
    { to: routes.contact, label: "Contact" }
  ];

  const handleLogout = async () => {
    localStorage.removeItem('access_token');
    await logout();
    setActiveLink(routes.home);
  };

  return (
    <nav 
      className={`w-full fixed top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        scrolled ? 'shadow-lg' : 'shadow-sm'
      } bg-white/95 dark:bg-gray-900/95 border-gray-200/20 dark:border-gray-700/20`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to={routes.home} 
            className="flex items-center space-x-2.5 group"
            onClick={() => setActiveLink(routes.home)}
          >
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-105"
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary} 0%, #7c3aed 100%)`
              }}
            >
              <span className="text-base">AI</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                Interview
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight -mt-0.5">
                Smart Interviews
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setActiveLink(link.to)}
                className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeLink === link.to 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
                {activeLink === link.to && (
                  <span 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="ghost"
                  onClick={() => navigate(routes.dashboard)}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleLogout}
                  className="text-sm font-medium border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button 
                  variant="primary"
                  className="text-sm font-medium shadow-sm hover:shadow"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, #7c3aed 100%)`
                  }}
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
              <span 
                className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-200 ${
                  isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              />
              <span 
                className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-200 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span 
                className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-200 ${
                  isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-1 border-t border-gray-100 dark:border-gray-700">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => {
                  setActiveLink(link.to);
                  setIsMenuOpen(false);
                }}
                className={`block px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                  activeLink === link.to 
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Auth Buttons */}
            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
              {isAuthenticated ? (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      navigate(routes.dashboard);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-sm font-medium border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-sm font-medium border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-sm font-medium border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Login
                  </Button>
                  <Button 
                    variant="primary"
                    onClick={() => {
                      navigate('/signup');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-sm font-medium"
                    style={{
                      background: `linear-gradient(135deg, ${colors.primary} 0%, #7c3aed 100%)`
                    }}
                  >
                    Get Started
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