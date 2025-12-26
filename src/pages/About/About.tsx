import React, { useEffect, useMemo, useState } from 'react'
import Card from '../../components/common/Card/Card'
import SEO from '../../components/common/SEO/SEO'
import { PageFallback } from '../../components/common/PageFallback/PageFallback'
import { AboutInfo } from '../../types'
import { getAboutInfo } from '../../utils/aboutInfo'
import styles from './About.module.css'

function isLikelyImageUrl(url: string): boolean {
  return /\.(png|jpe?g|webp|gif|avif)(\?|#|$)/i.test(url)
}

const About: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [aboutInfo, setAboutInfo] = useState<AboutInfo | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getAboutInfo()
      .then((ai) => {
        if (!mounted) return
        setAboutInfo(ai)
      })
      .catch(() => {})
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const bioParagraphs = useMemo(() => {
    const raw = aboutInfo?.description || ''
    const parts = raw
      .split(/\n{2,}/g)
      .map((p) => p.trim())
      .filter(Boolean)
    return parts.length > 0 ? parts : []
  }, [aboutInfo?.description])

  if (loading) return <PageFallback variant="about" />

  const titleName = aboutInfo?.name ? ` — ${aboutInfo.name}` : ''
  const seoDescription =
    (aboutInfo?.description && aboutInfo.description.slice(0, 180)) ||
    'Опытный косметолог с многолетним стажем. Образование, сертификаты, опыт работы и индивидуальный подход к каждому клиенту.'

  return (
    <>
      <SEO
        title="О специалисте"
        description={seoDescription}
        keywords="косметолог, специалист косметологии, опыт работы, сертификаты"
      />
      <div className={styles.about}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>О специалисте{titleName}</h1>
            {(aboutInfo?.education || aboutInfo?.experience) && (
              <p className={styles.subtitle}>
                {aboutInfo?.education && <span>{aboutInfo.education}</span>}
                {aboutInfo?.education && aboutInfo?.experience && <span className={styles.dot} />}
                {aboutInfo?.experience && <span>{aboutInfo.experience}</span>}
              </p>
            )}
          </div>

          <div className={styles.content}>
            <div className={styles.imageSection}>
              {aboutInfo?.photo ? (
                <img
                  className={styles.photo}
                  src={aboutInfo.photo}
                  alt={aboutInfo?.name ? `Фото специалиста — ${aboutInfo.name}` : 'Фото специалиста'}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <span>Фото специалиста</span>
                </div>
              )}
            </div>

            <div className={styles.textSection}>
              <Card className={styles.card}>
                <h2>Описание</h2>
                {bioParagraphs.length > 0 ? (
                  bioParagraphs.map((p, idx) => <p key={idx}>{p}</p>)
                ) : (
                  <p className={styles.muted}>
                    Информация о специалисте скоро появится.
                  </p>
                )}
              </Card>

              {(aboutInfo?.education || aboutInfo?.experience) && (
                <Card className={styles.card}>
                  <h2>Образование и опыт</h2>
                  {aboutInfo?.education && (
                    <div className={styles.block}>
                      <h3>Образование</h3>
                      <p className={styles.preLine}>{aboutInfo.education}</p>
                    </div>
                  )}
                  {aboutInfo?.experience && (
                    <div className={styles.block}>
                      <h3>Опыт</h3>
                      <p className={styles.preLine}>{aboutInfo.experience}</p>
                    </div>
                  )}
                </Card>
              )}

              {aboutInfo?.certificates?.length ? (
                <Card className={styles.card}>
                  <h2>Сертификаты</h2>
                  <div className={styles.certificates}>
                    {aboutInfo.certificates.map((url, idx) => {
                      const label = `Сертификат ${idx + 1}`
                      const isImg = isLikelyImageUrl(url)
                      return (
                        <a
                          key={`${url}-${idx}`}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.certificateCard}
                        >
                          {isImg ? (
                            <img
                              className={styles.certificateImage}
                              src={url}
                              alt={label}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className={styles.certificateFile}>
                              <span>Открыть файл</span>
                            </div>
                          )}
                          <span className={styles.certificateLabel}>{label}</span>
                        </a>
                      )
                    })}
                  </div>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default About

