import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { CONTACT_INFO } from '../../../config/constants'
import Button from '../../common/Button/Button'
import styles from './Header.module.css'

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navItems = [
    { path: ROUTES.HOME, label: 'Главная' },
    { path: ROUTES.PROCEDURES, label: 'Процедуры' },
    { path: ROUTES.ABOUT, label: 'О специалисте' },
    { path: ROUTES.REVIEWS, label: 'Отзывы' },
    { path: ROUTES.CONTACTS, label: 'Контакты' },
  ]

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to={ROUTES.HOME} className={styles.logo}>
          <h1>Косметология</h1>
        </Link>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <a href={`tel:${CONTACT_INFO.phone}`} className={styles.phone}>
            {CONTACT_INFO.phone}
          </a>
          <Link to={ROUTES.CONTACTS}>
            <Button size="small">Записаться</Button>
          </Link>
        </div>

        <button
          className={styles.menuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  )
}

export default Header


