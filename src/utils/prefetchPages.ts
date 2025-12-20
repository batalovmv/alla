/**
 * Prefetch page chunks (React.lazy dynamic imports) to make navigation feel instant.
 * Keep import paths in sync with src/App.tsx lazy() declarations.
 */

export function prefetchHomePage(): void {
  void import('../pages/Home/Home')
}

export function prefetchProceduresPage(): void {
  void import('../pages/Procedures/Procedures')
}

export function prefetchAboutPage(): void {
  void import('../pages/About/About')
}

export function prefetchReviewsPage(): void {
  void import('../pages/Reviews/Reviews')
}

export function prefetchContactsPage(): void {
  void import('../pages/Contacts/Contacts')
}

export function prefetchProcedureDetailPage(): void {
  void import('../pages/ProcedureDetail/ProcedureDetail')
}

export function prefetchPrivacyPage(): void {
  void import('../pages/Privacy/Privacy')
}


