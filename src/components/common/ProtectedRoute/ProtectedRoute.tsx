import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../../store/hooks'
import { ROUTES } from '../../../config/routes'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAppSelector((state) => state.auth)

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Загрузка...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

