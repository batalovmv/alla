import React, { useEffect, useMemo, useState } from 'react'
import {
  bookingsService,
  proceduresService,
  serviceRecordsService,
  clientsService,
} from '../../../services/firebaseService'
import { Booking, BookingStatus, Procedure } from '../../../types'
import Card from '../../../components/common/Card/Card'
import Button from '../../../components/common/Button/Button'
import { PageFallback } from '../../../components/common/PageFallback/PageFallback'
import Modal from '../../../components/common/Modal/Modal'
import Select from '../../../components/common/Select/Select'
import Input from '../../../components/common/Input/Input'
import Textarea from '../../../components/common/Textarea/Textarea'
import styles from './Bookings.module.css'

type ModalMode = 'view' | 'edit' | 'add'

function normalizeBookingStatus(status: any): BookingStatus {
  return (status as string) === 'processed' ? 'awaiting' : (status as BookingStatus)
}

function combineDateTime(dateIso: string, timeHHmm: string): Date {
  const d = new Date(dateIso)
  const [hh, mm] = String(timeHHmm || '')
    .split(':')
    .map((x) => Number(x))
  if (Number.isFinite(hh) && Number.isFinite(mm)) {
    d.setHours(hh, mm, 0, 0)
  }
  return d
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('new') // По умолчанию показываем новые
  const [selected, setSelected] = useState<Booking | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [modalMode, setModalMode] = useState<ModalMode>('view')
  const [saving, setSaving] = useState(false)

  // Edit form
  const [editProcedureId, setEditProcedureId] = useState('')
  const [editDesiredDate, setEditDesiredDate] = useState('')
  const [editDesiredTime, setEditDesiredTime] = useState('')
  const [editComment, setEditComment] = useState('')

  // Add procedure form
  const [addProcedureId, setAddProcedureId] = useState('')
  const [addDesiredDate, setAddDesiredDate] = useState('')
  const [addDesiredTime, setAddDesiredTime] = useState('')
  const [addComment, setAddComment] = useState('')
  const [addMode, setAddMode] = useState<'asBooked' | 'asCompleted'>('asBooked')

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
      const procs = await proceduresService.getAll({ includeArchived: true })
      setProcedures(procs)
      filtered = filtered.map((booking: Booking) => {
        if (!booking.procedureName && booking.procedureId) {
          const procedure = procs.find((p) => p.id === booking.procedureId)
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
        const bookingStatus = normalizeBookingStatus((b as any).status)
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
        const serviceDate = combineDateTime(booking.desiredDate, booking.desiredTime)
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

  const procedureOptions = useMemo(() => {
    return procedures.map((p) => ({
      value: p.id,
      label: `${p.name}${p.archived ? ' (архив)' : ''}`,
    }))
  }, [procedures])

  const openView = (b: Booking) => {
    setSelected(b)
    setModalMode('view')
  }

  const openEdit = () => {
    if (!selected) return
    setEditProcedureId(selected.procedureId || '')
    setEditDesiredDate(selected.desiredDate || '')
    setEditDesiredTime(selected.desiredTime || '')
    setEditComment(selected.comment || '')
    setModalMode('edit')
  }

  const openAddProcedure = () => {
    if (!selected) return
    setAddProcedureId(selected.procedureId || '')
    setAddDesiredDate(selected.desiredDate || '')
    setAddDesiredTime(selected.desiredTime || '')
    setAddComment(selected.comment || '')
    setAddMode(selected.status === 'completed' ? 'asCompleted' : 'asBooked')
    setModalMode('add')
  }

  const saveEdit = async () => {
    if (!selected) return
    try {
      setSaving(true)
      const proc = procedures.find((p) => p.id === editProcedureId)
      await bookingsService.update(selected.id, {
        procedureId: editProcedureId,
        procedureName: proc?.name || selected.procedureName,
        desiredDate: editDesiredDate,
        desiredTime: editDesiredTime,
        comment: editComment || '',
      })
      // refresh selection in-place for UX
      const next: Booking = {
        ...selected,
        procedureId: editProcedureId,
        procedureName: proc?.name || selected.procedureName,
        desiredDate: editDesiredDate,
        desiredTime: editDesiredTime,
        comment: editComment || '',
      }
      setSelected(next)
      setModalMode('view')
      await loadBookings()
    } catch (e) {
      console.error(e)
      alert('Не удалось сохранить изменения')
    } finally {
      setSaving(false)
    }
  }

  const createAdditional = async () => {
    if (!selected) return
    try {
      setSaving(true)
      const proc = procedures.find((p) => p.id === addProcedureId)
      if (!proc) {
        alert('Выберите процедуру')
        return
      }

      if (addMode === 'asBooked') {
        // Create a new booking with the same client but different procedure and confirm it
        const newId = await bookingsService.create({
          name: selected.name,
          phone: selected.phone,
          email: selected.email,
          procedureId: proc.id,
          procedureName: proc.name,
          desiredDate: addDesiredDate,
          desiredTime: addDesiredTime,
          comment: addComment || '',
          consent: true,
        })
        await bookingsService.update(newId, { status: 'awaiting' })
        alert('Создана дополнительная запись (подтверждена).')
      } else {
        // Create a service record immediately (for reports)
        let client = await clientsService.getByPhone(selected.phone)
        if (!client) {
          const clientId = await clientsService.create({
            phone: selected.phone,
            name: selected.name,
            email: selected.email,
            totalVisits: 0,
          })
          client = await clientsService.get(clientId)
        }
        if (client) {
          const d = combineDateTime(addDesiredDate, addDesiredTime)
          await serviceRecordsService.create({
            clientId: client.id,
            clientPhone: selected.phone,
            clientName: selected.name,
            procedureId: proc.id,
            procedureName: proc.name,
            date: d,
            price: proc.price ?? 0,
            notes: addComment || undefined,
            bookingId: selected.id,
          })
          // update client stats
          const newTotalVisits = (client.totalVisits || 0) + 1
          await clientsService.update(client.id, {
            totalVisits: newTotalVisits,
            lastVisit: d,
          })
          alert('Добавлена выполненная услуга (отчёты обновятся).')
        }
      }

      setModalMode('view')
      await loadBookings()
    } catch (e) {
      console.error(e)
      alert('Не удалось добавить процедуру')
    } finally {
      setSaving(false)
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

  const selectedTitle = (() => {
    if (!selected) return ''
    const date = selected.desiredDate
      ? new Date(selected.desiredDate).toLocaleDateString('ru-RU')
      : ''
    const time = selected.desiredTime || ''
    const dt = [date, time].filter(Boolean).join(' • ')
    return dt ? `Заявка • ${selected.name} • ${dt}` : `Заявка • ${selected.name}`
  })()

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
              onClick={() => openView(booking)}
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

                  <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                    <Button size="small" variant="outline" onClick={() => openView(booking)}>
                      Подробнее
                    </Button>
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
        onClose={() => {
          setSelected(null)
          setModalMode('view')
        }}
        title={selectedTitle}
      >
        {selected && (
          <div className={styles.modalContent}>
            {modalMode === 'view' && (
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
            )}

            {modalMode === 'edit' && (
              <div className={styles.formGrid}>
                <Select
                  label="Процедура"
                  value={editProcedureId}
                  onChange={(e) => setEditProcedureId(e.target.value)}
                  options={procedureOptions}
                />
                <Input
                  label="Дата"
                  type="date"
                  value={editDesiredDate}
                  onChange={(e) => setEditDesiredDate(e.target.value)}
                />
                <Input
                  label="Время"
                  type="time"
                  value={editDesiredTime}
                  onChange={(e) => setEditDesiredTime(e.target.value)}
                />
                <Textarea
                  label="Комментарий"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                />
              </div>
            )}

            {modalMode === 'add' && (
              <div className={styles.formGrid}>
                <Select
                  label="Процедура"
                  value={addProcedureId}
                  onChange={(e) => setAddProcedureId(e.target.value)}
                  options={procedureOptions}
                />
                <Select
                  label="Создать как"
                  value={addMode}
                  onChange={(e) => setAddMode(e.target.value as any)}
                  options={[
                    { value: 'asBooked', label: 'Записанную (подтверждённую)' },
                    { value: 'asCompleted', label: 'Выполненную услугу (в отчёты)' },
                  ]}
                  showDefaultOption={false}
                />
                <Input
                  label="Дата"
                  type="date"
                  value={addDesiredDate}
                  onChange={(e) => setAddDesiredDate(e.target.value)}
                />
                <Input
                  label="Время"
                  type="time"
                  value={addDesiredTime}
                  onChange={(e) => setAddDesiredTime(e.target.value)}
                />
                <Textarea
                  label="Комментарий"
                  value={addComment}
                  onChange={(e) => setAddComment(e.target.value)}
                />
              </div>
            )}

            <div className={styles.modalActions}>
              {modalMode === 'view' && (
                <>
                  <Button size="small" variant="outline" onClick={openEdit}>
                    Редактировать
                  </Button>
                  <Button size="small" variant="outline" onClick={openAddProcedure}>
                    Добавить процедуру
                  </Button>
                </>
              )}

              {modalMode === 'edit' && (
                <>
                  <Button size="small" onClick={saveEdit} disabled={saving}>
                    {saving ? 'Сохранение…' : 'Сохранить'}
                  </Button>
                  <Button size="small" variant="secondary" onClick={() => setModalMode('view')} disabled={saving}>
                    Отмена
                  </Button>
                </>
              )}

              {modalMode === 'add' && (
                <>
                  <Button size="small" onClick={createAdditional} disabled={saving}>
                    {saving ? 'Создание…' : 'Создать'}
                  </Button>
                  <Button size="small" variant="secondary" onClick={() => setModalMode('view')} disabled={saving}>
                    Отмена
                  </Button>
                </>
              )}

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

