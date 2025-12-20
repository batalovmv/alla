import React, { useMemo } from 'react'
import Button from '../../common/Button/Button'
import { ContactInfo } from '../../../types'
import { buildWhatsAppHref } from '../../../utils/whatsapp'
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
      </div>
    </div>
  )
}

export default StickyActions


