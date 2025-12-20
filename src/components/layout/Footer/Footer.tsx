import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../../../store/hooks'
import { ROUTES } from '../../../config/routes'
import { CONTACT_INFO, SITE_NAME, SITE_DESCRIPTION } from '../../../config/constants'
import { isAdminUid } from '../../../config/admin'
import { ContactInfo } from '../../../types'
import LoginModal from '../../auth/LoginModal/LoginModal'
import styles from './Footer.module.css'

interface FooterProps {
  contactInfo?: ContactInfo
}

const Footer: React.FC<FooterProps> = ({ contactInfo }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const { user } = useAppSelector((state) => state.auth)
  const ci: ContactInfo =
    contactInfo || { ...CONTACT_INFO, mapEmbedUrl: '', whatsappPhone: '' }

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3>{SITE_NAME}</h3>
            <p>{SITE_DESCRIPTION}</p>
          </div>

          <div className={styles.section}>
            <h4>Навигация</h4>
            <nav className={styles.nav}>
              <Link to={ROUTES.HOME}>Главная</Link>
              <Link to={ROUTES.PROCEDURES}>Процедуры</Link>
              <Link to={ROUTES.ABOUT}>О специалисте</Link>
              <Link to={ROUTES.REVIEWS}>Отзывы</Link>
              <Link to={ROUTES.CONTACTS}>Контакты</Link>
            </nav>
          </div>

          <div className={styles.section}>
            <h4>Контакты</h4>
            <div className={styles.contacts}>
              <a href={`tel:${ci.phone}`}>{ci.phone}</a>
              <a href={`mailto:${ci.email}`}>{ci.email}</a>
              <p>{ci.address}</p>
              <p>{ci.workingHours}</p>
            </div>
          </div>

          <div className={styles.section}>
            <h4>Социальные сети</h4>
            <div className={styles.social}>
              {ci.socialMedia.instagram && (
                <a
                  href={ci.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  Instagram
                </a>
              )}
              {ci.socialMedia.vk && (
                <a
                  href={ci.socialMedia.vk}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="VKontakte"
                >
                  VK
                </a>
              )}
              {ci.socialMedia.telegram && (
                <a
                  href={ci.socialMedia.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                >
                  Telegram
                </a>
              )}
              {ci.socialMedia.whatsapp && (
                <a
                  href={ci.socialMedia.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        <div className={styles.copyright}>
          <p>&copy; {new Date().getFullYear()} {SITE_NAME}. Все права защищены.</p>
          <Link to={ROUTES.PRIVACY} className={styles.adminLink}>
            Политика конфиденциальности
          </Link>
          {!user && (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className={styles.adminLink}
              type="button"
            >
              Вход для администратора
            </button>
          )}
          {user && isAdminUid(user.uid) && (
            <Link to={ROUTES.ADMIN} className={styles.adminLink}>
              Админ-панель
            </Link>
          )}
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </footer>
  )
}

export default Footer


