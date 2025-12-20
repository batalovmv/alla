import React, { useMemo } from 'react'
import Button from '../../common/Button/Button'
import { ContactInfo } from '../../../types'
import { buildWhatsAppHref } from '../../../utils/whatsapp'
import { buildTelegramHref } from '../../../utils/telegram'
import { SITE_NAME } from '../../../config/constants'
import styles from './StickyActions.module.css'

interface StickyActionsProps {
  contactInfo: ContactInfo
}

const StickyActions: React.FC<StickyActionsProps> = ({ contactInfo }) => {
  const whatsappHref = useMemo(() => {
    if (contactInfo.whatsappEnabled === false) return null
    const text = `Здравствуйте! Хочу записаться в ${SITE_NAME}.`
    return buildWhatsAppHref({ whatsappPhone: contactInfo.whatsappPhone, text })
  }, [contactInfo.whatsappEnabled, contactInfo.whatsappPhone])

  const telegramHref = useMemo(() => {
    return buildTelegramHref({ telegramLink: contactInfo.socialMedia.telegram })
  }, [contactInfo.socialMedia.telegram])

  const hasAny = Boolean(contactInfo.phone) || Boolean(whatsappHref)
  if (!hasAny) return null

  return (
    <div className={styles.wrap} role="region" aria-label="Быстрые действия">
      <div className={styles.bar}>
        <a className={styles.link} href={`tel:${contactInfo.phone}`}>
          <Button size="large">Позвонить</Button>
        </a>
        {whatsappHref && (
          <a
            className={styles.link}
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="large" variant="outline">
              WhatsApp
            </Button>
          </a>
        )}
        {telegramHref && (
          <a
            className={styles.link}
            href={telegramHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="large" variant="outline">
              Telegram
            </Button>
          </a>
        )}
      </div>
    </div>
  )
}

export default StickyActions


