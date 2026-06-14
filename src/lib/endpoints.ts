export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    profile: '/auth/profile'
  },
  dogs: {
    list: '/dogs',
    create: '/dogs',
    update: (id: string) => `/dogs/${id}`,
    delete: (id: string) => `/dogs/${id}`,
    get: (id: string) => `/dogs/${id}`,
    bulkDelete: '/dogs/bulk-delete'
  },
  events: {
    list: '/events',
    adminList: '/events/admin',
    upcoming: '/events/upcoming',
    past: '/events/past',
    create: '/events/admin',
    update: (id: string) => `/events/admin/${id}`,
    delete: (id: string) => `/events/admin/${id}`,
    get: (id: string) => `/events/${id}`,
    bulkDelete: '/events/admin/bulk-delete'
  },
  clubs: {
    list: '/clubs',
    create: '/clubs'
  },
  competitions: {
    matches: '/competitions/matches',
    score: '/competitions/matches/score'
  },
  registrations: {
    validate: '/registrations/validate',
    list: '/registrations',
    create: '/registrations',
    updateStatus: (id: string) => `/registrations/${id}/status`,
    bulkDelete: '/registrations/bulk-delete',
    userRegistrations: '/registrations/user'
  },
  judges: {
    list: '/judges',
    create: '/judges'
  },
  payments: {
    razorpay: '/payments/razorpay',
    transactions: '/payments/transactions',
    refunds: '/payments/refunds'
  },
  fci: {
    groups: '/fci',
    breeds: '/breeds'
  },
  dashboard: {
    stats: '/dashboard/stats',
    adminStats: '/dashboard/admin/stats'
  },
  ocr: {
    certificate: '/ocr/certificate'
  },
  certificates: '/certificates',
  winnerTags: '/winner-tags',
  notifications: '/notifications',
  users: {
    list: '/users',
    roles: '/users/roles'
  }
};
