import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { CONTACT_INFO, SITE_NAME } from '../../../config/constants'
import { ContactInfo } from '../../../types'
import {
  prefetchHomePage,
  prefetchProceduresPage,
  prefetchAboutPage,
  prefetchReviewsPage,
  prefetchContactsPage,
} from '../../../utils/prefetchPages'
import Button from '../../common/Button/Button'
import styles from './Header.module.css'

interface HeaderProps {
  contactInfo?: ContactInfo
}

const Header: React.FC<HeaderProps> = ({ contactInfo }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const ci: ContactInfo =
    contactInfo || { ...CONTACT_INFO, mapEmbedUrl: '', whatsappPhone: '' }

  const isActive = (path: string) => location.pathname === path

  const prefetchByPath: Record<string, () => void> = {
    [ROUTES.HOME]: prefetchHomePage,
    [ROUTES.PROCEDURES]: prefetchProceduresPage,
    [ROUTES.ABOUT]: prefetchAboutPage,
    [ROUTES.REVIEWS]: prefetchReviewsPage,
    [ROUTES.CONTACTS]: prefetchContactsPage,
  }

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
          <h1>{SITE_NAME}</h1>
        </Link>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
              onClick={() => setIsMenuOpen(false)}
              onMouseEnter={() => prefetchByPath[item.path]?.()}
              onFocus={() => prefetchByPath[item.path]?.()}
              onTouchStart={() => prefetchByPath[item.path]?.()}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <a href={`tel:${ci.phone}`} className={styles.phone}>
            {ci.phone}
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


