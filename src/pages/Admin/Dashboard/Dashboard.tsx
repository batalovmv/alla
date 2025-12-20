import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { proceduresService, reviewsService, bookingsService } from '../../../services/firebaseService'
import { ROUTES } from '../../../config/routes'
import Card from '../../../components/common/Card/Card'
import { PageFallback } from '../../../components/common/PageFallback/PageFallback'
import styles from './Dashboard.module.css'

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    procedures: 0,
    reviews: 0,
    approvedReviews: 0,
    bookings: 0,
    newBookings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [procedures, reviews, allReviews, allBookings] = await Promise.all([
          proceduresService.getAll(),
          reviewsService.getApproved(),
          reviewsService.getAll(),
          bookingsService.getAll(),
        ])

        const newBookings = allBookings.filter((b: any) => b.status === 'new')

        setStats({
          procedures: procedures.length,
          reviews: allReviews.length,
          approvedReviews: reviews.length,
          bookings: allBookings.length,
          newBookings: newBookings.length,
        })
      } catch (error) {
        console.error('Ошибка загрузки статистики:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return <PageFallback variant="admin" />
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Дашборд</h1>
      <div className={styles.statsGrid}>
        <Link to={ROUTES.ADMIN_PROCEDURES} className={styles.statLink}>
          <Card className={styles.statCard}>
            <div className={styles.statIcon}>💆</div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>{stats.procedures}</h3>
              <p className={styles.statLabel}>Процедур</p>
            </div>
          </Card>
        </Link>

        <Link to={ROUTES.ADMIN_REVIEWS} className={styles.statLink}>
          <Card className={styles.statCard}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>{stats.approvedReviews}</h3>
              <p className={styles.statLabel}>Одобренных отзывов</p>
              <p className={styles.statSubtext}>из {stats.reviews} всего</p>
            </div>
          </Card>
        </Link>

        <Link to={ROUTES.ADMIN_BOOKINGS} className={styles.statLink}>
          <Card className={styles.statCard}>
            <div className={styles.statIcon}>📅</div>
            <div className={styles.statContent}>
              <h3 className={styles.statValue}>{stats.newBookings}</h3>
              <p className={styles.statLabel}>Новых заявок</p>
              <p className={styles.statSubtext}>из {stats.bookings} всего</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard

