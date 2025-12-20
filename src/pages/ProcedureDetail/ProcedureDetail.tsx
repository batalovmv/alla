import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setProcedures } from '../../store/slices/proceduresSlice'
import { fetchProcedures } from '../../utils/api'
import { isStale } from '../../utils/cache'
import { ROUTES } from '../../config/routes'
import { getContactInfo } from '../../utils/contactInfo'
import { buildWhatsAppHref } from '../../utils/whatsapp'
import { CONTACT_INFO, SITE_NAME } from '../../config/constants'
import { ContactInfo } from '../../types'
import Card from '../../components/common/Card/Card'
import Button from '../../components/common/Button/Button'
import ProcedureCard from '../../components/procedures/ProcedureCard/ProcedureCard'
import SEO from '../../components/common/SEO/SEO'
import styles from './ProcedureDetail.module.css'

const ProcedureDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const { items: procedures, lastFetched } = useAppSelector((state) => state.procedures)
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)

  useEffect(() => {
    const loadProcedures = async () => {
      const data = await fetchProcedures()
      dispatch(setProcedures(data))
    }
    const ttlMs = 5 * 60 * 1000
    if (procedures.length === 0 || isStale(lastFetched, ttlMs)) {
      loadProcedures()
    }
  }, [dispatch, procedures.length, lastFetched])

  useEffect(() => {
    let mounted = true
    getContactInfo()
      .then((ci) => {
        if (mounted) setContactInfo(ci)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const procedure = procedures.find((p) => p.id === id)

  if (!procedure) {
    return (
      <div className={styles.notFound}>
        <div className={styles.container}>
          <h1>Процедура не найдена</h1>
          <Link to={ROUTES.PROCEDURES}>
            <Button>Вернуться к списку процедур</Button>
          </Link>
        </div>
      </div>
    )
  }

  const relatedProcedures = procedures
    .filter(
      (p) => p.category === procedure.category && p.id !== procedure.id
    )
    .slice(0, 3)

  const ci = contactInfo || { ...CONTACT_INFO, mapEmbedUrl: '', whatsappPhone: '' }
  const whatsappHref = useMemo(() => {
    const text = `Здравствуйте! Хочу записаться в ${SITE_NAME} на процедуру "${procedure.name}".`
    return buildWhatsAppHref({ whatsappPhone: ci.whatsappPhone, text })
  }, [ci.whatsappPhone, procedure.name])

  return (
    <>
      <SEO
        title={procedure.name}
        description={procedure.description}
        keywords={`${procedure.name}, ${procedure.category}, косметология`}
      />
      <div className={styles.detail}>
        <div className={styles.container}>
          <div className={styles.content}>
          <div className={styles.imageSection}>
            <img
              src={procedure.images[0] || '/images/placeholder.jpg'}
              alt={procedure.name}
              className={styles.mainImage}
              loading="eager"
            />
            {procedure.images.length > 1 && (
              <div className={styles.imageGallery}>
                {procedure.images.slice(1).map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${procedure.name} ${index + 2}`}
                    className={styles.galleryImage}
                    loading="lazy"
                  />
                ))}
              </div>
            )}
          </div>

          <div className={styles.infoSection}>
            <h1 className={styles.title}>{procedure.name}</h1>
            <p className={styles.category}>{procedure.category}</p>
            <p className={styles.description}>{procedure.fullDescription}</p>

            <div className={styles.details}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Стоимость:</span>
                <span className={styles.detailValue}>{procedure.price} ₽</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Длительность:</span>
                <span className={styles.detailValue}>
                  {procedure.duration} минут
                </span>
              </div>
            </div>

            <Link to={ROUTES.CONTACTS_WITH_PROCEDURE(procedure.id)}>
              <Button size="large" className={styles.bookButton}>
                Записаться на процедуру
              </Button>
            </Link>
            {whatsappHref && (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="large" className={styles.bookButton}>
                  WhatsApp
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className={styles.sections}>
          {procedure.indications.length > 0 && (
            <Card className={styles.sectionCard}>
              <h2>Показания</h2>
              <ul className={styles.list}>
                {procedure.indications.map((indication, index) => (
                  <li key={index}>{indication}</li>
                ))}
              </ul>
            </Card>
          )}

          {procedure.contraindications.length > 0 && (
            <Card className={styles.sectionCard}>
              <h2>Противопоказания</h2>
              <ul className={styles.list}>
                {procedure.contraindications.map((contraindication, index) => (
                  <li key={index}>{contraindication}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {relatedProcedures.length > 0 && (
          <div className={styles.related}>
            <h2 className={styles.relatedTitle}>Похожие процедуры</h2>
            <div className={styles.relatedGrid}>
              {relatedProcedures.map((p) => (
                <ProcedureCard key={p.id} procedure={p} />
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  )
}

export default ProcedureDetail

