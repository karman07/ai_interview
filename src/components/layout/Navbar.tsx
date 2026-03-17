import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import routes from "@/constants/routes";
import Button from "../ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Moon, Sun, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(routes.home);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [blogsDropdown, setBlogsDropdown] = useState(false);
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
      className={`w-full fixed top-0 z-50 border-b transition-all duration-300 ${scrolled ? 'bg-white dark:bg-gray-900 shadow-sm' : 'bg-white dark:bg-gray-900'
        } border-gray-200 dark:border-gray-800`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link
            to={routes.home}
            className="flex items-center group"
            onClick={() => setActiveLink(routes.home)}
          >
            <div className="h-20 transition-transform duration-300 group-hover:scale-105 drop-shadow-md">
              <img
                src="/logo.png"
                alt="ai for job"
                className="h-full w-auto object-contain dark:invert"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = activeLink === link.to || (link.to === routes.blogs && activeLink.startsWith(routes.blogs));
              
              if (link.to === routes.blogs) {
                return (
                  <div 
                    key={link.to} 
                    className="relative"
                    onMouseEnter={() => setBlogsDropdown(true)}
                    onMouseLeave={() => setBlogsDropdown(false)}
                  >
                    <button
                      className={`relative flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
                        ? 'text-primary dark:text-primary bg-primary/10 dark:bg-primary/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {link.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${blogsDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {blogsDropdown && (
                      <div className="absolute left-0 mt-1 w-48 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl z-50">
                        <ul className="p-1.5 text-sm">
                          {['Interview Prep', 'Resume Building', 'Career Growth', 'Technical Skills', 'AI in Recruitment'].map((cat, i) => (
                            <li key={i}>
                              <Link 
                                to={`${routes.blogs}?category=${encodeURIComponent(cat)}`}
                                onClick={() => { setBlogsDropdown(false); setActiveLink(routes.blogs); }}
                                className="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-primary transition-colors"
                              >
                                {cat}
                              </Link>
                            </li>
                          ))}
                          <li className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                            <Link 
                              to={routes.blogs}
                              onClick={() => { setBlogsDropdown(false); setActiveLink(routes.blogs); }}
                              className="block px-4 py-2 rounded-lg text-primary text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              All Articles
                            </Link>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={(e) => handleNavLinkClick(link.to, e)}
                  className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
                    ? 'text-primary dark:text-primary bg-primary/10 dark:bg-primary/20'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary dark:bg-primary"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Buttons + Theme Toggle */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
              ) : (
                <Sun className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate(routes.dashboard)}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-sm font-medium border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-500 transition-all"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
              <span
                className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-200 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                  }`}
              />
              <span
                className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-200 ${isMenuOpen ? 'opacity-0' : ''
                  }`}
              />
              <span
                className={`block w-5 h-0.5 bg-gray-600 dark:bg-gray-300 rounded-full transition-all duration-200 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="py-4 space-y-1 border-t border-gray-100 dark:border-gray-700">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={(e) => handleNavLinkClick(link.to, e)}
                className={`block px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeLink === link.to
                  ? 'text-primary dark:text-primary bg-primary/10 dark:bg-primary/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
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
