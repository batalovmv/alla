import React, { useEffect, useMemo, useState } from 'react'
import Card from '../../../components/common/Card/Card'
import Modal from '../../../components/common/Modal/Modal'
import Button from '../../../components/common/Button/Button'
import { bookingsService } from '../../../services/firebaseService'
import { Booking } from '../../../types'
import styles from './Calendar.module.css'

type BookingLite = Booking & { _normalizedStatus?: string }

function formatMonthValue(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function parseMonthValue(value: string): Date {
  const [y, m] = value.split('-').map((x) => Number(x))
  return new Date(y, (m || 1) - 1, 1)
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}

function toDateKey(d: Date): string {
  return d.toISOString().split('T')[0]
}

function safeDateFromISO(value: string): Date {
  // desiredDate expected as YYYY-MM-DD
  const d = new Date(value)
  return Number.isFinite(d.getTime()) ? d : new Date()
}

function normalizeBookingStatus(status: any): string {
  if (status === 'processed') return 'awaiting'
  return String(status || '')
}

const weekdayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const Calendar: React.FC = () => {
  const [month, setMonth] = useState(() => formatMonthValue(new Date()))
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<BookingLite[]>([])
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<BookingLite | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const all = (await bookingsService.getAll()) as BookingLite[]
        const normalized = (all || []).map((b) => ({
          ...b,
          _normalizedStatus: normalizeBookingStatus((b as any).status),
        }))
        const confirmed = normalized.filter((b) => b._normalizedStatus === 'awaiting')
        if (mounted) setItems(confirmed)
      } catch (e) {
        console.error('Ошибка загрузки календаря:', e)
        if (mounted) setItems([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [month, reloadKey])

  const monthBase = useMemo(() => parseMonthValue(month), [month])
  const monthStart = useMemo(() => startOfMonth(monthBase), [monthBase])
  const monthEnd = useMemo(() => endOfMonth(monthBase), [monthBase])
  // daysInMonth available if later we want KPIs; currently not needed.

  const itemsByDay = useMemo(() => {
    const map = new Map<string, BookingLite[]>()
    for (const b of items) {
      const d = safeDateFromISO(String((b as any).desiredDate || ''))
      if (d < monthStart || d > monthEnd) continue
      const key = toDateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate()))
      const cur = map.get(key) || []
      cur.push(b)
      map.set(key, cur)
    }
    // sort by time within day if present
    for (const [key, list] of map.entries()) {
      list.sort((a, b) => String(a.desiredTime || '').localeCompare(String(b.desiredTime || '')))
      map.set(key, list)
    }
    return map
  }, [items, monthStart, monthEnd])

  const gridDates = useMemo(() => {
    // Calendar grid: Monday-first
    const first = new Date(monthStart)
    const jsDow = first.getDay() // 0..6 (Sun..Sat)
    const monIndex = jsDow === 0 ? 6 : jsDow - 1 // 0..6 (Mon..Sun)
    const start = new Date(monthStart)
    start.setDate(start.getDate() - monIndex)

    const cells: Date[] = []
    for (let i = 0; i < 42; i += 1) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      cells.push(d)
    }
    return cells
  }, [monthStart])

  const selectedDayBookings = useMemo(() => {
    if (!selectedDayKey) return []
    return itemsByDay.get(selectedDayKey) || []
  }, [itemsByDay, selectedDayKey])

  const todayKey = useMemo(() => toDateKey(new Date()), [])

  const closeDay = () => setSelectedDayKey(null)
  const closeBooking = () => setSelectedBooking(null)

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Календарь записей</h1>
          <p className={styles.subtitle}>Здесь показываются подтверждённые заявки (статус: «Записаны»).</p>
        </div>
        <div className={styles.controls}>
          <label className={styles.control}>
            <span>Месяц</span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className={styles.monthInput}
            />
          </label>
          <Button
            variant="outline"
            onClick={() => setReloadKey((x) => x + 1)}
            disabled={loading}
          >
            Обновить
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className={styles.empty}>Загрузка…</Card>
      ) : (
        <>
          <div className={styles.weekdayRow}>
            {weekdayLabels.map((w) => (
              <div key={w} className={styles.weekday}>
                {w}
              </div>
            ))}
          </div>
          <div className={styles.grid}>
            {gridDates.map((d) => {
              const inMonth = d.getMonth() === monthBase.getMonth()
              const key = toDateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate()))
              const list = itemsByDay.get(key) || []
              const count = list.length
              const preview = list[0]
                ? `${list[0].desiredTime || ''} • ${list[0].name} • ${list[0].procedureName || ''}`.trim()
                : ''
              return (
                <Card
                  key={`${key}-${inMonth ? 'm' : 'o'}`}
                  className={`${styles.dayCell} ${inMonth ? '' : styles.dayCellMuted}`}
                  onClick={() => setSelectedDayKey(key)}
                >
                  <div className={styles.dayTop}>
                    <div className={styles.dayNumber}>
                      {d.getDate()}
                      {key === todayKey ? ' •' : ''}
                    </div>
                    {count > 0 && <div className={styles.badge}>{count}</div>}
                  </div>
                  {count > 0 && <div className={styles.preview}>{preview}</div>}
                </Card>
              )
            })}
          </div>
        </>
      )}

      <Modal
        isOpen={!!selectedDayKey}
        onClose={closeDay}
        title={
          selectedDayKey
            ? `Записи на ${new Date(selectedDayKey).toLocaleDateString('ru-RU')}`
            : undefined
        }
      >
        {selectedDayBookings.length === 0 ? (
          <Card className={styles.empty}>На этот день подтверждённых записей нет.</Card>
        ) : (
          <div className={styles.list}>
            {selectedDayBookings.map((b) => (
              <Card
                key={b.id}
                className={styles.bookingItem}
                onClick={() => setSelectedBooking(b)}
              >
                <div className={styles.bookingLine}>
                  <div className={styles.bookingMain}>
                    <p className={styles.bookingTitle}>{b.name}</p>
                    <p className={styles.bookingSub}>
                      {b.procedureName || 'Процедура'} • {b.phone}
                    </p>
                  </div>
                  <div className={styles.timeChip}>{b.desiredTime || '—'}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!selectedBooking}
        onClose={closeBooking}
        title={selectedBooking ? `Заявка • ${selectedBooking.name}` : undefined}
      >
        {selectedBooking && (
          <>
            <div className={styles.detailGrid}>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Процедура</div>
                <div className={styles.detailValue}>{selectedBooking.procedureName || '—'}</div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Дата/время</div>
                <div className={styles.detailValue}>
                  {new Date(selectedBooking.desiredDate).toLocaleDateString('ru-RU')} • {selectedBooking.desiredTime || '—'}
                </div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Телефон</div>
                <div className={styles.detailValue}>
                  <a href={`tel:${selectedBooking.phone}`}>{selectedBooking.phone}</a>
                </div>
              </div>
              {selectedBooking.email && (
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel}>Email</div>
                  <div className={styles.detailValue}>
                    <a href={`mailto:${selectedBooking.email}`}>{selectedBooking.email}</a>
                  </div>
                </div>
              )}
              {selectedBooking.comment && (
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel}>Комментарий</div>
                  <div className={styles.detailValue}>{selectedBooking.comment}</div>
                </div>
              )}
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Создано</div>
                <div className={styles.detailValue}>
                  {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString('ru-RU') : '—'}
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <Button
                size="small"
                onClick={() => {
                  window.open(`tel:${selectedBooking.phone}`, '_self')
                }}
              >
                Позвонить
              </Button>
              <Button
                size="small"
                variant="secondary"
                onClick={() => closeBooking()}
              >
                Закрыть
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

export default Calendar


