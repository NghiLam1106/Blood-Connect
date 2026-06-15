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
    notifications: '/donor/notifications',
    hospitalDetail: '/donor/hospital/:hospitalId',
  },
  hospital: {
    dashboard: '/hospital/dashboard',
    bloodRequests: '/hospital/requests',
    donorMatching: '/hospital/matching',
    donorDetail: '/hospital/donors/:donorUserId',
    reports: '/hospital/reports',
  },
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    donors: '/admin/donors',
    donorDetail: '/admin/donors/:userId',
    hospitals: '/admin/hospitals',
    hospitalDetail: '/admin/hospitals/:userId',
    bloodCollect: '/admin/blood-collect',
    articles: '/admin/articles',
    settings: '/admin/settings',
  }
}
