import React, { useState, useEffect } from 'react'
import { bookingsService, proceduresService } from '../../../services/firebaseService'
import { Booking, BookingStatus } from '../../../types'
import Card from '../../../components/common/Card/Card'
import Button from '../../../components/common/Button/Button'
import styles from './Bookings.module.css'

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('new') // По умолчанию показываем новые

  useEffect(() => {
    loadBookings()
  }, [statusFilter])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const allBookings = await bookingsService.getAll()
      let filtered = allBookings as Booking[]

      // Если у заявки нет procedureName, загружаем процедуры и добавляем название
      const procedures = await proceduresService.getAll()
      filtered = filtered.map((booking: Booking) => {
        if (!booking.procedureName && booking.procedureId) {
          const procedure = procedures.find((p) => p.id === booking.procedureId)
          if (procedure) {
            return { ...booking, procedureName: procedure.name }
          }
        }
        return booking
      })

      // Фильтруем по выбранному статусу
      // Также обрабатываем старые статусы 'processed' как 'awaiting' для обратной совместимости
      filtered = filtered.filter((b: Booking) => {
        // Нормализуем статус: старый 'processed' становится 'awaiting'
        const bookingStatus = (b.status as string) === 'processed' ? 'awaiting' : b.status
        return bookingStatus === statusFilter
      }) as Booking[]

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
      
      // Если статус изменен на 'completed', создаем запись в истории клиента
      if (newStatus === 'completed') {
        const booking = bookings.find((b) => b.id === id)
        if (booking) {
          await createServiceRecordFromBooking(booking)
        }
      }
      
      await loadBookings()
    } catch (error) {
      console.error('Ошибка обновления статуса:', error)
      alert('Ошибка при обновлении статуса')
    }
  }

  const createServiceRecordFromBooking = async (booking: Booking) => {
    try {
      const { clientsService, serviceRecordsService } = await import('../../../services/firebaseService')
      const procedures = await proceduresService.getAll()
      const procedure = procedures.find((p) => p.id === booking.procedureId)
      
      // Находим или создаем клиента
      let client = await clientsService.getByPhone(booking.phone)
      if (!client) {
        const clientId = await clientsService.create({
          phone: booking.phone,
          name: booking.name,
          email: booking.email,
          totalVisits: 0,
        })
        client = await clientsService.get(clientId)
      }

      if (client) {
        // Создаем запись об оказанной услуге
        const serviceDate = new Date(booking.desiredDate)
        await serviceRecordsService.create({
          clientId: client.id,
          clientPhone: booking.phone,
          clientName: booking.name,
          procedureId: booking.procedureId,
          procedureName: booking.procedureName,
          date: serviceDate,
          // Фиксируем цену на момент выполнения (для отчётов)
          price: procedure?.price ?? 0,
          notes: booking.comment || undefined,
          bookingId: booking.id,
        })

        // Обновляем статистику клиента
        const newTotalVisits = (client.totalVisits || 0) + 1
        await clientsService.update(client.id, {
          totalVisits: newTotalVisits,
          lastVisit: serviceDate,
        })
      }
    } catch (error) {
      console.error('Ошибка создания записи об услуге:', error)
      // Не показываем ошибку пользователю, так как заявка уже обновлена
    }
  }

  const tabs = [
    { value: 'new', label: 'Новые' },
    { value: 'awaiting', label: 'Ожидание' },
    { value: 'completed', label: 'Выполненные' },
    { value: 'cancelled', label: 'Отмененные' },
  ]

  const getStatusLabel = (status: Booking['status']) => {
    switch (status) {
      case 'new':
        return 'Новая'
      case 'awaiting':
        return 'Ожидание'
      case 'completed':
        return 'Выполнена'
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
      case 'awaiting':
        return styles.awaiting || styles.processed
      case 'completed':
        return styles.completed
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
      <h1 className={styles.title}>Заявки на запись</h1>
      
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`${styles.tab} ${statusFilter === tab.value ? styles.tabActive : ''}`}
            onClick={() => setStatusFilter(tab.value as BookingStatus)}
          >
            {tab.label}
          </button>
        ))}
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
                      onClick={() => handleStatusChange(booking.id, 'awaiting')}
                    >
                      В ожидание
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
                {booking.status === 'awaiting' && (
                  <>
                    <Button
                      size="small"
                      onClick={() => handleStatusChange(booking.id, 'completed')}
                    >
                      Выполнена
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => handleStatusChange(booking.id, 'cancelled')}
                    >
                      Отменить
                    </Button>
                    <Button
                      size="small"
                      variant="outline"
                      onClick={() => handleStatusChange(booking.id, 'new')}
                    >
                      Вернуть в новые
                    </Button>
                  </>
                )}
                {booking.status === 'completed' && (
                  <Button
                    size="small"
                    variant="outline"
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

