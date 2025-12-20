import React, { useEffect, useMemo, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setProcedures } from '../../store/slices/proceduresSlice'
import { setReviews } from '../../store/slices/reviewsSlice'
import { fetchProcedures, fetchReviews } from '../../utils/api'
import { isStale } from '../../utils/cache'
import { ROUTES } from '../../config/routes'
import { CONTACT_INFO, SITE_NAME } from '../../config/constants'
import { getContactInfo } from '../../utils/contactInfo'
import { buildWhatsAppHref } from '../../utils/whatsapp'
import { ContactInfo } from '../../types'
import ProcedureCard from '../../components/procedures/ProcedureCard/ProcedureCard'
import Button from '../../components/common/Button/Button'
import Card from '../../components/common/Card/Card'
import SEO from '../../components/common/SEO/SEO'
import styles from './Home.module.css'

const Home: React.FC = () => {
  const dispatch = useAppDispatch()
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const { items: procedures, lastFetched: proceduresLastFetched } = useAppSelector(
    (state) => state.procedures
  )
  const { items: reviews, averageRating, lastFetched: reviewsLastFetched } = useAppSelector(
    (state) => state.reviews
  )

  const loadData = useCallback(async () => {
    const proceduresTtlMs = 5 * 60 * 1000
    const reviewsTtlMs = 3 * 60 * 1000

    if (procedures.length === 0 || isStale(proceduresLastFetched, proceduresTtlMs)) {
      const proceduresData = await fetchProcedures()
      dispatch(setProcedures(proceduresData))
    }

    if (reviews.length === 0 || isStale(reviewsLastFetched, reviewsTtlMs)) {
      const reviewsData = await fetchReviews()
      dispatch(setReviews(reviewsData))
    }
  }, [dispatch, procedures.length, proceduresLastFetched, reviews.length, reviewsLastFetched])

  useEffect(() => {
    loadData()
  }, [loadData])

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

  const popularProcedures = useMemo(
    () => procedures.filter((p) => p.popular).slice(0, 4),
    [procedures]
  )

  const featuredReviews = useMemo(() => reviews.slice(0, 3), [reviews])
  const ci = contactInfo || { ...CONTACT_INFO, mapEmbedUrl: '', whatsappPhone: '' }

  const whatsappHref = useMemo(() => {
    const text = `Здравствуйте! Хочу записаться в ${SITE_NAME}.`
    return buildWhatsAppHref({ whatsappPhone: ci.whatsappPhone, text })
  }, [ci.whatsappPhone])

  return (
    <>
      <SEO
        title="Главная"
        description="Профессиональные косметологические процедуры. Индивидуальный подход, современные технологии, гарантия качества."
        keywords="косметология, косметолог, процедуры для лица, косметические услуги"
      />
      <div className={styles.home}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Профессиональная косметология
              <br />
              <span className={styles.heroSubtitle}>для вашей красоты</span>
            </h1>
            <p className={styles.heroDescription}>
              Индивидуальный подход к каждому клиенту. Современные технологии и
              проверенные методики для достижения идеального результата.
            </p>
            <div className={styles.heroActions}>
              <Link to={ROUTES.CONTACTS}>
                <Button size="large">Записаться на консультацию</Button>
              </Link>
              <Link to={ROUTES.PROCEDURES}>
                <Button variant="outline" size="large">
                  Посмотреть процедуры
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Popular Procedures */}
        {popularProcedures.length > 0 && (
          <section className={styles.section}>
            <div className={styles.container}>
              <h2 className={styles.sectionTitle}>Популярные процедуры</h2>
              <div className={styles.proceduresGrid}>
                {popularProcedures.map((procedure) => (
                  <ProcedureCard key={procedure.id} procedure={procedure} />
                ))}
              </div>
              <div className={styles.sectionAction}>
                <Link to={ROUTES.PROCEDURES}>
                  <Button variant="outline">Все процедуры</Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* About Section */}
        <section className={`${styles.section} ${styles.aboutSection}`}>
          <div className={styles.container}>
            <div className={styles.aboutContent}>
              <div className={styles.aboutText}>
                <h2 className={styles.sectionTitle}>О специалисте</h2>
                <p>
                  Опытный косметолог с многолетним стажем работы. Постоянно
                  повышаю квалификацию, посещаю семинары и мастер-классы ведущих
                  специалистов индустрии красоты.
                </p>
                <p>
                  Использую только сертифицированные препараты и современное
                  оборудование. Индивидуальный подход к каждому клиенту и
                  гарантия качества услуг.
                </p>
                <Link to={ROUTES.ABOUT}>
                  <Button>Узнать больше</Button>
                </Link>
              </div>
              <div className={styles.aboutImage}>
                <div className={styles.imagePlaceholder}>
                  <span>Фото специалиста</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advantages */}
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Почему выбирают нас</h2>
            <div className={styles.advantagesGrid}>
              <Card className={styles.advantageCard}>
                <div className={styles.advantageIcon}>✓</div>
                <h3>Опыт работы</h3>
                <p>Более 10 лет успешной практики</p>
              </Card>
              <Card className={styles.advantageCard}>
                <div className={styles.advantageIcon}>✓</div>
                <h3>Сертификаты</h3>
                <p>Регулярное повышение квалификации</p>
              </Card>
              <Card className={styles.advantageCard}>
                <div className={styles.advantageIcon}>✓</div>
                <h3>Индивидуальный подход</h3>
                <p>Персональная программа для каждого клиента</p>
              </Card>
              <Card className={styles.advantageCard}>
                <div className={styles.advantageIcon}>✓</div>
                <h3>Современное оборудование</h3>
                <p>Использование новейших технологий</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Reviews Preview */}
        {featuredReviews.length > 0 && (
          <section className={`${styles.section} ${styles.reviewsSection}`}>
            <div className={styles.container}>
              <div className={styles.reviewsHeader}>
                <div>
                  <h2 className={styles.sectionTitle}>Отзывы клиентов</h2>
                  {averageRating > 0 && (
                    <p className={styles.rating}>
                      Средняя оценка: {averageRating.toFixed(1)} ⭐
                    </p>
                  )}
                </div>
                <Link to={ROUTES.REVIEWS}>
                  <Button variant="outline">Все отзывы</Button>
                </Link>
              </div>
              <div className={styles.reviewsGrid}>
                {featuredReviews.map((review) => (
                  <Card key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div>
                        <h4>{review.clientName}</h4>
                        <p className={styles.reviewProcedure}>
                          {review.procedureName}
                        </p>
                      </div>
                      <div className={styles.reviewRating}>
                        {'⭐'.repeat(review.rating)}
                      </div>
                    </div>
                    <p className={styles.reviewText}>{review.text}</p>
                    <p className={styles.reviewDate}>{review.date}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact CTA */}
        <section className={`${styles.section} ${styles.ctaSection}`}>
          <div className={styles.container}>
            <Card className={styles.ctaCard}>
              <h2>Готовы начать?</h2>
              <p>Запишитесь на консультацию и узнайте, как мы можем помочь</p>
              <div className={styles.ctaActions}>
                <Link to={ROUTES.CONTACTS}>
                  <Button size="large">Записаться</Button>
                </Link>
                <a href={`tel:${ci.phone}`}>
                  <Button variant="outline" size="large">
                    Позвонить
                  </Button>
                </a>
                {whatsappHref && (
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="large">
                      WhatsApp
                    </Button>
                  </a>
                )}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </>
  )
}

export default Home
