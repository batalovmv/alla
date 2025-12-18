import React, { useState, useEffect } from 'react'
import { bookingsService } from '../../../services/firebaseService'
import Card from '../../../components/common/Card/Card'
import Button from '../../../components/common/Button/Button'
import Select from '../../../components/common/Select/Select'
import styles from './Bookings.module.css'

interface Booking {
  id: string
  name: string
  phone: string
  email?: string
  procedureId: string
  procedureName: string
  desiredDate: string
  desiredTime: string
  comment: string
  status: 'new' | 'processed' | 'cancelled'
  createdAt: Date
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'processed' | 'cancelled'>('all')

  useEffect(() => {
    loadBookings()
  }, [statusFilter])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const allBookings = await bookingsService.getAll()
      let filtered = allBookings as Booking[]

      if (statusFilter !== 'all') {
        filtered = allBookings.filter((b: Booking) => b.status === statusFilter) as Booking[]
      }

      setBookings(filtered)
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: Booking['status']) => {
    try {
      await bookingsService.update(id, { status: newStatus })
      await loadBookings()
    } catch (error) {
      console.error('Ошибка обновления статуса:', error)
      alert('Ошибка при обновлении статуса')
    }
  }

  const statusOptions = [
    { value: 'all', label: 'Все заявки' },
    { value: 'new', label: 'Новые' },
    { value: 'processed', label: 'Обработанные' },
    { value: 'cancelled', label: 'Отмененные' },
  ]

  const getStatusLabel = (status: Booking['status']) => {
    switch (status) {
      case 'new':
        return 'Новая'
      case 'processed':
        return 'Обработана'
      case 'cancelled':
        return 'Отменена'
      default:
        return status
    }
  }

  const getStatusClass = (status: Booking['status']) => {
    switch (status) {
      case 'new':
        return styles.new
      case 'processed':
        return styles.processed
      case 'cancelled':
        return styles.cancelled
      default:
        return ''
    }
  }

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>
  }

  return (
    <div className={styles.bookings}>
      <div className={styles.header}>
        <h1 className={styles.title}>Заявки на запись</h1>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          options={statusOptions}
        />
      </div>

      {bookings.length === 0 ? (
        <Card className={styles.empty}>
          <p>Заявок нет</p>
        </Card>
      ) : (
        <div className={styles.list}>
          {bookings.map((booking) => (
            <Card key={booking.id} className={styles.bookingCard}>
              <div className={styles.bookingHeader}>
                <div>
                  <h3 className={styles.clientName}>{booking.name}</h3>
                  <p className={styles.procedureName}>{booking.procedureName}</p>
                </div>
                <span className={`${styles.status} ${getStatusClass(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>

              <div className={styles.bookingInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Телефон:</span>
                  <a href={`tel:${booking.phone}`} className={styles.phone}>
                    {booking.phone}
                  </a>
                </div>
                {booking.email && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Email:</span>
                    <a href={`mailto:${booking.email}`}>{booking.email}</a>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <span className={styles.label}>Желаемая дата:</span>
                  <span>{new Date(booking.desiredDate).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Желаемое время:</span>
                  <span>{booking.desiredTime}</span>
                </div>
                {booking.comment && (
                  <div className={styles.comment}>
                    <span className={styles.label}>Комментарий:</span>
                    <p>{booking.comment}</p>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <span className={styles.label}>Дата заявки:</span>
                  <span>
                    {new Date(booking.createdAt).toLocaleString('ru-RU')}
                  </span>
                </div>
              </div>

              <div className={styles.actions}>
                {booking.status === 'new' && (
                  <>
                    <Button
                      size="small"
                      onClick={() => handleStatusChange(booking.id, 'processed')}
                    >
                      Отметить обработанной
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => handleStatusChange(booking.id, 'cancelled')}
                    >
                      Отменить
                    </Button>
                  </>
                )}
                {booking.status === 'processed' && (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleStatusChange(booking.id, 'new')}
                  >
                    Вернуть в новые
                  </Button>
                )}
                {booking.status === 'cancelled' && (
                  <Button
                    size="small"
                    onClick={() => handleStatusChange(booking.id, 'new')}
                  >
                    Вернуть в новые
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Bookings

