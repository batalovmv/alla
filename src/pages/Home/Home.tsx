import React, { useEffect, useMemo, useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setProcedures, setLoading as setProceduresLoading } from '../../store/slices/proceduresSlice'
import { setReviews, setLoading as setReviewsLoading } from '../../store/slices/reviewsSlice'
import { fetchProcedures, fetchReviews } from '../../utils/api'
import { isStale } from '../../utils/cache'
import { ROUTES } from '../../config/routes'
import { CONTACT_INFO, SITE_NAME } from '../../config/constants'
import { getContactInfo } from '../../utils/contactInfo'
import { buildWhatsAppHref } from '../../utils/whatsapp'
import { buildTelegramHref } from '../../utils/telegram'
import { ContactInfo } from '../../types'
import ProcedureCard from '../../components/procedures/ProcedureCard/ProcedureCard'
import Button from '../../components/common/Button/Button'
import Card from '../../components/common/Card/Card'
import SEO from '../../components/common/SEO/SEO'
import { useDelayedFlag } from '../../utils/useDelayedFlag'
import { ProcedureCardSkeleton, ReviewCardSkeleton } from '../../components/common/Skeleton/SkeletonPresets'
import { Skeleton } from '../../components/common/Skeleton/Skeleton'
import { LazyMount } from '../../components/common/LazyMount/LazyMount'
import styles from './Home.module.css'

const Home: React.FC = () => {
  const dispatch = useAppDispatch()
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  // Stage-based mounting: page “builds” as user scrolls.
  const [stage, setStage] = useState(0)
  const { items: procedures, lastFetched: proceduresLastFetched, loading: proceduresLoading } = useAppSelector(
    (state) => state.procedures
  )
  const { items: reviews, averageRating, lastFetched: reviewsLastFetched, loading: reviewsLoading } = useAppSelector(
    (state) => state.reviews
  )

  const loadData = useCallback(async () => {
    const proceduresTtlMs = 5 * 60 * 1000
    const reviewsTtlMs = 3 * 60 * 1000

    if (procedures.length === 0 || isStale(proceduresLastFetched, proceduresTtlMs)) {
      dispatch(setProceduresLoading(true))
      try {
        const proceduresData = await fetchProcedures()
        dispatch(setProcedures(proceduresData))
      } finally {
        dispatch(setProceduresLoading(false))
      }
    }

    if (reviews.length === 0 || isStale(reviewsLastFetched, reviewsTtlMs)) {
      dispatch(setReviewsLoading(true))
      try {
        const reviewsData = await fetchReviews()
        dispatch(setReviews(reviewsData))
      } finally {
        dispatch(setReviewsLoading(false))
      }
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

  const showProceduresSkeleton = useDelayedFlag(
    proceduresLoading && procedures.length === 0,
    160
  )
  const showReviewsSkeleton = useDelayedFlag(reviewsLoading && reviews.length === 0, 160)

  const whatsappHref = useMemo(() => {
    const text = `Здравствуйте! Хочу записаться в ${SITE_NAME}.`
    return buildWhatsAppHref({ whatsappPhone: ci.whatsappPhone, text })
  }, [ci.whatsappPhone])

  const telegramHref = useMemo(() => {
    return buildTelegramHref({ telegramLink: ci.socialMedia.telegram })
  }, [ci.socialMedia.telegram])

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

        {/* Popular Procedures (stage 0) */}
        {stage >= 0 && (
          <LazyMount
            onEnter={() => setStage((s) => Math.max(s, 1))}
            placeholder={
              <section className={styles.section}>
                <div className={styles.container}>
                  <Skeleton variant="text" height={32} width={280} />
                  <div style={{ marginTop: 24 }}>
                    <Skeleton height={360} radius={16} />
                  </div>
                </div>
              </section>
            }
          >
            {showProceduresSkeleton ? (
              <section className={styles.section}>
                <div className={styles.container}>
                  <h2 className={styles.sectionTitle}>Популярные процедуры</h2>
                  <div className={styles.proceduresGrid}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <ProcedureCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              </section>
            ) : popularProcedures.length > 0 ? (
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
            ) : null}
          </LazyMount>
        )}

        {/* About Section (stage 1) */}
        {stage >= 1 && (
          <LazyMount
            onEnter={() => setStage((s) => Math.max(s, 2))}
            placeholder={
              <section className={`${styles.section} ${styles.aboutSection}`}>
                <div className={styles.container}>
                  <Skeleton variant="text" height={32} width={240} />
                  <div style={{ marginTop: 24 }}>
                    <Skeleton height={420} radius={16} />
                  </div>
                </div>
              </section>
            }
          >
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
          </LazyMount>
        )}

        {/* Advantages (stage 2) */}
        {stage >= 2 && (
          <LazyMount
            onEnter={() => setStage((s) => Math.max(s, 3))}
            placeholder={
              <section className={styles.section}>
                <div className={styles.container}>
                  <Skeleton variant="text" height={32} width={320} />
                  <div style={{ marginTop: 24 }}>
                    <Skeleton height={320} radius={16} />
                  </div>
                </div>
              </section>
            }
          >
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
          </LazyMount>
        )}

        {/* Reviews Preview (stage 3) */}
        {stage >= 3 && (
          <LazyMount
            onEnter={() => setStage((s) => Math.max(s, 4))}
            placeholder={
              <section className={`${styles.section} ${styles.reviewsSection}`}>
                <div className={styles.container}>
                  <Skeleton variant="text" height={32} width={260} />
                  <div style={{ marginTop: 24 }}>
                    <Skeleton height={360} radius={16} />
                  </div>
                </div>
              </section>
            }
          >
            {showReviewsSkeleton ? (
              <section className={`${styles.section} ${styles.reviewsSection}`}>
                <div className={styles.container}>
                  <div className={styles.reviewsHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>Отзывы клиентов</h2>
                    </div>
                  </div>
                  <div className={styles.reviewsGrid}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <ReviewCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              </section>
            ) : featuredReviews.length > 0 ? (
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
                            <p className={styles.reviewProcedure}>{review.procedureName}</p>
                          </div>
                          <div className={styles.reviewRating}>{'⭐'.repeat(review.rating)}</div>
                        </div>
                        <p className={styles.reviewText}>{review.text}</p>
                        <p className={styles.reviewDate}>{review.date}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}
          </LazyMount>
        )}

        {/* Contact CTA */}
        {/* Contact CTA (stage 4) */}
        {stage >= 4 && (
          <LazyMount
            placeholder={
              <section className={`${styles.section} ${styles.ctaSection}`}>
                <div className={styles.container}>
                  <Skeleton height={220} radius={16} />
                </div>
              </section>
            }
          >
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
                    {telegramHref && (
                      <a href={telegramHref} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="large">
                          Telegram
                        </Button>
                      </a>
                    )}
                  </div>
                </Card>
              </div>
            </section>
          </LazyMount>
        )}
      </div>
    </>
  )
}

export default Home
