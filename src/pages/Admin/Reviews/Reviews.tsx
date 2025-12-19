import React, { useState, useEffect } from 'react'
import { reviewsService, reviewMetaService, serviceRecordsService } from '../../../services/firebaseService'
import { Review } from '../../../types'
import Card from '../../../components/common/Card/Card'
import Button from '../../../components/common/Button/Button'
import Select from '../../../components/common/Select/Select'
import styles from './Reviews.module.css'

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')
  const [phonesByReviewId, setPhonesByReviewId] = useState<Record<string, string>>({})
  const [verifiedByReviewId, setVerifiedByReviewId] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadReviews()
  }, [filter])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const allReviews = await reviewsService.getAll()
      let filtered = allReviews

      if (filter === 'approved') {
        filtered = allReviews.filter((r) => r.approved === true)
      } else if (filter === 'pending') {
        // Только ожидающие (approved отсутствует)
        filtered = allReviews.filter((r) => r.approved !== true && r.approved !== false)
      }

      setReviews(filtered)

      // Подтягиваем телефоны из reviewMeta (PII, админский доступ)
      const pairs = await Promise.all(
        filtered.map(async (r) => {
          const meta = await reviewMetaService.get(r.id)
          return [r.id, meta?.phone || ''] as const
        })
      )
      const map: Record<string, string> = {}
      for (const [id, phone] of pairs) {
        if (phone) map[id] = phone
      }
      setPhonesByReviewId(map)
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error)
    } finally {
      setLoading(false)
    }
  }

  const clampRating = (value: unknown): number => {
    const n = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(n)) return 0
    return Math.max(0, Math.min(5, Math.round(n)))
  }

  const handleApprove = async (id: string) => {
    try {
      await reviewsService.update(id, { approved: true })
      await loadReviews()
    } catch (error) {
      console.error('Ошибка одобрения отзыва:', error)
      alert('Ошибка при одобрении отзыва')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await reviewsService.update(id, { approved: false })
      await loadReviews()
    } catch (error) {
      console.error('Ошибка отклонения отзыва:', error)
      alert('Ошибка при отклонении отзыва')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      try {
        await reviewsService.delete(id)
        await loadReviews()
      } catch (error) {
        console.error('Ошибка удаления отзыва:', error)
        alert('Ошибка при удалении отзыва')
      }
    }
  }

  const handleVerify = async (review: Review) => {
    const phone = phonesByReviewId[review.id]
    if (!phone) {
      alert('Телефон не найден для этого отзыва')
      return
    }

    try {
      const records = await serviceRecordsService.getByPhone(phone)
      const match = (records || []).some((rec: any) => {
        const nameOk =
          String(rec.clientName || '').trim().toLowerCase() ===
          String(review.clientName || '').trim().toLowerCase()
        const procedureOk =
          String(rec.procedureId || '') === String(review.procedureId || '')
        return nameOk && procedureOk
      })
      setVerifiedByReviewId((prev) => ({ ...prev, [review.id]: match }))
      if (!match) {
        alert('Не найдено совпадений в истории услуг по телефону/имени/процедуре.')
      }
    } catch (error) {
      console.error('Ошибка проверки отзыва:', error)
      alert('Ошибка при проверке')
    }
  }

  const filterOptions = [
    { value: 'all', label: 'Все отзывы' },
    { value: 'approved', label: 'Одобренные' },
    { value: 'pending', label: 'Ожидающие модерации' },
  ]

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>
  }

  return (
    <div className={styles.reviews}>
      <div className={styles.header}>
        <h1 className={styles.title}>Модерация отзывов</h1>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          options={filterOptions}
        />
      </div>

      {reviews.length === 0 ? (
        <Card className={styles.empty}>
          <p>Отзывов нет</p>
        </Card>
      ) : (
        <div className={styles.list}>
          {reviews.map((review) => (
            <Card key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div>
                  <h3 className={styles.clientName}>{review.clientName}</h3>
                  <p className={styles.procedureName}>{review.procedureName}</p>
                  {phonesByReviewId[review.id] && (
                    <p className={styles.phone}>Телефон: {phonesByReviewId[review.id]}</p>
                  )}
                  <div className={styles.rating}>
                    {'⭐'.repeat(clampRating(review.rating))}
                    {'☆'.repeat(5 - clampRating(review.rating))}
                  </div>
                </div>
                <div className={styles.status}>
                  {review.approved === true ? (
                    <span className={styles.approved}>✓ Одобрен</span>
                  ) : review.approved === false ? (
                    <span className={styles.rejected}>✗ Отклонен</span>
                  ) : (
                    <span className={styles.pending}>⏳ Ожидает</span>
                  )}
                  {verifiedByReviewId[review.id] === true && (
                    <span className={styles.approved}> • Проверено</span>
                  )}
                </div>
              </div>
              <p className={styles.text}>{review.text}</p>
              <p className={styles.date}>
                {new Date(review.date).toLocaleDateString('ru-RU')}
              </p>
              <div className={styles.actions}>
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => handleVerify(review)}
                  disabled={!phonesByReviewId[review.id]}
                >
                  Проверить
                </Button>
                {review.approved !== true && (
                  <Button
                    size="small"
                    onClick={() => handleApprove(review.id)}
                  >
                    Одобрить
                  </Button>
                )}
                {review.approved !== false && (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleReject(review.id)}
                  >
                    Отклонить
                  </Button>
                )}
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => handleDelete(review.id)}
                >
                  Удалить
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Reviews

