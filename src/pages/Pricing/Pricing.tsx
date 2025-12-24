import { useState, useEffect, useRef } from 'react';
import { Github, Linkedin, Twitter, Globe, Users, Heart, Zap, Target } from 'lucide-react';
import Mee from '../../assets/mee.png';
import GG from '../../assets/gg.jpeg';

const TeamPage = () => {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);
  const [expandedBios, setExpandedBios] = useState<{ [key: number]: boolean }>({});

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

  const toggleBio = (id: number) => {
    setExpandedBios((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const teamMembers = [
    {
      id: 1,
      name: "Dr. Parteek Bhatia",
      role: "Founder & Angel Investor",
      bio: "Dr. Parteek Kumar Bhatia is an Associate Professor at Washington State University and a recognized leader in Machine Learning, Explainable AI, and AI for Social Good. He previously served as Professor and Associate Dean at Thapar Institute of Engineering & Technology (TIET), Patiala, India, and held visiting positions at Whitman College (USA) and Tel Aviv University (Israel).",
      image: "https://parteekbhatia.com/assets/image-BndRrwmw.png",
      expertise: ["Investor", "Product Strategy"],
      social: {
        linkedin: "https://www.linkedin.com/in/parteekbhatia",
        twitter: "https://twitter.com/parteek",
        github: "https://github.com/parteek",
        website: "https://parteekbhatia.com"
      }
    },
    {
      id: 2,
      name: "Rahat Bhatia",
      role: "Head of AI Research",
      bio: "Rahat is a passionate AI researcher focusing on NLP, LangChain, and Machine Learning. He has contributed to multiple open-source projects and is dedicated to pushing the boundaries of modern AI systems.",
      image: GG,
      expertise: ["NLP", "Deep Learning", "Research", "Machine Learning", "Langraph"],
      social: { linkedin: "#", twitter: "#", github: "#", website: "#" }
    },
    {
      id: 3,
      name: "Karman Singh",
      role: "Crazy Developer",
      bio: "Passionate web developer with expertise in both frontend and backend development, creating seamless, user-friendly digital experiences. With strong skills in Android development, I excel in crafting innovative mobile apps.",
      image: Mee,
      expertise: ["Frontend Developer", "Backend Developer", "DevOps"],
      social: { linkedin: "#", twitter: "#", github: "#", website: "#" }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 via-purple-100/30 to-pink-100/50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center px-5 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-lg mb-8 border border-indigo-200/50 dark:border-indigo-700/50">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Our Team</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-gradient">
            Meet Our Team
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            We're a diverse group of engineers, designers, coaches, and dreamers united by one mission: helping you ace your next interview.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto fade-in-section">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => {
            const isExpanded = expandedBios[member.id];
            const shortBio = member.bio.length > 150 ? member.bio.substring(0, 150) + "..." : member.bio;

            return (
              <div
                key={member.id}
                className="group relative"
                onMouseEnter={() => setHoveredMember(member.id)}
                onMouseLeave={() => setHoveredMember(null)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 dark:border-gray-700 h-full hover:scale-105">
                  
                  {/* Avatar */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                    {/* Social Icons */}
                    <div className={`absolute top-4 right-4 flex gap-2 transition-all duration-300 ${hoveredMember === member.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                      {member.social?.website && member.social.website !== "#" && (
                        <a href={member.social.website} target="_blank" rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 shadow-lg transition-all hover:scale-110">
                          <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </a>
                      )}
                      {member.social?.github && member.social.github !== "#" && (
                        <a href={member.social.github} target="_blank" rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 shadow-lg transition-all hover:scale-110">
                          <Github className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </a>
                      )}
                      {member.social?.linkedin && member.social.linkedin !== "#" && (
                        <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 shadow-lg transition-all hover:scale-110">
                          <Linkedin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </a>
                      )}
                      {member.social?.twitter && member.social.twitter !== "#" && (
                        <a href={member.social.twitter} target="_blank" rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 shadow-lg transition-all hover:scale-110">
                          <Twitter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-3">
                      {member.role}
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                      {isExpanded ? member.bio : shortBio}
                    </p>
                    {member.bio.length > 150 && (
                      <button
                        onClick={() => toggleBio(member.id)}
                        className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline focus:outline-none"
                      >
                        {isExpanded ? "Read Less" : "Read More"}
                      </button>
                    )}

                    <div className="flex flex-wrap gap-2 mt-4">
                      {member.expertise.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto fade-in-section">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Culture</h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                We believe in building a workplace where everyone can do their best work and grow together.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { icon: Heart, title: "Remote-First", desc: "Work from anywhere in the world. We value output over hours and trust our team." },
                { icon: Zap, title: "Continuous Learning", desc: "Annual learning budget and dedicated time for professional development." },
                { icon: Target, title: "Impact-Driven", desc: "Every role directly contributes to helping job seekers succeed in their careers." },
                { icon: Users, title: "Inclusive & Diverse", desc: "We celebrate different perspectives and backgrounds that make us stronger." },
              ].map((item, i) => (
                <div className="flex gap-4 p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 group" key={i}>
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm opacity-90">{item.desc}</p>
                  </div>
                </div>
              ))}
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
      `}</style>
    </div>
  );
};

export default TeamPage;
