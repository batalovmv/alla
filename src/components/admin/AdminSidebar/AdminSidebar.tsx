import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { useAppDispatch } from '../../../store/hooks'
import { logout } from '../../../store/slices/authSlice'
import { auth } from '../../../config/firebase'
import { ROUTES } from '../../../config/routes'
import Button from '../../common/Button/Button'
import styles from './AdminSidebar.module.css'

type AdminSidebarProps = {
  isOpen?: boolean
  onClose?: () => void
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleLogout = async () => {
    if (!auth) {
      dispatch(logout())
      navigate(ROUTES.ADMIN_LOGIN)
      return
    }
    try {
      await signOut(auth!)
      dispatch(logout())
      navigate(ROUTES.ADMIN_LOGIN)
    } catch (error) {
      console.error('Ошибка выхода:', error)
    }
  }

  const menuItems = [
    { path: ROUTES.ADMIN, label: 'Дашборд', icon: '📊' },
    { path: ROUTES.ADMIN_PROCEDURES, label: 'Процедуры', icon: '💆' },
    { path: ROUTES.ADMIN_REVIEWS, label: 'Отзывы', icon: '⭐' },
    { path: ROUTES.ADMIN_BOOKINGS, label: 'Заявки', icon: '📅' },
    { path: ROUTES.ADMIN_CLIENTS, label: 'Клиенты', icon: '👥' },
    { path: ROUTES.ADMIN_REPORTS, label: 'Отчёты', icon: '📈' },
    { path: ROUTES.ADMIN_CONTACTS, label: 'Контакты', icon: '📞' },
    { path: ROUTES.ADMIN_ABOUT, label: 'О специалисте', icon: '👤' },
  ]

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Админ-панель</h2>
      </div>
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`${styles.navItem} ${
              location.pathname === item.path || 
              (item.path === ROUTES.ADMIN_CLIENTS && location.pathname.startsWith(ROUTES.ADMIN_CLIENTS))
                ? styles.active : ''
            }`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className={styles.footer}>
        <Link to={ROUTES.HOME} className={styles.homeLink} target="_blank" onClick={onClose}>
          ← На сайт
        </Link>
        <Button onClick={handleLogout} size="small" variant="secondary">
          Выйти
        </Button>
      </div>
    </aside>
  )
}

export default AdminSidebar

