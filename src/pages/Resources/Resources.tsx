import { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, Video, FileText, Download, ExternalLink, Clock, Users, Star, TrendingUp, Award, Calendar } from 'lucide-react';

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
}

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
      lastUpdated: "2024-12-15",
      featured: true,
      tags: ["DSA", "Algorithms", "Interview Prep", "FAANG", "System Design"],
      color: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      accentColor: "text-blue-600"
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
      accentColor: "text-purple-600"
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
      lastUpdated: "2024-11-22",
      featured: false,
      tags: ["Mathematics", "Engineering", "Calculus", "Linear Algebra", "JEE Advanced"],
      color: "from-emerald-50 to-green-50",
      borderColor: "border-emerald-200",
      accentColor: "text-emerald-600"
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
      accentColor: "text-cyan-600"
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
      lastUpdated: "2024-12-28",
      featured: true,
      tags: ["Business English", "IELTS", "Professional Communication", "Presentations"],
      color: "from-amber-50 to-yellow-50",
      borderColor: "border-amber-200",
      accentColor: "text-amber-600"
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
      accentColor: "text-rose-600"
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
      lastUpdated: "2024-12-05",
      featured: false,
      tags: ["Quantitative Finance", "Trading", "Risk Management", "Algorithms"],
      color: "from-indigo-50 to-blue-50",
      borderColor: "border-indigo-200",
      accentColor: "text-indigo-600"
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
      lastUpdated: "2024-12-20",
      featured: false,
      tags: ["UX Design", "User Research", "Design Systems", "Accessibility", "Prototyping"],
      color: "from-pink-50 to-rose-50",
      borderColor: "border-pink-200",
      accentColor: "text-pink-600"
    }
  ];

  const categories = ['All', 'Programming', 'Web Development', 'Mathematics', 'Data Science', 'Language', 'Finance', 'Design'];

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

  const getDifficultyColor = (difficulty: Resource['difficulty']): string => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-orange-100 text-orange-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Award className="w-4 h-4 mr-2" />
              Premium Learning Resources
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Professional Resource Library
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Access curated, industry-grade learning materials designed by experts to accelerate your professional growth and technical expertise
            </p>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Advanced Search */}
              <div className="lg:col-span-2 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Resources</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by title, description, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <Filter className="absolute right-4 top-12 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Sort Options */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="recent">Recently Updated</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
                <TrendingUp className="absolute right-4 top-12 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">
                  Showing <span className="font-semibold text-blue-600">{sortedAndFilteredResources.length}</span> of {resources.length} resources
                </span>
                {(searchTerm || selectedCategory !== 'All' || selectedType !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                      setSelectedType('All');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Resources Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {sortedAndFilteredResources.map((resource, index) => (
            <div
              key={resource.id}
              className={`group relative bg-gradient-to-br ${resource.color} rounded-2xl border-2 ${resource.borderColor} p-8 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] cursor-pointer overflow-hidden`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Featured Badge */}
              {resource.featured && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  FEATURED
                </div>
              )}

              {/* Resource Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 bg-white rounded-2xl shadow-sm ${resource.accentColor} group-hover:shadow-md transition-shadow duration-300`}>
                    {resource.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        {resource.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                        {resource.difficulty}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {resource.type}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sm text-amber-600 bg-white px-2 py-1 rounded-lg shadow-sm">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{resource.rating}</span>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                {resource.title}
              </h3>
              <p className="text-gray-700 mb-6 text-sm leading-relaxed line-clamp-3">
                {resource.description}
              </p>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{resource.duration}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{resource.studyTime}</div>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{resource.students.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Active learners</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {resource.tags.slice(0, 3).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-3 py-1 bg-white text-xs font-semibold text-gray-700 rounded-full shadow-sm border border-gray-100"
                  >
                    {tag}
                  </span>
                ))}
                {resource.tags.length > 3 && (
                  <span className="px-3 py-1 bg-gray-100 text-xs font-semibold text-gray-600 rounded-full">
                    +{resource.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Last Updated */}
              <div className="flex items-center space-x-2 text-xs text-gray-500 mb-6">
                <Calendar className="w-3 h-3" />
                <span>Updated {new Date(resource.lastUpdated).toLocaleDateString()}</span>
              </div>

              {/* Premium Actions */}
              <div className="flex space-x-3">
                <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                  <Download className="w-4 h-4" />
                  <span>Access Resource</span>
                </button>
                <button className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md">
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced No Results */}
        {sortedAndFilteredResources.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 max-w-md mx-auto">
              <div className="text-gray-400 mb-6">
                <Search className="w-20 h-20 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No resources found</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
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

      {/* Professional Footer Section */}
      <div className="bg-white border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Can't find what you're looking for?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Request specific resources or suggest new topics for our expert team to create.
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl">
              Request New Resource
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesHub;