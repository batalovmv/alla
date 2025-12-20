import React, { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from '../AdminSidebar/AdminSidebar'
import styles from './AdminLayout.module.css'

const AdminLayout: React.FC = () => {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setIsSidebarOpen((v) => !v), [])

  // Close drawer on route change (mobile UX).
  useEffect(() => {
    closeSidebar()
  }, [location.pathname, closeSidebar])

  // Close on Escape
  useEffect(() => {
    if (!isSidebarOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isSidebarOpen, closeSidebar])

  // Prevent background scroll when drawer is open (mobile only).
  useEffect(() => {
    if (!isSidebarOpen) return
    if (typeof window === 'undefined') return

    const mq = window.matchMedia('(max-width: 768px)')
    if (!mq.matches) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isSidebarOpen])

  return (
    <div className={styles.adminLayout}>
      <button
        type="button"
        className={styles.mobileToggle}
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? 'Закрыть меню' : 'Открыть меню'}
        aria-expanded={isSidebarOpen}
      >
        <span className={styles.mobileToggleIcon}>{isSidebarOpen ? '←' : '→'}</span>
      </button>

      {isSidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebar} aria-hidden="true" />
      )}

      <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout

