import { Link } from "react-router-dom";
import { useState } from "react";
import routes from "@/constants/routes";
import Button from "../ui/Button";
import colors from "@/constants/colors";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(routes.home);

  const navLinks = [
    { to: routes.home, label: "Home" },
    { to: routes.about, label: "About" },
    { to: routes.interview, label: "Interview" }
  ];

  return (
    <nav 
      className="w-full fixed top-0 z-50 backdrop-blur-md border-b transition-all duration-300"
      style={{ 
        backgroundColor: 'rgba(249, 250, 251, 0.95)',
        borderColor: 'rgba(99, 102, 241, 0.1)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo with enhanced styling */}
          <Link 
            to={routes.home} 
            className="flex items-center space-x-2 group transition-transform duration-200 hover:scale-105"
            onClick={() => setActiveLink(routes.home)}
          >
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: colors.primary }}
            >
              AI
            </div>
            <span 
              className="text-xl font-bold transition-colors duration-200"
              style={{ color: colors.text }}
            >
              Interview
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setActiveLink(link.to)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 relative group ${
                  activeLink === link.to ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: activeLink === link.to ? colors.primary : 'transparent',
                  color: activeLink === link.to ? 'white' : colors.text
                }}
              >
                {link.label}
                {activeLink !== link.to && (
                  <div 
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-200"
                    style={{ backgroundColor: colors.primary }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="primary"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors duration-200"
            style={{ color: colors.text }}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span 
                className={`block w-5 h-0.5 transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-1' : 'mb-1'
                }`}
                style={{ backgroundColor: colors.text }}
              />
              <span 
                className={`block w-5 h-0.5 transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : 'mb-1'
                }`}
                style={{ backgroundColor: colors.text }}
              />
              <span 
                className={`block w-5 h-0.5 transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-1' : ''
                }`}
                style={{ backgroundColor: colors.text }}
              />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-2 border-t" style={{ borderColor: 'rgba(99, 102, 241, 0.1)' }}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => {
                  setActiveLink(link.to);
                  setIsMenuOpen(false);
                }}
                className={`block px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeLink === link.to ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: activeLink === link.to ? colors.primary : 'transparent',
                  color: activeLink === link.to ? 'white' : colors.text
                }}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <Button 
                variant="primary"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}