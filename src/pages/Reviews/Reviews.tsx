import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setReviews, addReview, setLoading } from '../../store/slices/reviewsSlice'
import { fetchReviews } from '../../utils/api'
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
  const { items: reviews, averageRating } = useAppSelector(
    (state) => state.reviews
  )
  const { items: procedures } = useAppSelector((state) => state.procedures)
  const [filteredProcedure, setFilteredProcedure] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Загрузка отзывов из localStorage и API
  useEffect(() => {
    const loadAllReviews = async () => {
      dispatch(setLoading(true))
      
      // Загружаем из localStorage
      const storedReviews = loadReviewsFromStorage()
      
      // Загружаем из API (моковые данные)
      const apiReviews = await fetchReviews()
      
      // Объединяем: сначала из API (как базовые), затем из localStorage
      // Убираем дубликаты по ID
      const allReviews = [...apiReviews, ...storedReviews]
      const uniqueReviews = Array.from(
        new Map(allReviews.map((r) => [r.id, r])).values()
      )
      
      dispatch(setReviews(uniqueReviews))
      dispatch(setLoading(false))
    }
    
    loadAllReviews()
  }, [dispatch])

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
    () => reviews.filter((r) => r.approved !== false),
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
      
      const selectedProcedure = procedures.find((p) => p.id === formData.procedureId)
      
      const newReview: Review = {
        id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        clientName: formData.clientName,
        phone: formData.phone,
        procedureId: formData.procedureId,
        procedureName: selectedProcedure?.name || 'Неизвестная процедура',
        rating: formData.rating,
        text: formData.text,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        approved: true, // Автоматическое одобрение (можно изменить на false для модерации)
      }

      // Сохраняем в localStorage
      addReviewToStorage(newReview)
      
      // Добавляем в Redux
      dispatch(addReview(newReview))
      
      // Сохраняем все отзывы в localStorage
      const allReviews = [...reviews, newReview]
      saveReviewsToStorage(allReviews)
      
      setIsSubmitting(false)
    },
    [dispatch, procedures, reviews]
  )

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
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

          <AddReviewForm onSubmit={handleAddReview} isSubmitting={isSubmitting} />

        {approvedReviews.length > 0 && (
          <div className={styles.header}>
            <div className={styles.ratingSection}>
              <div className={styles.averageRating}>
                <span className={styles.ratingValue}>
                  {averageRating.toFixed(1)}
                </span>
                <div className={styles.stars}>
                  {'⭐'.repeat(Math.round(averageRating))}
                  {'☆'.repeat(5 - Math.round(averageRating))}
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

