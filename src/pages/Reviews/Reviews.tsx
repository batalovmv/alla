import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setReviews, addReview, setLoading } from '../../store/slices/reviewsSlice'
import { fetchReviews, submitReview as submitReviewAPI } from '../../utils/api'
import { isStale } from '../../utils/cache'
import {
  loadReviewsFromStorage,
  saveReviewsToStorage,
  addReviewToStorage,
  setupStorageSync,
} from '../../utils/reviewsStorage'
import { Review } from '../../types'
import Card from '../../components/common/Card/Card'
import Select from '../../components/common/Select/Select'
import AddReviewForm from '../../components/reviews/AddReviewForm/AddReviewForm'
import SEO from '../../components/common/SEO/SEO'
import styles from './Reviews.module.css'

const Reviews: React.FC = () => {
  const dispatch = useAppDispatch()
  const { items: reviews, averageRating, lastFetched } = useAppSelector(
    (state) => state.reviews
  )
  const { items: procedures } = useAppSelector((state) => state.procedures)
  const [filteredProcedure, setFilteredProcedure] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const useFirebase =
    !!import.meta.env.VITE_FIREBASE_API_KEY && !!import.meta.env.VITE_FIREBASE_PROJECT_ID
  const reviewsKeyRef = useRef<string>('')

  useEffect(() => {
    // key includes approval state to avoid missing transitions when moderation happens
    reviewsKeyRef.current = reviews
      .map((r) => `${r.id}:${r.approved === true ? '1' : r.approved === false ? '0' : 'u'}`)
      .join('|')
  }, [reviews])

  // Загрузка отзывов из localStorage и API
  useEffect(() => {
    const loadAllReviews = async () => {
      dispatch(setLoading(true))
      
      // Загружаем из localStorage
      const storedReviews = loadReviewsFromStorage()
      
      const ttlMs = 3 * 60 * 1000
      // Загружаем из API (Firebase/моковые данные) только если данных нет или они устарели
      const shouldFetch = reviews.length === 0 || isStale(lastFetched, ttlMs)
      const apiReviews = shouldFetch ? await fetchReviews() : []
      
      // Объединяем: сначала из API (как базовые), затем из localStorage
      // Убираем дубликаты по ID
      const allReviews = [...apiReviews, ...storedReviews]
      const uniqueReviews = Array.from(
        new Map(allReviews.map((r) => [r.id, r])).values()
      )
      
      const nextKey = uniqueReviews
        .map((r) => `${r.id}:${r.approved === true ? '1' : r.approved === false ? '0' : 'u'}`)
        .join('|')
      if (nextKey !== reviewsKeyRef.current) {
        dispatch(setReviews(uniqueReviews))
      }
      dispatch(setLoading(false))
    }
    
    loadAllReviews()
    // Важно: не добавляем reviews/lastFetched в deps, иначе можно зациклиться,
    // потому что setReviews обновляет lastFetched в slice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, useFirebase])

  // Синхронизация между вкладками
  useEffect(() => {
    const unsubscribe = setupStorageSync((syncedReviews) => {
      dispatch(setReviews(syncedReviews))
    })
    return unsubscribe
  }, [dispatch])

  const procedureOptions = useMemo(
    () => [
      { value: '', label: 'Все процедуры' },
      ...procedures.map((p) => ({ value: p.id, label: p.name })),
    ],
    [procedures]
  )

  // Фильтруем только одобренные отзывы для отображения
  const approvedReviews = useMemo(
    () => reviews.filter((r) => r.approved === true),
    [reviews]
  )

  const filteredReviews = useMemo(
    () =>
      filteredProcedure
        ? approvedReviews.filter((r) => r.procedureId === filteredProcedure)
        : approvedReviews,
    [approvedReviews, filteredProcedure]
  )

  const handleAddReview = useCallback(
    async (formData: {
      clientName: string
      phone: string
      procedureId: string
      rating: number
      text: string
    }) => {
      setIsSubmitting(true)
      setSubmitMessage(null)
      
      const selectedProcedure = procedures.find((p) => p.id === formData.procedureId)
      
      const procedureName = selectedProcedure?.name || 'Неизвестная процедура'

      const result = await submitReviewAPI({
        clientName: formData.clientName,
        phone: formData.phone,
        procedureId: formData.procedureId,
        procedureName,
        rating: formData.rating,
        text: formData.text,
      })

      // В offline/mock режиме submitReviewAPI не сохраняет — оставляем прежнее поведение через localStorage
      if (result.success && !useFirebase) {
        const newReview: Review = {
          id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          clientName: formData.clientName,
          procedureId: formData.procedureId,
          procedureName,
          rating: formData.rating,
          text: formData.text,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          approved: true,
        }

        addReviewToStorage(newReview)
        dispatch(addReview(newReview))
        const allReviews = [...reviews, newReview]
        saveReviewsToStorage(allReviews)
      }

      setSubmitMessage(result.message)
      setIsSubmitting(false)
    },
    [dispatch, procedures, reviews]
  )

  const getRatingStars = (rating: number) => {
    const safe = Math.max(0, Math.min(5, Number.isFinite(rating) ? rating : 0))
    return '⭐'.repeat(safe) + '☆'.repeat(5 - safe)
  }

  return (
    <>
      <SEO
        title="Отзывы"
        description="Отзывы наших клиентов о косметологических процедурах. Реальные истории и результаты."
        keywords="отзывы косметология, отзывы клиентов, косметологические процедуры отзывы"
      />
      <div className={styles.reviews}>
        <div className={styles.container}>
          <h1 className={styles.title}>Отзывы клиентов</h1>

          {submitMessage && (
            <Card className={styles.reviewCard}>
              <p>{submitMessage}</p>
            </Card>
          )}

          <AddReviewForm onSubmit={handleAddReview} isSubmitting={isSubmitting} />

        {approvedReviews.length > 0 && (
          <div className={styles.header}>
            <div className={styles.ratingSection}>
              <div className={styles.averageRating}>
                <span className={styles.ratingValue}>
                  {averageRating.toFixed(1)}
                </span>
                <div className={styles.stars}>
                  {'⭐'.repeat(Math.max(0, Math.min(5, Math.round(averageRating))))}
                  {'☆'.repeat(5 - Math.max(0, Math.min(5, Math.round(averageRating))))}
                </div>
                <p className={styles.ratingText}>
                  На основе {approvedReviews.length} отзывов
                </p>
              </div>
            </div>

            <div className={styles.filter}>
              <Select
                label="Фильтр по процедуре"
                options={procedureOptions}
                value={filteredProcedure}
                onChange={(e) => setFilteredProcedure(e.target.value)}
              />
            </div>
          </div>
        )}

        {filteredReviews.length > 0 ? (
          <div className={styles.reviewsGrid}>
            {filteredReviews.map((review) => (
              <Card key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewAuthor}>
                    {review.clientPhoto ? (
                      <img
                        src={review.clientPhoto}
                        alt={review.clientName}
                        className={styles.authorPhoto}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.authorPlaceholder}>
                        {review.clientName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className={styles.authorName}>
                        {review.clientName}
                      </h3>
                      <p className={styles.procedureName}>
                        {review.procedureName}
                      </p>
                    </div>
                  </div>
                  <div className={styles.reviewRating}>
                    {getRatingStars(review.rating)}
                  </div>
                </div>
                <p className={styles.reviewText}>{review.text}</p>
                <p className={styles.reviewDate}>
                  {new Date(review.date).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>
              {filteredProcedure
                ? 'Нет отзывов по выбранной процедуре'
                : 'Отзывов пока нет'}
            </p>
          </div>
        )}
        </div>
      </div>
    </>
  )
}

export default Reviews

