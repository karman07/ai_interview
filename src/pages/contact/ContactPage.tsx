import { useState, useEffect, useRef } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Globe, CheckCircle } from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isTyping, setIsTyping] = useState({ name: false, email: false, message: false });
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in-section').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setIsTyping({ ...isTyping, [name]: value.length > 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
    setIsTyping({ name: false, email: false, message: false });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative text-center py-24 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-purple-100/30 to-pink-100/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center px-5 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg mb-8 border border-indigo-200/50 dark:border-indigo-700/50">
            <MessageCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2 animate-bounce" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Get In Touch</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-gradient">
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            We'd love to hear from you! Whether you have a question, feedback, or a business inquiry — our team is here to help.
          </p>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 px-6 pb-20 fade-in-section">
        {/* Left: Contact Form */}
        <div ref={formRef} className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700 hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Send className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Send us a Message</h2>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label htmlFor="name" className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300"
                  placeholder="John Doe"
                />
                {isTyping.name && (
                  <div className="absolute right-3 top-11 text-green-500 animate-pulse">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="relative">
                <label htmlFor="email" className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300"
                  placeholder="john@example.com"
                />
                {isTyping.email && (
                  <div className="absolute right-3 top-11 text-green-500 animate-pulse">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="relative">
                <label htmlFor="message" className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-300 resize-none"
                  placeholder="Tell us what's on your mind..."
                ></textarea>
                {isTyping.message && (
                  <div className="absolute right-3 top-11 text-green-500 animate-pulse">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center gap-2">
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  Send Message
                </span>
              </button>
            </form>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">Thank you!</h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                Your message has been sent successfully. We'll get back to you soon.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-lg"
              >
                Send another message →
              </button>
            </div>
          )}
        </div>

        {/* Right: Contact Info */}
        <div className="flex flex-col justify-between">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 text-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-white/90 text-lg mb-8">
                Have a project in mind, need support, or just want to say hello? We'd love to chat with you.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-1">Email</p>
                    <p className="text-white/90">karmansingharora01@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-1">Phone</p>
                    <p className="text-white/90">+918813947793</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-1">Location</p>
                    <p className="text-white/90">Delhi, India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <Clock className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-3" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Response Time</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Within 24 hours</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <Globe className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Available</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">24/7 Support</p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
        }

        .fade-in-section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .fade-in-section.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ContactPage;
