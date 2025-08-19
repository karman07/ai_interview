import { Brain, Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">AI Interview Coach</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Empowering professionals worldwide with AI-powered interview preparation.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-colors duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-colors duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-colors duration-300">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Product</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Features</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Pricing</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">API Access</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Enterprise</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Integrations</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Help Center</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Documentation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Community</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Contact Support</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">System Status</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Email us</p>
                  <a href="mailto:hello@aiinterviewcoach.com" className="text-white hover:text-indigo-400 transition-colors">
                    hello@aiinterviewcoach.com
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Call us</p>
                  <a href="tel:+1234567890" className="text-white hover:text-indigo-400 transition-colors">
                    +1 (234) 567-8900
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Visit us</p>
                  <p className="text-white">
                    123 Innovation Drive<br />
                    San Francisco, CA 94105
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 mb-4 md:mb-0">
              <p className="text-gray-300 text-sm">© 2025 AI Interview Coach. All rights reserved.</p>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <span>Made with</span>
              <span className="text-red-400 animate-pulse">❤</span>
              <span>by the AI Coach Team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
