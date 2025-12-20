import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAppSelector } from '../../../store/hooks'
import { ROUTES } from '../../../config/routes'
import { PageFallback } from '../PageFallback/PageFallback'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, adminLoading, isAdmin } = useAppSelector((state) => state.auth)

  if (loading || adminLoading) {
    return <PageFallback variant="admin" />
  }

  if (!user) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />
  }

  if (!isAdmin) {
    // Важно: это НЕ заменяет Firebase Security Rules. Это только UX-барьер.
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div>
          <h2 style={{ marginBottom: 8 }}>Доступ запрещён</h2>
          <p style={{ marginBottom: 16 }}>
            Этот аккаунт не имеет прав администратора.
          </p>
          <Link to={ROUTES.ADMIN_LOGIN}>Перейти на страницу входа</Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute

