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
    update: (id: string) => `/dog-details?id=${id}`,
    delete: (id: string) => `/dog-details?id=${id}`,
    get: (id: string) => `/dog-details?id=${id}`,
    bulkDelete: '/dogs/bulk-delete'
  },
  events: {
    list: '/shows',
    adminList: '/shows',
    upcoming: '/shows/upcoming',
    past: '/shows/completed',
    create: '/shows',
    update: (id: string) => `/shows/${id}`,
    delete: (id: string) => `/shows/${id}`,
    get: (id: string) => `/shows/${id}`,
    bulkDelete: '/shows/bulk-delete'
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
  entries: {
    list: '/entries',
    create: '/entries',
    update: (id: string) => `/entries/${id}`,
    delete: (id: string) => `/entries/${id}`,
    bulkDelete: '/entries/bulk-delete',
    bulkUpload: '/entries/bulk-upload',
    approve: '/entries/approve',
    reject: '/entries/reject',
    categories: '/entries/categories'
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
