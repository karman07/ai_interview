import { useState } from 'react';
import { Github, Linkedin, Twitter, Globe } from 'lucide-react'; // ✅ Proper icons
import Mee from '../../assets/mee.png';
import GG from '../../assets/gg.jpeg';

const colors = {
  background: "#f8fafc",
  text: "#1e293b",
  primary: "#4f46e5",
  secondary: "#7c3aed"
};

const TeamPage = () => {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);
  const [expandedBios, setExpandedBios] = useState<{ [key: number]: boolean }>({});

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
    <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Hero Section */}
      <section className="py-24 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Meet Our Team
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          We're a diverse group of engineers, designers, coaches, and dreamers united by one mission: helping you ace your next interview.
        </p>
      </section>

      {/* Team Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => {
            const isExpanded = expandedBios[member.id];
            const shortBio = member.bio.length > 150 ? member.bio.substring(0, 150) + "..." : member.bio;

            return (
              <div
                key={member.id}
                className="group relative"
                onMouseEnter={() => setHoveredMember(member.id)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full">
                  
                  {/* Avatar */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                    {/* Social Icons */}
                    <div className={`absolute top-4 right-4 flex gap-2 transition-opacity duration-300 ${hoveredMember === member.id ? 'opacity-100' : 'opacity-0'}`}>
                      {member.social?.website && (
                        <a href={member.social.website} target="_blank" rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white shadow-lg transition">
                          <Globe className="w-5 h-5 text-indigo-600" />
                        </a>
                      )}
                      {member.social?.github && (
                        <a href={member.social.github} target="_blank" rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white shadow-lg transition">
                          <Github className="w-5 h-5 text-indigo-600" />
                        </a>
                      )}
                      {member.social?.linkedin && (
                        <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white shadow-lg transition">
                          <Linkedin className="w-5 h-5 text-indigo-600" />
                        </a>
                      )}
                      {member.social?.twitter && (
                        <a href={member.social.twitter} target="_blank" rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white shadow-lg transition">
                          <Twitter className="w-5 h-5 text-indigo-600" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-sm font-medium mb-3" style={{ color: colors.primary }}>
                      {member.role}
                    </p>

                    <p className="text-sm text-gray-600 leading-relaxed mb-2">
                      {isExpanded ? member.bio : shortBio}
                    </p>
                    {member.bio.length > 150 && (
                      <button
                        onClick={() => toggleBio(member.id)}
                        className="text-indigo-600 text-sm font-semibold hover:underline focus:outline-none"
                      >
                        {isExpanded ? "Read Less" : "Read More"}
                      </button>
                    )}

                    <div className="flex flex-wrap gap-2 mt-4">
                      {member.expertise.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
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
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-12 text-white shadow-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Culture</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              We believe in building a workplace where everyone can do their best work and grow together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: "🌍", title: "Remote-First", desc: "Work from anywhere in the world. We value output over hours and trust our team." },
              { icon: "📚", title: "Continuous Learning", desc: "Annual learning budget and dedicated time for professional development." },
              { icon: "🎯", title: "Impact-Driven", desc: "Every role directly contributes to helping job seekers succeed in their careers." },
              { icon: "🤝", title: "Inclusive & Diverse", desc: "We celebrate different perspectives and backgrounds that make us stronger." },
            ].map((item, i) => (
              <div className="flex gap-4" key={i}>
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm opacity-90">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamPage;
