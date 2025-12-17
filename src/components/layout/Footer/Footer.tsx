import React from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../config/routes'
import { CONTACT_INFO } from '../../../config/constants'
import styles from './Footer.module.css'

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3>Косметология</h3>
            <p>Профессиональные косметологические процедуры</p>
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
              <a href={`tel:${CONTACT_INFO.phone}`}>{CONTACT_INFO.phone}</a>
              <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
              <p>{CONTACT_INFO.address}</p>
              <p>{CONTACT_INFO.workingHours}</p>
            </div>
          </div>

          <div className={styles.section}>
            <h4>Социальные сети</h4>
            <div className={styles.social}>
              {CONTACT_INFO.socialMedia.instagram && (
                <a
                  href={CONTACT_INFO.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  Instagram
                </a>
              )}
              {CONTACT_INFO.socialMedia.vk && (
                <a
                  href={CONTACT_INFO.socialMedia.vk}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="VKontakte"
                >
                  VK
                </a>
              )}
              {CONTACT_INFO.socialMedia.telegram && (
                <a
                  href={CONTACT_INFO.socialMedia.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                >
                  Telegram
                </a>
              )}
              {CONTACT_INFO.socialMedia.whatsapp && (
                <a
                  href={CONTACT_INFO.socialMedia.whatsapp}
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
          <p>&copy; {new Date().getFullYear()} Косметология. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer


