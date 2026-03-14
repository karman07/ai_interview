import { Brain, Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex mb-6 group">
              <div className="h-20 transition-transform duration-300 group-hover:scale-105 drop-shadow-sm">
                <img src="/logo.png" alt="ai for job" className="h-full w-auto object-contain dark:invert" />
              </div>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed max-w-md text-sm">
              Empowering professionals worldwide with AI-powered interview preparation. Your comprehensive hub for landing your dream job.
            </p>

          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Features</h3>
            <ul className="space-y-4">
              <li><Link to="/dashboard" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Dashboard</Link></li>
              <li><Link to="/interview_round" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Practice Interviews</Link></li>
              {/* <li><Link to="/subjects" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Preparation Hub</Link></li> */}
              <li><Link to="/resources" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Resources</Link></li>
              <li><Link to="/employee" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Job Portal</Link></li>
              <li><Link to="/pricing" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Company</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">About Us</Link></li>
              <li><Link to="/contact" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Contact</Link></li>
              <li><Link to="/privacy" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors duration-200">Cookie Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email us</p>
                  <a href="mailto:info@aiforjob.ai" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                    info@aiforjob.ai
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Call us</p>
                  <a href="tel:+918307717793" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                    +91 83077 17793
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3 group">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Visit us</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    A-30 Max Heights<br />
                    Sonepat, Haryana, India 
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-16 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} AI for Job. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <span>Crafted with</span>
              <span className="text-red-500 animate-pulse">❤</span>
              <span>by the AI for Job Team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
