export const ROUTES = {
  HOME: '/',
  PROCEDURES: '/procedures',
  PROCEDURE_DETAIL: (id: string) => `/procedures/${id}`,
  ABOUT: '/about',
  REVIEWS: '/reviews',
  CONTACTS: '/contacts',
} as const

