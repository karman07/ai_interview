import { useState } from 'react';
import Mee from '../../../public/mee.png';

const colors = {
  background: "#f8fafc",
  text: "#1e293b",
  primary: "#4f46e5",
  secondary: "#7c3aed"
};

const TeamPage = () => {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);

  // Resolve image paths: support external URLs, absolute paths (/...), or filenames placed in public/images
  const resolveImage = (img?: string) => {
    if (!img) return '';
    // external URL
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    // absolute path (served from public/ by Vite)
    if (img.startsWith('/')) return img;
    // bare filename -> assume public/images/<img>
    return `${import.meta.env.BASE_URL}images/${img}`;
  };

  const teamMembers = [
    {
      id: 1,
      name: "Dr. Parteek Bhatia",
      role: "Founder & Angel Investor",
      bio: "Dr. Parteek Kumar Bhatia is an Associate Professor at Washington State University and a recognized leader in Machine Learning, Explainable AI, and AI for Social Good. He previously served as Professor and Associate Dean at Thapar Institute of Engineering & Technology (TIET), Patiala, India, and held visiting positions at Whitman College (USA) and Tel Aviv University (Israel).",
      image: "https://parteekbhatia.com/assets/image-BndRrwmw.png",
      expertise: ["Investor", "Product Strategy"],
      social: { linkedin: "#", twitter: "#" }
    },
    {
      id: 2,
      name: "Rahat Bhatia",
      role: "Head of AI Research",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      expertise: ["NLP", "Deep Learning", "Research", "Machine Learning", "Langraph"],
      social: { linkedin: "#", twitter: "#" }
    },
    {
      id: 3,
      name: "Karman Singh",
      role: "Crazy Developer",
      bio: "Passionate web developer with expertise in both frontend and backend development, creating seamless, user-friendly digital experiences. With strong skills in Android development, I excel in crafting innovative mobile apps. I am committed to delivering high-quality, scalable solutions and constantly advancing my knowledge in cutting-edge technologies.",
      image: Mee,
      expertise: ["Career Coaching", "HR Strategy", "Talent Dev"],
      social: { linkedin: "#", twitter: "#" }
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Meet Our Team
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We're a diverse group of engineers, designers, coaches, and dreamers united by 
            one mission: helping you ace your next interview.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="relative group"
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full">
                {/* Avatar Section */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={resolveImage(member.image)}
                    alt={member.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  
                  {/* Social Links - Appear on Hover */}
                  <div className={`absolute top-4 right-4 flex gap-2 transition-opacity duration-300 ${hoveredMember === member.id ? 'opacity-100' : 'opacity-0'}`}>
                    <a href={member.social.linkedin} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                      <span className="text-sm font-bold text-indigo-600">in</span>
                    </a>
                    <a href={member.social.twitter} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                      <span className="text-sm font-bold text-indigo-600">𝕏</span>
                    </a>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-sm font-medium mb-3" style={{ color: colors.primary }}>
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {member.bio}
                  </p>
                  
                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Culture Section */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-12 text-white shadow-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Culture</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              We believe in building a workplace where everyone can do their best work 
              and grow together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="text-2xl">🌍</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Remote-First</h3>
                <p className="text-sm opacity-90">
                  Work from anywhere in the world. We value output over hours and trust our team.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Continuous Learning</h3>
                <p className="text-sm opacity-90">
                  Annual learning budget and dedicated time for professional development.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Impact-Driven</h3>
                <p className="text-sm opacity-90">
                  Every role directly contributes to helping job seekers succeed in their careers.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="text-2xl">🤝</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Inclusive & Diverse</h3>
                <p className="text-sm opacity-90">
                  We celebrate different perspectives and backgrounds that make us stronger.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeamPage;