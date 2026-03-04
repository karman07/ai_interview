
const routes = {
  home: "/",
  about: "/about",
  contact: "/contact",
  interview: "/interview",
  pricing: "/pricing",
  jobsPublic: "/jobs-public",
  login: '/login',
  signup: '/signup',
  verifyEmail: '/verify-email',
  profile: '/profile',
  completeProfile: '/complete-profile',
  dashboard: '/dashboard',
  resources: '/resources',
  jobListings: '/jobs',
  employeePortal: '/employee',
  subjects: '/subjects',
  subjectDetails: (id: string) => `/subjects/${id}`,
  lessonDetails: (id: string) => `/lessons/${id}`,
  interviewHome: '/interview_round',
  interviewStart: (type: string) => `/interview/start/${type}`,
  interviewRoom: (type: string) => `/interview/room/${type}`,
  interviewResults: '/interview/results',
  interviewHistory: '/interview/history',
  resumeBuilder: '/resume-builder',
};

export default routes;
