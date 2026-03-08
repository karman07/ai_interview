import { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, Video, FileText, Download, ExternalLink, Clock, Users, Star, TrendingUp, Award, ChevronDown, ChevronUp } from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  icon: JSX.Element;
  duration: string;
  studyTime: string;
  downloads: number;
  students: number;
  rating: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  lastUpdated: string;
  featured: boolean;
  tags: string[];
  color: string;
  borderColor: string;
  accentColor: string;
  thumbnail: string;
  downloadUrl?: string;
  externalUrl?: string;
}

const ResourceCard = ({ resource }: { resource: Resource }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 120; // Character limit for initial view
  const shouldShowReadMore = resource.description.length > maxLength;

  const handleClick = (e: React.MouseEvent) => {
    // If we click the "Read more" button or links specifically, don't trigger card-level click
    const targetUrl = resource.downloadUrl && resource.downloadUrl !== '#'
      ? resource.downloadUrl
      : resource.externalUrl;

    if (targetUrl && targetUrl !== '#') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl cursor-pointer flex flex-col h-full overflow-hidden"
    >
      {/* Course Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={resource.thumbnail}
          alt={resource.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />

        {/* Featured Badge */}
        {resource.featured && (
          <div className="absolute top-4 right-4 bg-amber-400 text-gray-900 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-lg flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            FEATURED
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider border border-white/30`}>
              {resource.category}
            </span>
            <span className="px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm text-[10px] font-medium text-blue-100 uppercase tracking-wider">
              {resource.type}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        {/* Resource Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 ${resource.accentColor}`}>
              {resource.icon}
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600">
            <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>{resource.rating}</span>
          </div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {resource.title}
        </h3>

        <div className="mb-6 flex-grow">
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {isExpanded || !shouldShowReadMore
              ? resource.description
              : `${resource.description.substring(0, maxLength)}...`}
          </p>
          {shouldShowReadMore && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mt-2 flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium transition-colors"
            >
              {isExpanded ? (
                <>
                  Show less <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Read more <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {resource.tags.slice(0, 3).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="px-2.5 py-1 bg-gray-50 dark:bg-gray-700/50 text-xs font-medium text-gray-600 dark:text-gray-400 rounded-md border border-gray-100 dark:border-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-auto border-t border-gray-100 dark:border-gray-700 mt-6 pt-4">
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{resource.duration}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{resource.students.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {resource.externalUrl && (
              <a
                href={resource.externalUrl}
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                title="View Source"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ResourcesHub = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  // Sample resources data with enhanced metadata
  const resources: Resource[] = [
    {
      id: 1,
      title: "Complete Data Structures & Algorithms Mastery",
      description: "Industry-standard comprehensive guide covering advanced DSA concepts, optimization techniques, and real-world problem-solving patterns used by top tech companies.",
      category: "Programming",
      type: "Interactive Course",
      icon: <BookOpen className="w-5 h-5" />,
      duration: "24 weeks",
      studyTime: "6-8 hrs/week",
      downloads: 47520,
      students: 12400,
      rating: 4.9,
      difficulty: "Advanced",
      lastUpdated: "2026-12-15",
      featured: true,
      tags: ["DSA", "Algorithms", "Interview Prep", "FAANG", "System Design"],
      color: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      accentColor: "text-blue-600",
      thumbnail: "/thumbnails/dsa_mastery.png",
      downloadUrl: "#",
      externalUrl: "https://github.com/trekhleb/javascript-algorithms"
    },
    {
      id: 2,
      title: "System Design Architecture Masterclass",
      description: "Professional-grade system design course covering microservices, distributed systems, scalability patterns, and architectural decision-making frameworks.",
      category: "Programming",
      type: "Video Series",
      icon: <Video className="w-5 h-5" />,
      duration: "16 weeks",
      studyTime: "4-6 hrs/week",
      downloads: 32950,
      students: 8950,
      rating: 4.8,
      difficulty: "Expert",
      lastUpdated: "2025-01-08",
      featured: true,
      tags: ["System Design", "Architecture", "Microservices", "Scalability", "DevOps"],
      color: "from-purple-50 to-violet-50",
      borderColor: "border-purple-200",
      accentColor: "text-purple-600",
      thumbnail: "/thumbnails/system_design.png",
      downloadUrl: "#",
      externalUrl: "https://github.com/donnemartin/system-design-primer"
    },
    {
      id: 3,
      title: "Advanced Mathematics for Engineering Excellence",
      description: "Comprehensive mathematical foundation covering calculus, linear algebra, differential equations, and discrete mathematics with engineering applications.",
      category: "Mathematics",
      type: "Study Guide",
      icon: <FileText className="w-5 h-5" />,
      duration: "Self-paced",
      studyTime: "10-15 hrs",
      downloads: 68100,
      students: 23100,
      rating: 4.9,
      difficulty: "Intermediate",
      lastUpdated: "2026-11-22",
      featured: false,
      tags: ["Mathematics", "Engineering", "Calculus", "Linear Algebra", "JEE Advanced"],
      color: "from-emerald-50 to-green-50",
      borderColor: "border-emerald-200",
      accentColor: "text-emerald-600",
      thumbnail: "/thumbnails/math_engineering.png",
      downloadUrl: "#",
      externalUrl: "https://www.khanacademy.org/math"
    },
    {
      id: 4,
      title: "Modern Frontend Development Ecosystem",
      description: "Contemporary frontend development covering React ecosystem, TypeScript, performance optimization, testing strategies, and deployment best practices.",
      category: "Web Development",
      type: "Practical Workshop",
      icon: <Video className="w-5 h-5" />,
      duration: "12 weeks",
      studyTime: "5-7 hrs/week",
      downloads: 41300,
      students: 15200,
      rating: 4.7,
      difficulty: "Intermediate",
      lastUpdated: "2025-01-15",
      featured: false,
      tags: ["React", "TypeScript", "Frontend", "Performance", "Testing"],
      color: "from-cyan-50 to-blue-50",
      borderColor: "border-cyan-200",
      accentColor: "text-cyan-600",
      thumbnail: "/thumbnails/frontend_dev.png",
      downloadUrl: "#",
      externalUrl: "https://frontendmasters.com/guides/learning-roadmap/"
    },
    {
      id: 5,
      title: "Professional English Communication Mastery",
      description: "Executive-level English communication program focusing on business presentations, negotiation skills, and international professional standards.",
      category: "Language",
      type: "Interactive Course",
      icon: <BookOpen className="w-5 h-5" />,
      duration: "8 weeks",
      studyTime: "3-4 hrs/week",
      downloads: 29800,
      students: 11400,
      rating: 4.8,
      difficulty: "Intermediate",
      lastUpdated: "2026-12-28",
      featured: true,
      tags: ["Business English", "IELTS", "Professional Communication", "Presentations"],
      color: "from-amber-50 to-yellow-50",
      borderColor: "border-amber-200",
      accentColor: "text-amber-600",
      thumbnail: "/thumbnails/language_comm.png",
      downloadUrl: "#",
      externalUrl: "https://www.britishcouncil.org/"
    },
    {
      id: 6,
      title: "Machine Learning Production Systems",
      description: "Enterprise-grade ML engineering covering model deployment, MLOps pipelines, monitoring systems, and production-ready machine learning workflows.",
      category: "Data Science",
      type: "Technical Guide",
      icon: <FileText className="w-5 h-5" />,
      duration: "20 weeks",
      studyTime: "8-10 hrs/week",
      downloads: 55750,
      students: 18750,
      rating: 4.9,
      difficulty: "Expert",
      lastUpdated: "2025-01-10",
      featured: true,
      tags: ["Machine Learning", "MLOps", "Python", "Production Systems", "AI Engineering"],
      color: "from-rose-50 to-red-50",
      borderColor: "border-rose-200",
      accentColor: "text-rose-600",
      thumbnail: "/thumbnails/ml_production.png",
      downloadUrl: "#",
      externalUrl: "https://ml-ops.org/"
    },
    {
      id: 7,
      title: "Quantitative Finance & Trading Strategies",
      description: "Professional finance program covering algorithmic trading, risk management, portfolio optimization, and quantitative analysis methodologies.",
      category: "Finance",
      type: "Professional Course",
      icon: <TrendingUp className="w-5 h-5" />,
      duration: "14 weeks",
      studyTime: "6-8 hrs/week",
      downloads: 19200,
      students: 7200,
      rating: 4.6,
      difficulty: "Advanced",
      lastUpdated: "2026-12-05",
      featured: false,
      tags: ["Quantitative Finance", "Trading", "Risk Management", "Algorithms"],
      color: "from-indigo-50 to-blue-50",
      borderColor: "border-indigo-200",
      accentColor: "text-indigo-600",
      thumbnail: "/thumbnails/finance.png",
      downloadUrl: "#",
      externalUrl: "https://www.investopedia.com/quantitative-analysis-4773315"
    },
    {
      id: 8,
      title: "Advanced UX Design & Research Methods",
      description: "Professional UX design methodology covering user research, design systems, accessibility standards, and data-driven design decision frameworks.",
      category: "Design",
      type: "Design Workshop",
      icon: <Award className="w-5 h-5" />,
      duration: "10 weeks",
      studyTime: "4-6 hrs/week",
      downloads: 34400,
      students: 11400,
      rating: 4.8,
      difficulty: "Advanced",
      lastUpdated: "2026-12-20",
      featured: false,
      tags: ["UX Design", "User Research", "Design Systems", "Accessibility", "Prototyping"],
      color: "from-pink-50 to-rose-50",
      borderColor: "border-pink-200",
      accentColor: "text-pink-600",
      thumbnail: "/thumbnails/ux_design.png",
      downloadUrl: "#",
      externalUrl: "https://www.nngroup.com/articles/"
    },
    {
      id: 9,
      title: "Professional Resume Structure - Akash",
      description: "A comprehensive example of a high-impact technical resume. Learn how to structure your experience, skills, and projects to catch the eye of top recruiters.",
      category: "Career",
      type: "Reference PDF",
      icon: <FileText className="w-5 h-5" />,
      duration: "Reference",
      studyTime: "5-10 mins",
      downloads: 1240,
      students: 3100,
      rating: 4.8,
      difficulty: "Beginner",
      lastUpdated: "2026-03-01",
      featured: false,
      tags: ["Resume", "Career", "Technical", "Blueprint"],
      color: "from-slate-50 to-gray-50",
      borderColor: "border-slate-200",
      accentColor: "text-slate-600",
      thumbnail: "/thumbnails/resume_blueprint.png",
      downloadUrl: "/resources/akash_resume.pdf"
    },
    {
      id: 10,
      title: "Executive Resume Blueprint - Isha",
      description: "Analyze the layout and content strategy used in this executive-level resume. Perfect for understanding how to highlight leadership and strategic impact.",
      category: "Career",
      type: "Reference PDF",
      icon: <FileText className="w-5 h-5" />,
      duration: "Reference",
      studyTime: "5-10 mins",
      downloads: 980,
      students: 2450,
      rating: 4.9,
      difficulty: "Intermediate",
      lastUpdated: "2026-03-05",
      featured: true,
      tags: ["Resume", "Executive", "Strategy", "Impact"],
      color: "from-slate-50 to-gray-50",
      borderColor: "border-slate-200",
      accentColor: "text-slate-600",
      thumbnail: "/thumbnails/resume_blueprint.png",
      downloadUrl: "/resources/isha_resume.pdf"
    },
    {
      id: 11,
      title: "Tech Role Job Description Analysis",
      description: "A deep dive into common technical job descriptions. Learn to identify key requirements, hidden expectations, and how to tailor your profile accordingly.",
      category: "Career",
      type: "Case Study",
      icon: <Users className="w-5 h-5" />,
      duration: "Case Study",
      studyTime: "15-20 mins",
      downloads: 2100,
      students: 5200,
      rating: 4.7,
      difficulty: "Intermediate",
      lastUpdated: "2026-03-07",
      featured: false,
      tags: ["Job Description", "Analysis", "Recruitment", "Interviews"],
      color: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200",
      accentColor: "text-emerald-600",
      thumbnail: "/thumbnails/jd_analysis.png",
      downloadUrl: "/resources/dine3d_jd.pdf"
    }
  ];

  const categories = ['All', 'Programming', 'Web Development', 'Mathematics', 'Data Science', 'Language', 'Finance', 'Design', 'Career'];

  const sortedAndFilteredResources = useMemo(() => {
    let filtered = resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
      const matchesType = selectedType === 'All' || resource.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });

    // Sort resources
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.students - a.students;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, selectedType, sortBy]);



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium mb-6">
              <Award className="w-3.5 h-3.5 mr-2" />
              Premium Learning Resources
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Professional Resource Library
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Access curated, industry-grade learning materials designed by experts to accelerate your professional growth
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Advanced Search */}
            <div className="lg:col-span-2 relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Resources</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <Filter className="absolute right-4 top-12 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none" />
            </div>

            {/* Sort Options */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="recent">Recently Updated</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
              <TrendingUp className="absolute right-4 top-12 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold text-blue-600 dark:text-blue-400">{sortedAndFilteredResources.length}</span> of {resources.length} resources
              </span>
              {(searchTerm || selectedCategory !== 'All' || selectedType !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setSelectedType('All');
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedAndFilteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>

        {/* Enhanced No Results */}
        {sortedAndFilteredResources.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12 max-w-md mx-auto">
              <div className="text-gray-400 dark:text-gray-500 mb-6">
                <Search className="w-20 h-20 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No resources found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                We couldn't find any resources matching your criteria. Try adjusting your search or filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedType('All');
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Call to Action */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Can't find what you're looking for?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
            Request specific resources or suggest new topics for our expert team.
          </p>
          <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
            Request New Resource
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourcesHub;