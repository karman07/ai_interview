import React, { useState, useEffect } from 'react';
import { apiService, Subject, Lesson, Quiz, CreateSubjectDto, CreateLessonDto, CreateQuizDto, getFullImageUrl } from '../../services/api';
import { getTheme, COLORS } from '../../constants/colors';
import { EmptyState, Icons } from '../ui/EmptyState';

interface CoursesProps {
  isDarkMode?: boolean;
}

const Courses: React.FC<CoursesProps> = ({ isDarkMode = false }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'subjects' | 'lessons' | 'quizzes'>('subjects');
  const [simpleView, setSimpleView] = useState(false);
  
  // Form states
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const theme = getTheme(isDarkMode);

  useEffect(() => {
    const fetchCoursesData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching courses data...');
        
        const subjectsRes = await apiService.getSubjects();
        
        console.log('Subjects data:', subjectsRes);
        
        setSubjects(Array.isArray(subjectsRes) ? subjectsRes : []);
        
        if (subjectsRes.length > 0) {
          setSelectedSubject(subjectsRes[0]);
          await fetchLessonsForSubject(subjectsRes[0]._id);
        }
      } catch (err: any) {
        console.error('Courses API Error:', err);
        setError('Failed to fetch courses data. Using mock data for demonstration.');
        // Set mock data for demonstration
        const mockSubjects: Subject[] = [
          {
            _id: '1',
            title: 'JavaScript Fundamentals',
            description: 'Learn the basics of JavaScript programming language',
            category: 'Programming',
            level: 'Beginner',
            estimatedTime: '4 weeks',
            thumbnailUrl: 'https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=JS',
            rating: 4.5,
            status: 'published',
            author: 'John Doe',
            content: [
              { heading: 'Introduction', points: ['Variables and Data Types', 'Functions and Scope', 'Objects and Arrays'] },
              { heading: 'Advanced Concepts', points: ['Closures', 'Promises', 'Async/Await'] }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '2',
            title: 'React Development',
            description: 'Build modern web applications with React',
            category: 'Frontend',
            level: 'Intermediate',
            estimatedTime: '6 weeks',
            thumbnailUrl: 'https://via.placeholder.com/150x150/61DAFB/000000?text=React',
            rating: 4.8,
            status: 'published',
            author: 'Jane Smith',
            content: [
              { heading: 'React Basics', points: ['Components', 'Props', 'State'] },
              { heading: 'Advanced React', points: ['Hooks', 'Context', 'Performance'] }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setSubjects(mockSubjects);
        setSelectedSubject(mockSubjects[0]);
        console.log('Using mock subjects data:', mockSubjects);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesData();
  }, []);

  const fetchLessonsForSubject = async (subjectId: string) => {
    try {
      console.log(`Fetching lessons for subject: ${subjectId}`);
      const lessonsRes = await apiService.getLessonsBySubject(subjectId);
      console.log('📋 Lessons data:', lessonsRes);
      setLessons(Array.isArray(lessonsRes) ? lessonsRes : []);
      
      if (lessonsRes.length > 0) {
        setSelectedLesson(lessonsRes[0]);
        await fetchQuizzesForLesson(lessonsRes[0]._id);
      }
    } catch (err: any) {
      console.error('Lessons API Error:', err);
      // Mock lessons data
      const mockLessons: Lesson[] = [
        {
          _id: '1',
          subjectId,
          title: 'Introduction to Variables',
          description: 'Learn about different types of variables in JavaScript',
          content: [
            { heading: 'Variable Types', points: ['let', 'const', 'var'] },
            { heading: 'Best Practices', points: ['Use const by default', 'Use let for reassignment', 'Avoid var'] }
          ],
          videoUrl: 'https://www.youtube.com/watch?v=example1',
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          subjectId,
          title: 'Functions and Scope',
          description: 'Understanding function declarations and scope in JavaScript',
          content: [
            { heading: 'Function Types', points: ['Function Declaration', 'Function Expression', 'Arrow Functions'] },
            { heading: 'Scope', points: ['Global Scope', 'Function Scope', 'Block Scope'] }
          ],
          videoUrl: 'https://www.youtube.com/watch?v=example2',
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setLessons(mockLessons);
      setSelectedLesson(mockLessons[0]);
      console.log('Using mock lessons data:', mockLessons);
    }
  };

  const fetchQuizzesForLesson = async (lessonId: string) => {
    try {
      console.log(`Fetching quizzes for lesson: ${lessonId}`);
      const quizzesRes = await apiService.getQuizzesByLesson(lessonId);
      console.log('🧠 Quizzes data:', quizzesRes);
      setQuizzes(Array.isArray(quizzesRes) ? quizzesRes : []);
    } catch (err: any) {
      console.error('Quizzes API Error:', err);
      // Mock quizzes data
      const mockQuizzes: Quiz[] = [
        {
          _id: '1',
          lessonId,
          question: 'Which keyword is used to declare a block-scoped variable?',
          options: ['var', 'let', 'const', 'function'],
          correctAnswer: 'let',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          lessonId,
          question: 'Which keyword should you use for values that won\'t change?',
          options: ['var', 'let', 'const', 'static'],
          correctAnswer: 'const',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setQuizzes(mockQuizzes);
      console.log('Using mock quizzes data:', mockQuizzes);
    }
  };

  // Subject CRUD operations
  const handleSubjectSelect = async (subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView('subjects');
    await fetchLessonsForSubject(subject._id);
  };

  const handleCreateSubject = async (data: CreateSubjectDto) => {
    try {
      console.log('➕ Creating subject:', data);
      const newSubject = await apiService.createSubject(data);
      setSubjects([...subjects, newSubject]);
      setShowSubjectForm(false);
      console.log('Subject created:', newSubject);
    } catch (err: any) {
      console.error('Create subject error:', err);
      setError('Failed to create subject');
    }
  };

  const handleEditSubject = async (id: string, data: Partial<CreateSubjectDto>) => {
    try {
      console.log('✏️ Updating subject:', id, data);
      const updatedSubject = await apiService.updateSubject(id, data);
      setSubjects(subjects.map(s => s._id === id ? updatedSubject : s));
      setEditingSubject(null);
      console.log('Subject updated:', updatedSubject);
    } catch (err: any) {
      console.error('Update subject error:', err);
      setError('Failed to update subject');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        console.log('🗑️ Deleting subject:', id);
        await apiService.deleteSubject(id);
        setSubjects(subjects.filter(s => s._id !== id));
        if (selectedSubject?._id === id) {
          setSelectedSubject(null);
          setLessons([]);
          setQuizzes([]);
        }
        console.log('Subject deleted');
      } catch (err: any) {
        console.error('Delete subject error:', err);
        setError('Failed to delete subject');
      }
    }
  };

  // Lesson CRUD operations
  const handleLessonSelect = async (lesson: Lesson) => {
    setSelectedLesson(lesson);
    // switch to quizzes view when user explicitly selects to view quizzes
    setCurrentView('quizzes');
    await fetchQuizzesForLesson(lesson._id);
  };

  const handleCreateLesson = async (data: CreateLessonDto) => {
    try {
      console.log('➕ Creating lesson:', data);
      const newLesson = await apiService.createLesson(data);
      setLessons([...lessons, newLesson]);
      setShowLessonForm(false);
      console.log('Lesson created:', newLesson);
    } catch (err: any) {
      console.error('Create lesson error:', err);
      setError('Failed to create lesson');
    }
  };

  const handleEditLesson = async (id: string, data: Partial<CreateLessonDto>) => {
    try {
      console.log('✏️ Updating lesson:', id, data);
      const updatedLesson = await apiService.updateLesson(id, data);
      setLessons(lessons.map(l => l._id === id ? updatedLesson : l));
      setEditingLesson(null);
      console.log('Lesson updated:', updatedLesson);
    } catch (err: any) {
      console.error('Update lesson error:', err);
      setError('Failed to update lesson');
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        console.log('🗑️ Deleting lesson:', id);
        await apiService.deleteLesson(id);
        setLessons(lessons.filter(l => l._id !== id));
        if (selectedLesson?._id === id) {
          setSelectedLesson(null);
          setQuizzes([]);
        }
        console.log('Lesson deleted');
      } catch (err: any) {
        console.error('Delete lesson error:', err);
        setError('Failed to delete lesson');
      }
    }
  };

  // Quiz CRUD operations
  const handleCreateQuiz = async (data: CreateQuizDto) => {
    try {
      console.log('➕ Creating quiz:', data);
      const newQuiz = await apiService.createQuiz(data);
      setQuizzes([...quizzes, newQuiz]);
      setShowQuizForm(false);
      console.log('✅ Quiz created:', newQuiz);
    } catch (err: any) {
      console.error('❌ Create quiz error:', err);
      setError('Failed to create quiz');
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        console.log('🗑️ Deleting quiz:', id);
        await apiService.deleteQuiz(id);
        setQuizzes(quizzes.filter(q => q._id !== id));
        console.log('✅ Quiz deleted');
      } catch (err: any) {
        console.error('❌ Delete quiz error:', err);
        setError('Failed to delete quiz');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary[600] }}></div>
      </div>
    );
  }

  // Subject Form Component
  const SubjectForm: React.FC<{ subject?: Subject; onSubmit: (data: CreateSubjectDto) => void; onCancel: () => void }> = ({ subject, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<CreateSubjectDto>({
      title: subject?.title || '',
      description: subject?.description || '',
      category: subject?.category || '',
      level: subject?.level || 'Beginner',
      estimatedTime: subject?.estimatedTime || '',
      author: subject?.author || '',
      content: subject?.content || []
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto" style={{ backgroundColor: theme.card }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
            {subject ? 'Edit Course' : 'Create New Course'}
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>Estimated Time</label>
                  <input
                    type="text"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                    placeholder="e.g., 4 weeks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                style={{ borderColor: theme.border, color: theme.text.secondary }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {subject ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Lesson Form Component
  const LessonForm: React.FC<{ lesson?: Lesson; onSubmit: (data: CreateLessonDto) => void; onCancel: () => void }> = ({ lesson, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<CreateLessonDto>({
      subjectId: selectedSubject?._id || '',
      title: lesson?.title || '',
      description: lesson?.description || '',
      content: lesson?.content || [],
      videoUrl: lesson?.videoUrl || '',
      order: lesson?.order || 1
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto" style={{ backgroundColor: theme.card }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
            {lesson ? 'Edit Lesson' : 'Create New Lesson'}
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>Video URL</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                    min="1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                style={{ borderColor: theme.border, color: theme.text.secondary }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {lesson ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Quiz Form Component
  const QuizForm: React.FC<{ quiz?: Quiz; onSubmit: (data: CreateQuizDto) => void; onCancel: () => void }> = ({ quiz, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<CreateQuizDto>({
      lessonId: selectedLesson?._id || '',
      question: quiz?.question || '',
      options: quiz?.options || ['', '', '', ''],
      correctAnswer: quiz?.correctAnswer || ''
    });

    const updateOption = (index: number, value: string) => {
      const newOptions = [...formData.options];
      newOptions[index] = value;
      setFormData({ ...formData, options: newOptions });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto" style={{ backgroundColor: theme.card }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text.primary }}>
            {quiz ? 'Edit Quiz' : 'Create New Quiz'}
          </h3>
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>Question</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>Options</label>
                {formData.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.text.secondary }}>Correct Answer</label>
                <select
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text.primary }}
                  required
                >
                  <option value="">Select correct answer</option>
                  {formData.options.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                style={{ borderColor: theme.border, color: theme.text.secondary }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {quiz ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>Course Management</h1>
          <p className="mt-2" style={{ color: theme.text.secondary }}>
            Manage your educational courses, lessons, and quizzes
          </p>
        </div>
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm" style={{ color: theme.text.secondary }}>
          <button
            onClick={() => setSimpleView(s => !s)}
            className={`px-2 py-1 rounded text-sm border ${simpleView ? 'bg-gray-100' : ''}`}
            title="Toggle simple card view"
          >
            {simpleView ? 'Detailed view' : 'Simple cards'}
          </button>
          <span />
          <button
            onClick={() => setCurrentView('subjects')}
            className={`hover:text-blue-600 ${currentView === 'subjects' ? 'font-semibold text-blue-600' : ''}`}
          >
            Courses ({subjects.length})
          </button>
          {selectedSubject && (
            <>
              <span>→</span>
              <button
                onClick={() => setCurrentView('lessons')}
                className={`hover:text-blue-600 ${currentView === 'lessons' ? 'font-semibold text-blue-600' : ''}`}
              >
                Lessons ({lessons.length})
              </button>
            </>
          )}
          {selectedLesson && (
            <>
              <span>→</span>
              <button
                onClick={() => setCurrentView('quizzes')}
                className={`hover:text-blue-600 ${currentView === 'quizzes' ? 'font-semibold text-blue-600' : ''}`}
              >
                Quizzes ({quizzes.length})
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg border" style={{ backgroundColor: theme.warning, borderColor: theme.border }}>
          <p style={{ color: theme.text.primary }}>{error}</p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Always show subjects */}
        <div className="col-span-3">
          <div className="sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: theme.text.primary }}>Courses</h2>
              <button
                onClick={() => setShowSubjectForm(true)}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                title="Add Course"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {subjects.length === 0 ? (
                <EmptyState
                  icon={<Icons.BookOpen />}
                  title="No Courses Found"
                  description="Get started by creating your first course. Add subjects, lessons, and quizzes to build your educational content."
                  isDarkMode={isDarkMode}
                  action={
                    <button
                      onClick={() => setShowSubjectForm(true)}
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                      style={{ backgroundColor: COLORS.primary[600] }}
                    >
                      Create First Course
                    </button>
                  }
                />
              ) : simpleView ? (
                <div className="grid grid-cols-1 gap-3">
                  {subjects.map(s => (
                    <div
                      key={s._id}
                      onClick={() => handleSubjectSelect(s)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md flex items-center space-x-3 ${selectedSubject?._id === s._id ? 'border-blue-500 bg-blue-50' : ''}`}
                      style={{ backgroundColor: selectedSubject?._id === s._id ? COLORS.primary[50] : theme.card, borderColor: selectedSubject?._id === s._id ? COLORS.primary[500] : theme.border }}
                    >
                      {s.thumbnailUrl && (
                        <img src={getFullImageUrl(s.thumbnailUrl) || undefined} alt={s.title} className="w-12 h-12 rounded object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate" style={{ color: theme.text.primary }}>{s.title}</h4>
                        <p className="text-xs text-muted truncate" style={{ color: theme.text.secondary }}>{s.level} • {s.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold" style={{ color: theme.text.primary }}>⭐ {s.rating}</div>
                        <div className="text-xs" style={{ color: theme.text.muted }}>{s.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {subjects.map((subject) => (
                    <div
                      key={subject._id}
                      onClick={() => handleSubjectSelect(subject)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedSubject?._id === subject._id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      style={{ 
                        backgroundColor: selectedSubject?._id === subject._id ? COLORS.primary[50] : theme.card, 
                        borderColor: selectedSubject?._id === subject._id ? COLORS.primary[500] : theme.border 
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        {subject.thumbnailUrl && (
                          <img 
                            src={getFullImageUrl(subject.thumbnailUrl) || undefined}
                            alt={subject.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate" style={{ color: theme.text.primary }}>
                            {subject.title}
                          </h3>
                          <p className="text-xs mt-1 truncate" style={{ color: theme.text.secondary }}>
                            {subject.level} • {subject.category}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs px-1 py-0.5 rounded" 
                                  style={{ backgroundColor: COLORS.primary[100], color: COLORS.primary[700] }}>
                              ⭐ {subject.rating}
                            </span>
                            <span className={`text-xs px-1 py-0.5 rounded ${
                              subject.status === 'published' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {subject.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingSubject(subject); }}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteSubject(subject._id); }}
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-9">
          {/* Quick summary cards to make migration easier */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="p-4 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="text-sm font-medium" style={{ color: theme.text.secondary }}>Subjects</div>
              <div className="text-2xl font-bold" style={{ color: theme.text.primary }}>{subjects.length}</div>
            </div>
            <div className="p-4 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="text-sm font-medium" style={{ color: theme.text.secondary }}>Lessons</div>
              <div className="text-2xl font-bold" style={{ color: theme.text.primary }}>{lessons.length}</div>
            </div>
            <div className="p-4 rounded-lg shadow-sm border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <div className="text-sm font-medium" style={{ color: theme.text.secondary }}>Quizzes</div>
              <div className="text-2xl font-bold" style={{ color: theme.text.primary }}>{quizzes.length}</div>
            </div>
          </div>
          {currentView === 'subjects' && selectedSubject && (
            <div className="space-y-6">
              <div className="p-6 rounded-lg border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    {selectedSubject.thumbnailUrl && (
                      <img 
                        src={getFullImageUrl(selectedSubject.thumbnailUrl) || undefined}
                        alt={selectedSubject.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h2 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                        {selectedSubject.title}
                      </h2>
                      <p className="text-gray-600 mt-2">{selectedSubject.description}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="text-sm px-3 py-1 rounded-full" 
                              style={{ backgroundColor: COLORS.primary[100], color: COLORS.primary[700] }}>
                          {selectedSubject.level}
                        </span>
                        <span className="text-sm" style={{ color: theme.text.muted }}>
                          {selectedSubject.category}
                        </span>
                        <span className="text-sm" style={{ color: theme.text.muted }}>
                          ⭐ {selectedSubject.rating}
                        </span>
                        <span className="text-sm" style={{ color: theme.text.muted }}>
                          📅 {selectedSubject.estimatedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView('lessons')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Lessons ({lessons.length})
                  </button>
                </div>
                
                {selectedSubject.content && selectedSubject.content.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: theme.text.primary }}>Course Content</h3>
                    <div className="space-y-4">
                      {selectedSubject.content.map((block, index) => (
                        <div key={index} className="p-4 rounded-lg" style={{ backgroundColor: theme.bgSecondary }}>
                          <h4 className="font-medium mb-2" style={{ color: theme.text.primary }}>{block.heading}</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {block.points.map((point, pointIndex) => (
                              <li key={pointIndex} className="text-sm" style={{ color: theme.text.secondary }}>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentView === 'lessons' && selectedSubject && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: theme.text.primary }}>
                    Lessons for "{selectedSubject.title}"
                  </h2>
                  <p className="text-sm" style={{ color: theme.text.secondary }}>
                    {lessons.length} lessons available
                  </p>
                </div>
                <button
                  onClick={() => setShowLessonForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Lesson
                </button>
              </div>
              
              <div className="space-y-4">
                {lessons.length === 0 ? (
                  <EmptyState
                    icon={<Icons.ClipboardList />}
                    title="No Lessons Yet"
                    description="Start building your course by adding lessons with content, videos, and learning materials."
                    isDarkMode={isDarkMode}
                    action={
                      <button
                        onClick={() => setShowLessonForm(true)}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                        style={{ backgroundColor: COLORS.primary[600] }}
                      >
                        Add First Lesson
                      </button>
                    }
                  />
                ) : (
                  lessons.map((lesson) => (
                  <div
                    key={lesson._id}
                    className="p-6 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                    style={{ backgroundColor: theme.card, borderColor: theme.border }}
                    onClick={() => handleLessonSelect(lesson)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium px-2 py-1 rounded" 
                                style={{ backgroundColor: COLORS.green[100], color: COLORS.green[700] }}>
                            Lesson {lesson.order}
                          </span>
                          {lesson.videoUrl && (
                            <span className="text-xs px-2 py-1 rounded-full" 
                                  style={{ backgroundColor: COLORS.red[100], color: COLORS.red[700] }}>
                              📹 Video
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold" style={{ color: theme.text.primary }}>
                          {lesson.title}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: theme.text.secondary }}>
                          {lesson.description}
                        </p>
                        {lesson.content && lesson.content.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium" style={{ color: theme.text.muted }}>
                              Content: {lesson.content.map(c => c.heading).join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingLesson(lesson); }}
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteLesson(lesson._id); }}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleLessonSelect(lesson)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          View Quizzes
                        </button>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}

          {currentView === 'quizzes' && selectedLesson && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: theme.text.primary }}>
                    Quizzes for "{selectedLesson.title}"
                  </h2>
                  <p className="text-sm" style={{ color: theme.text.secondary }}>
                    {quizzes.length} quizzes available
                  </p>
                </div>
                <button
                  onClick={() => setShowQuizForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Quiz
                </button>
              </div>
              
              <div className="space-y-4">
                {quizzes.length === 0 ? (
                  <EmptyState
                    icon={<Icons.QuestionMarkCircle />}
                    title="No Quizzes Created"
                    description="Enhance learning with interactive quizzes. Add questions to test comprehension and reinforce key concepts."
                    isDarkMode={isDarkMode}
                    action={
                      <button
                        onClick={() => setShowQuizForm(true)}
                        className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                        style={{ backgroundColor: COLORS.primary[600] }}
                      >
                        Create First Quiz
                      </button>
                    }
                  />
                ) : (
                  quizzes.map((quiz, index) => (
                  <div
                    key={quiz._id}
                    className="p-6 rounded-lg border hover:shadow-md transition-shadow"
                    style={{ backgroundColor: theme.card, borderColor: theme.border }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="text-sm font-medium px-2 py-1 rounded" 
                                style={{ backgroundColor: COLORS.purple[100], color: COLORS.purple[700] }}>
                            Question {index + 1}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-3" style={{ color: theme.text.primary }}>
                          {quiz.question}
                        </h3>
                        <div className="space-y-2">
                          {quiz.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={`p-3 rounded-md border ${
                                option === quiz.correctAnswer ? 'border-green-500 bg-green-50' : ''
                              }`}
                              style={{ 
                                backgroundColor: option === quiz.correctAnswer ? COLORS.green[50] : theme.bgSecondary,
                                borderColor: option === quiz.correctAnswer ? COLORS.green[500] : theme.border
                              }}
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <span style={{ color: theme.text.primary }}>{option}</span>
                                {option === quiz.correctAnswer && (
                                  <span className="text-green-600 text-sm font-medium">✓ Correct</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setEditingQuiz(quiz)}
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz._id)}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forms */}
      {showSubjectForm && (
        <SubjectForm
          onSubmit={handleCreateSubject}
          onCancel={() => setShowSubjectForm(false)}
        />
      )}

      {editingSubject && (
        <SubjectForm
          subject={editingSubject}
          onSubmit={(data) => handleEditSubject(editingSubject._id, data)}
          onCancel={() => setEditingSubject(null)}
        />
      )}

      {showLessonForm && (
        <LessonForm
          onSubmit={handleCreateLesson}
          onCancel={() => setShowLessonForm(false)}
        />
      )}

      {editingLesson && (
        <LessonForm
          lesson={editingLesson}
          onSubmit={(data) => handleEditLesson(editingLesson._id, data)}
          onCancel={() => setEditingLesson(null)}
        />
      )}

      {showQuizForm && (
        <QuizForm
          onSubmit={handleCreateQuiz}
          onCancel={() => setShowQuizForm(false)}
        />
      )}

      {editingQuiz && (
        <QuizForm
          quiz={editingQuiz}
          onSubmit={(data) => handleCreateQuiz(data)}
          onCancel={() => setEditingQuiz(null)}
        />
      )}
    </div>
  );
};

export default Courses;