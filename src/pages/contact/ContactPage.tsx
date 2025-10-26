import { useState } from "react";
import { Mail, Phone, MapPin, Send} from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-800">
      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Contact Us
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We'd love to hear from you! Whether you have a question, feedback, or a business inquiry — our team is here to help.
        </p>
      </section>

      {/* Contact Form + Info */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 px-6 pb-20">
        {/* Left: Contact Form */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border border-gray-100">
          <h2 className="text-2xl font-semibold mb-6 text-indigo-700">Send us a Message</h2>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="message" className="block font-medium text-gray-700 mb-1">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] transition"
              >
                <Send className="w-5 h-5" /> Send Message
              </button>
            </form>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-2xl font-semibold text-indigo-600 mb-3">Thank you!</h3>
              <p className="text-gray-600">Your message has been sent successfully. We'll get back to you soon.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-indigo-600 hover:underline font-medium"
              >
                Send another message
              </button>
            </div>
          )}
        </div>

        {/* Right: Contact Info */}
        <div className="flex flex-col justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-3xl shadow-lg p-8 md:p-12 space-y-6">
          <h2 className="text-2xl font-semibold mb-2">Get in Touch</h2>
          <p className="opacity-90 mb-6">
            Have a project in mind, need support, or just want to say hello? We’d love to chat with you.
          </p>

          <div className="flex items-start gap-4">
            <Mail className="w-6 h-6" />
            <div>
              <p className="font-medium">Email</p>
              <p className="opacity-90">hello@example.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone className="w-6 h-6" />
            <div>
              <p className="font-medium">Phone</p>
              <p className="opacity-90">+91 8813947793</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin className="w-6 h-6" />
            <div>
              <p className="font-medium">Location</p>
              <p className="opacity-90">Delhi, India</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
