import { useState, useRef } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Globe, CheckCircle } from "lucide-react";
import Button from "@/components/ui/button";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isTyping, setIsTyping] = useState({ name: false, email: false, message: false });
  const formRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-blue-500/30 transition-colors duration-500">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/5 blur-[120px] rounded-full opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 mb-8 backdrop-blur-sm">
            <MessageCircle className="w-4 h-4 mr-2 text-blue-500" />
            <span className="text-sm font-medium tracking-wide">GET IN TOUCH</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight mb-6">
            We'd Love to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-600 dark:from-blue-400 dark:to-blue-400">Hear From You</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Whether you have a question about features, pricing, or just want to say hello, our team is ready to answer all your questions.
          </p>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 px-6 pb-24">
        {/* Left: Contact Form */}
        <div ref={formRef} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 md:p-12 hover:border-blue-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-800">
              <Send className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Send us a Message</h2>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 placeholder:text-slate-400"
                    placeholder="John Doe"
                  />
                  {isTyping.name && (
                    <div className="absolute right-3 top-3 text-emerald-500 animate-in fade-in zoom-in duration-300">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 placeholder:text-slate-400"
                    placeholder="john@example.com"
                  />
                  {isTyping.email && (
                    <div className="absolute right-3 top-3 text-emerald-500 animate-in fade-in zoom-in duration-300">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 resize-none placeholder:text-slate-400"
                  placeholder="Tell us what's on your mind..."
                ></textarea>
                {isTyping.message && (
                  <div className="absolute right-3 top-3 text-emerald-500 animate-in fade-in zoom-in duration-300">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center py-4 text-base h-auto"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </Button>
            </form>
          ) : (
            <div className="text-center py-16 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Message Sent!</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Thank you for reaching out. We'll get back to you within 24 hours.
              </p>
              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Send another message
              </Button>
            </div>
          )}
        </div>

        {/* Right: Contact Info */}
        <div className="flex flex-col justify-between space-y-8">
          <div className="bg-slate-900 dark:bg-slate-800 text-white rounded-2xl p-8 md:p-12 space-y-8 relative overflow-hidden shadow-xl">
            {/* Background glow for card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Contact Information</h2>
              <p className="text-slate-300 text-lg mb-8 font-light">
                Available for support, feedback, and enterprise inquiries.
              </p>

              <div className="space-y-6">
                <a
                  href="mailto:karmansingharora01@gmail.com"
                  className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform text-blue-400">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-1 text-white">Email</p>
                    <p className="text-slate-300 group-hover:text-white transition-colors">karmansingharora01@gmail.com</p>
                  </div>
                </a>

                <a
                  href="tel:+918813947793"
                  className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform text-blue-400">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-1 text-white">Phone</p>
                    <p className="text-slate-300 group-hover:text-white transition-colors">+91 88139 47793</p>
                  </div>
                </a>

                <a
                  href="https://www.google.com/maps/place/Delhi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center group-hover:scale-105 transition-transform text-pink-400">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-1 text-white">Location</p>
                    <p className="text-slate-300 group-hover:text-white transition-colors">Delhi, India</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition-all duration-300 group">
              <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Response Time</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Within 24 hours</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 transition-all duration-300 group">
              <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Available</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">global 24/7 Support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
