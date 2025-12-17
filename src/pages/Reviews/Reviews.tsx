import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setReviews } from '../../store/slices/reviewsSlice'
import { fetchReviews } from '../../utils/api'
import Card from '../../components/common/Card/Card'
import Select from '../../components/common/Select/Select'
import SEO from '../../components/common/SEO/SEO'
import styles from './Reviews.module.css'

const Reviews: React.FC = () => {
  const dispatch = useAppDispatch()
  const { items: reviews, averageRating } = useAppSelector(
    (state) => state.reviews
  )
  const { items: procedures } = useAppSelector((state) => state.procedures)
  const [filteredProcedure, setFilteredProcedure] = useState<string>('')

  useEffect(() => {
    const loadReviews = async () => {
      const data = await fetchReviews()
      dispatch(setReviews(data))
    }
    loadReviews()
  }, [dispatch])

  const procedureOptions = [
    { value: '', label: 'Все процедуры' },
    ...procedures.map((p) => ({ value: p.id, label: p.name })),
  ]

  const filteredReviews = filteredProcedure
    ? reviews.filter((r) => r.procedureId === filteredProcedure)
    : reviews

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

        {reviews.length > 0 && (
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
                  На основе {reviews.length} отзывов
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

