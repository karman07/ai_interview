
const routes = {
  home: "/",
  about: "/about",
  contact: "/contact",
  interview: "/interview",
  pricing: "/pricing",
  jobsPublic: "/jobs-public",
  login: '/login',
  signup: '/signup',
  profile: '/profile',
  completeProfile: '/complete-profile',
  dashboard: '/dashboard',
  resources: '/resources',
  jobListings: '/jobs',
  // Employee Routes
  employeeDashboard: '/employee/dashboard',
  employeeJobs: '/employee/jobs',
  employeeJobDetails: (jobId: string) => `/employee/jobs/${jobId}`,
  employeeApplications: '/employee/applications',
  employeeApplicationDetails: (applicationId: string) => `/employee/applications/${applicationId}`,
  employeeInterviews: '/employee/interviews',
  employeeMessages: '/employee/messages',
  employeeInvitations: '/employee/invitations',
  subjects: '/subjects',
  subjectDetails: (id: string) => `/subjects/${id}`,
  lessonDetails: (id: string) => `/lessons/${id}`,
  interviewHome: '/interview_round',
  interviewStart: (type: string) => `/interview/start/${type}`,
  interviewRoom: (type: string) => `/interview/room/${type}`,
  interviewResults: '/interview/results',
  interviewHistory: '/interview/history',
  // DSA Routes
  dsaDashboard: '/dsa',
  dsaQuestions: '/dsa/questions',
  dsaQuestionDetails: (questionId: string) => `/dsa/questions/${questionId}`,
};

export default routes;
