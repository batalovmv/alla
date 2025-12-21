import React, { useEffect, useMemo, useState } from 'react'
import { bookingsService, proceduresService } from '../../../services/firebaseService'
import { Booking, BookingStatus } from '../../../types'
import Card from '../../../components/common/Card/Card'
import Button from '../../../components/common/Button/Button'
import { PageFallback } from '../../../components/common/PageFallback/PageFallback'
import Modal from '../../../components/common/Modal/Modal'
import styles from './Bookings.module.css'

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('new') // По умолчанию показываем новые
  const [selected, setSelected] = useState<Booking | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

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
    { value: 'new', label: 'Новые (не обработаны)' },
    { value: 'awaiting', label: 'Записаны (подтверждены)' },
    { value: 'completed', label: 'Услуга оказана' },
    { value: 'cancelled', label: 'Отменено' },
  ]

  const getStatusLabel = (status: Booking['status']) => {
    switch (status) {
      case 'new':
        return 'Новая'
      case 'awaiting':
        return 'Записана'
      case 'completed':
        return 'Услуга оказана'
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
    return <PageFallback variant="admin" />
  }

  const selectedTitle = useMemo(() => {
    if (!selected) return ''
    const date = selected.desiredDate ? new Date(selected.desiredDate).toLocaleDateString('ru-RU') : ''
    const time = selected.desiredTime || ''
    const dt = [date, time].filter(Boolean).join(' • ')
    return dt ? `Заявка • ${selected.name} • ${dt}` : `Заявка • ${selected.name}`
  }, [selected])

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
            <Card
              key={booking.id}
              className={styles.bookingCard}
              onClick={isMobile ? () => setSelected(booking) : undefined}
            >
              <div className={styles.bookingHeader}>
                <div className={styles.headerMain}>
                  <h3 className={styles.clientName}>{booking.name}</h3>
                  <p className={styles.procedureName}>{booking.procedureName}</p>
                  <p className={styles.metaLine}>
                    {new Date(booking.desiredDate).toLocaleDateString('ru-RU')} • {booking.desiredTime || '—'}
                  </p>
                </div>
                <span className={`${styles.status} ${getStatusClass(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>

              {!isMobile && (
                <>
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
                    {booking.comment && (
                      <div className={styles.comment}>
                        <span className={styles.label}>Комментарий:</span>
                        <p>{booking.comment}</p>
                      </div>
                    )}
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Дата заявки:</span>
                      <span>{new Date(booking.createdAt).toLocaleString('ru-RU')}</span>
                    </div>
                  </div>

                  <div className={styles.actions}>
                    {booking.status === 'new' && (
                      <>
                        <Button size="small" onClick={() => handleStatusChange(booking.id, 'awaiting')}>
                          Записать / подтвердить
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
                        <Button size="small" onClick={() => handleStatusChange(booking.id, 'completed')}>
                          Услуга оказана
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
                      <Button size="small" variant="outline" onClick={() => handleStatusChange(booking.id, 'new')}>
                        Вернуть в новые
                      </Button>
                    )}
                    {booking.status === 'cancelled' && (
                      <Button size="small" onClick={() => handleStatusChange(booking.id, 'new')}>
                        Вернуть в новые
                      </Button>
                    )}
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selectedTitle}
      >
        {selected && (
          <div className={styles.modalContent}>
            <div className={styles.modalGrid}>
              <div className={styles.modalRow}>
                <div className={styles.modalLabel}>Процедура</div>
                <div className={styles.modalValue}>{selected.procedureName || '—'}</div>
              </div>
              <div className={styles.modalRow}>
                <div className={styles.modalLabel}>Дата/время</div>
                <div className={styles.modalValue}>
                  {new Date(selected.desiredDate).toLocaleDateString('ru-RU')} • {selected.desiredTime || '—'}
                </div>
              </div>
              <div className={styles.modalRow}>
                <div className={styles.modalLabel}>Телефон</div>
                <div className={styles.modalValue}>
                  <a href={`tel:${selected.phone}`}>{selected.phone}</a>
                </div>
              </div>
              {selected.email && (
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>Email</div>
                  <div className={styles.modalValue}>
                    <a href={`mailto:${selected.email}`}>{selected.email}</a>
                  </div>
                </div>
              )}
              {selected.comment && (
                <div className={styles.modalRow}>
                  <div className={styles.modalLabel}>Комментарий</div>
                  <div className={styles.modalValue}>{selected.comment}</div>
                </div>
              )}
              <div className={styles.modalRow}>
                <div className={styles.modalLabel}>Статус</div>
                <div className={styles.modalValue}>{getStatusLabel(selected.status)}</div>
              </div>
            </div>

            <div className={styles.modalActions}>
              {selected.status === 'new' && (
                <>
                  <Button
                    size="small"
                    onClick={() => handleStatusChange(selected.id, 'awaiting').then(() => setSelected(null))}
                  >
                    Записать / подтвердить
                  </Button>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleStatusChange(selected.id, 'cancelled').then(() => setSelected(null))}
                  >
                    Отменить
                  </Button>
                </>
              )}
              {selected.status === 'awaiting' && (
                <>
                  <Button
                    size="small"
                    onClick={() => handleStatusChange(selected.id, 'completed').then(() => setSelected(null))}
                  >
                    Услуга оказана
                  </Button>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleStatusChange(selected.id, 'cancelled').then(() => setSelected(null))}
                  >
                    Отменить
                  </Button>
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => handleStatusChange(selected.id, 'new').then(() => setSelected(null))}
                  >
                    Вернуть в новые
                  </Button>
                </>
              )}
              {selected.status === 'completed' && (
                <Button
                  size="small"
                  variant="outline"
                  onClick={() => handleStatusChange(selected.id, 'new').then(() => setSelected(null))}
                >
                  Вернуть в новые
                </Button>
              )}
              {selected.status === 'cancelled' && (
                <Button
                  size="small"
                  onClick={() => handleStatusChange(selected.id, 'new').then(() => setSelected(null))}
                >
                  Вернуть в новые
                </Button>
              )}
              <Button size="small" variant="secondary" onClick={() => setSelected(null)}>
                Закрыть
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Bookings

