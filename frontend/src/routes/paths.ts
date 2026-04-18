export const paths = {
  public: {
    home: '/',
    process: '/process',
    faq: '/faq',
    knowledge: '/knowledge',
    contact: '/contact',
    notFound: '*',
  },
  auth: {
    select: '/auth',
    login: '/auth/login',
    registerDonor: '/auth/register/donor',
    registerHospital: '/auth/register/hospital',
    forgotPassword: '/auth/forgot-password',
  },
  donor: {
    dashboard: '/donor/dashboard',
    profile: '/donor/profile',
    history: '/donor/history',
    appointments: '/donor/appointments',
  },
  hospital: {
    dashboard: '/hospital/dashboard',
    bloodRequests: '/hospital/requests',
    donorMatching: '/hospital/matching',
    reports: '/hospital/reports',
  },
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    hospitals: '/admin/hospitals',
    articles: '/admin/articles',
    settings: '/admin/settings',
  }
}
