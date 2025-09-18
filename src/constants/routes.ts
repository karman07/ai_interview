
const routes = {
  home: "/",
  about: "/about",
  interview: "/interview",
  pricing: "/pricing",
  login: '/login',
  signup: '/signup',
  profile: '/profile',
  completeProfile: '/complete-profile',
  dashboard: '/dashboard',
  resources: '/resources',
  jobListings: '/jobs',
  subjects: '/subjects',
  subjectDetails: (id: string) => `/subjects/${id}`,
  lessonDetails: (id: string) => `/lessons/${id}`,
  interviewHome: '/interview_round',
  interviewStart: (type: string) => `/interview/start/${type}`,
  interviewRoom: (type: string) => `/interview/room/${type}`,
  interviewResults: '/interview/results',
};

export default routes;
