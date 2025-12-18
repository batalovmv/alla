export const ROUTES = {
  HOME: '/',
  PROCEDURES: '/procedures',
  PROCEDURE_DETAIL: (id: string) => `/procedures/${id}`,
  ABOUT: '/about',
  REVIEWS: '/reviews',
  CONTACTS: '/contacts',
  ADMIN_LOGIN: '/admin/login',
  ADMIN: '/admin',
  ADMIN_PROCEDURES: '/admin/procedures',
  ADMIN_REVIEWS: '/admin/reviews',
  ADMIN_CONTACTS: '/admin/contacts',
  ADMIN_ABOUT: '/admin/about',
  ADMIN_BOOKINGS: '/admin/bookings',
} as const

