import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import routes from "@/constants/routes";
import Button from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(routes.home);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuthenticated = !!user || !!localStorage.getItem('access_token');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const navLinks = [
    { to: routes.home, label: "Home" },
    { to: routes.jobsPublic, label: "Jobs" },
    { to: "/pricing", label: "Pricing" },
    { to: routes.blogs, label: "Blogs" },
    { to: routes.about, label: "About" },
    { to: routes.contact, label: "Contact" }
  ];

  const handleLogout = async () => {
    localStorage.removeItem('access_token');
    await logout();
    setActiveLink(routes.home);
  };

  const handleNavLinkClick = (to: string, _e: React.MouseEvent) => {
    setActiveLink(to);
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`w-full fixed top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-sm border-b border-slate-200/70 dark:border-slate-800/70'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={routes.home}
            className="flex items-center group"
            onClick={() => setActiveLink(routes.home)}
          >
            <div className="h-10 transition-transform duration-300 group-hover:scale-105">
              <img
                src="/logo.png"
                alt="ai for job"
                className="h-full w-auto object-contain dark:invert"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => handleNavLinkClick(link.to, e)}
                className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeLink === link.to
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons + Theme Toggle */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate(routes.dashboard)}
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-sm font-medium border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 transition-all"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  className="text-sm font-semibold shadow-none transition-all active:scale-95"
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
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen
              ? <X className="w-5 h-5" />
              : <Menu className="w-5 h-5" />
            }
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="py-4 space-y-1 border-t border-slate-100 dark:border-slate-800">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => handleNavLinkClick(link.to, e)}
                className={`block px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeLink === link.to
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg font-medium text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span>Theme</span>
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

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
                    className="w-full text-sm font-medium border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-sm font-medium border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-500 transition-all"
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
                    className="w-full text-sm font-medium border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary dark:hover:border-primary transition-all"
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      navigate('/signup');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-sm font-medium bg-primary hover:bg-primary-hover text-primary-foreground transition-all"
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
