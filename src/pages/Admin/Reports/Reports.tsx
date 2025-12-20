import React, { useEffect, useMemo, useState } from 'react'
import Card from '../../../components/common/Card/Card'
import Button from '../../../components/common/Button/Button'
import {
  bookingsService,
  clientsService,
  proceduresService,
  reviewMetaService,
  reviewsService,
  serviceRecordsService,
} from '../../../services/firebaseService'
import { db } from '../../../config/firebase'
import { deleteDoc, doc } from 'firebase/firestore'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'
import styles from './Reports.module.css'

type ServiceRecordLite = {
  id: string
  date: Date
  procedureName: string
  procedureId?: string
  price?: number
  clientName?: string
  clientPhone?: string
}

type DemoSeed = {
  createdAt: string
  month: string
  procedureIds: string[]
  bookingIds: string[]
  serviceRecordIds: string[]
  reviewIds: string[]
  clientIds: string[]
}

const DEMO_SEED_KEY = 'akbeauty_demo_seed_v1'

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
}

function startOfNextMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0)
}

function formatMonthValue(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function parseMonthValue(value: string): Date {
  const [y, m] = value.split('-').map((x) => Number(x))
  return new Date(y, (m || 1) - 1, 1)
}

function toKzt(value: number): string {
  return `${Math.round(value).toLocaleString('ru-RU')} ₸`
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

function dayLabel(d: Date): string {
  return String(d.getDate()).padStart(2, '0')
}

const Reports: React.FC = () => {
  const [month, setMonth] = useState(() => formatMonthValue(new Date()))
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<ServiceRecordLite[]>([])
  const [seeding, setSeeding] = useState(false)
  const [seedInfo, setSeedInfo] = useState<DemoSeed | null>(null)

  const loadSeedInfo = useMemo(() => {
    return (): DemoSeed | null => {
      try {
        const raw = localStorage.getItem(DEMO_SEED_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as DemoSeed
        if (!parsed || typeof parsed !== 'object') return null
        if (!Array.isArray(parsed.bookingIds)) return null
        return parsed
      } catch {
        return null
      }
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const demo = loadSeedInfo()
        if (mounted) setSeedInfo(demo)
        const base = parseMonthValue(month)
        const start = startOfMonth(base)
        const end = startOfNextMonth(base)
        const data = await serviceRecordsService.getByDateRange(start, end)
        const mapped = (data || []).map((r: any) => ({
          id: r.id,
          date: r.date instanceof Date ? r.date : new Date(r.date),
          procedureName: r.procedureName || 'Процедура',
          procedureId: r.procedureId,
          price: typeof r.price === 'number' ? r.price : Number(r.price) || 0,
          clientName: r.clientName,
          clientPhone: r.clientPhone,
        })) as ServiceRecordLite[]
        if (mounted) setRecords(mapped)
      } catch (e) {
        console.error('Ошибка загрузки отчётов:', e)
        if (mounted) setRecords([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [month])

  const ensureFirebase = () => {
    if (!db) {
      alert('Firebase не настроен. Заполните .env / secrets и задеплойте.' )
      throw new Error('Firebase not configured')
    }
  }

  const seedDemoData = async () => {
    try {
      ensureFirebase()
      setSeeding(true)

      const baseMonth = parseMonthValue(month)
      const monthLabel = formatMonthValue(baseMonth)

      // If seed already exists, ask to delete first
      const existing = loadSeedInfo()
      if (existing) {
        alert('Тестовые данные уже созданы. Сначала удалите их.')
        return
      }

      // 1) Create demo procedures
      const procedureTemplates = [
        { name: 'Чистка лица (ультразвук)', category: 'Лицо', price: 12000, duration: 60 },
        { name: 'Пилинг (поверхностный)', category: 'Лицо', price: 15000, duration: 50 },
        { name: 'Брови (коррекция + окрашивание)', category: 'Брови', price: 8000, duration: 40 },
        { name: 'Ламинирование ресниц', category: 'Ресницы', price: 18000, duration: 70 },
      ]

      const procedureIds: string[] = []
      for (const p of procedureTemplates) {
        const id = await proceduresService.create({
          name: `DEMO • ${p.name}`,
          category: p.category,
          description: 'Демо-описание для тестовых данных.',
          fullDescription:
            'Демо-полное описание процедуры для проверки интерфейса и отчётов.',
          price: p.price,
          duration: p.duration,
          images: ['/images/placeholder.jpg'],
          indications: ['Демо показание 1', 'Демо показание 2'],
          contraindications: ['Демо противопоказание'],
          popular: p.price >= 15000,
        })
        procedureIds.push(id)
      }

      // Load created procedures to reuse names/prices
      const procedures = await Promise.all(
        procedureIds.map(async (id) => await proceduresService.getById(id))
      )
      const validProcedures = procedures.filter(Boolean) as any[]

      // 2) Create demo clients
      const clientTemplates = [
        { name: 'Алия', phone: '+7 777 000 00 01' },
        { name: 'Айгерим', phone: '+7 777 000 00 02' },
        { name: 'Динара', phone: '+7 777 000 00 03' },
        { name: 'Мария', phone: '+7 777 000 00 04' },
        { name: 'Ольга', phone: '+7 777 000 00 05' },
      ]
      const clientIds: string[] = []
      for (const c of clientTemplates) {
        const id = await clientsService.create({
          name: c.name,
          phone: c.phone,
          totalVisits: 0,
        })
        clientIds.push(id)
      }

      // 3) Create demo bookings
      const bookingIds: string[] = []
      const totalDays = daysInMonth(baseMonth)
      const pickDay = (n: number) =>
        new Date(baseMonth.getFullYear(), baseMonth.getMonth(), Math.max(1, Math.min(totalDays, n)))
      const fmtDate = (d: Date) => d.toISOString().split('T')[0]

      const bookingTemplates = [
        { clientIdx: 0, procIdx: 0, day: 2, time: '11:00', status: 'new' },
        { clientIdx: 1, procIdx: 1, day: 3, time: '15:00', status: 'awaiting' },
        { clientIdx: 2, procIdx: 2, day: 5, time: '10:00', status: 'completed' },
        { clientIdx: 3, procIdx: 3, day: 7, time: '13:30', status: 'completed' },
        { clientIdx: 4, procIdx: 1, day: 9, time: '18:00', status: 'cancelled' },
        { clientIdx: 0, procIdx: 0, day: 12, time: '12:00', status: 'completed' },
        { clientIdx: 1, procIdx: 3, day: 14, time: '16:00', status: 'awaiting' },
      ] as const

      for (const b of bookingTemplates) {
        const client = clientTemplates[b.clientIdx]
        const proc = validProcedures[b.procIdx] || validProcedures[0]
        const bookingId = await bookingsService.create({
          name: client.name,
          phone: client.phone,
          procedureId: proc.id,
          procedureName: proc.name,
          desiredDate: fmtDate(pickDay(b.day)),
          desiredTime: b.time,
          comment: '[DEMO] Демо заявка',
          consent: true,
        })
        bookingIds.push(bookingId)
        if (b.status !== 'new') {
          await bookingsService.update(bookingId, { status: b.status })
        }
      }

      // 4) Create demo service records (drives charts)
      const serviceRecordIds: string[] = []
      const randomFrom = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
      const times = ['10:00', '11:30', '13:00', '15:00', '17:30']

      for (let i = 0; i < 22; i += 1) {
        const day = 1 + ((i * 2) % Math.max(1, totalDays))
        const proc = randomFrom(validProcedures)
        const client = randomFrom(clientTemplates)
        const d = pickDay(day)
        // keep some spread by adding hour component
        const [hh, mm] = randomFrom(times).split(':').map((x) => Number(x))
        d.setHours(hh || 10, mm || 0, 0, 0)
        const price = Number(proc.price) || 0
        const id = await serviceRecordsService.create({
          clientId: clientIds[clientTemplates.findIndex((x) => x.phone === client.phone)] || '',
          clientPhone: client.phone,
          clientName: client.name,
          procedureId: proc.id,
          procedureName: proc.name,
          date: d,
          price,
          notes: '[DEMO] Демо услуга',
        })
        serviceRecordIds.push(id)
      }

      // 5) Create demo reviews (+ meta phone)
      const reviewIds: string[] = []
      const reviewTexts = [
        'Очень понравилось, всё аккуратно и приятно.',
        'Результат заметен сразу, спасибо!',
        'Комфортно, профессионально, вернусь ещё.',
        'Хорошая атмосфера и внимательный подход.',
        'Всё супер, рекомендую!',
      ]

      for (let i = 0; i < 10; i += 1) {
        const client = clientTemplates[i % clientTemplates.length]
        const proc = validProcedures[i % validProcedures.length]
        const rating = 3 + (i % 3) // 3..5
        const reviewId = await reviewsService.create({
          clientName: client.name,
          procedureId: proc.id,
          procedureName: proc.name,
          rating,
          text: `[DEMO] ${randomFrom(reviewTexts)}`,
          date: fmtDate(pickDay(1 + (i % Math.max(1, totalDays)))),
        })
        reviewIds.push(reviewId)
        await reviewMetaService.upsert(reviewId, { phone: client.phone })

        // Approve часть отзывов, остальные остаются pending
        if (i % 2 === 0) {
          await reviewsService.update(reviewId, { approved: true })
        }
      }

      const seed: DemoSeed = {
        createdAt: new Date().toISOString(),
        month: monthLabel,
        procedureIds,
        bookingIds,
        serviceRecordIds,
        reviewIds,
        clientIds,
      }

      localStorage.setItem(DEMO_SEED_KEY, JSON.stringify(seed))
      setSeedInfo(seed)
      alert('Тестовые данные созданы.')
    } catch (e) {
      console.error(e)
      alert('Ошибка создания тестовых данных')
    } finally {
      setSeeding(false)
    }
  }

  const deleteDemoData = async () => {
    try {
      ensureFirebase()
      setSeeding(true)
      const seed = loadSeedInfo()
      if (!seed) {
        alert('Тестовые данные не найдены.')
        return
      }

      const safeDeleteMany = async (col: string, ids: string[]) => {
        for (const id of ids) {
          try {
            await deleteDoc(doc(db!, col, id))
          } catch (e) {
            // ignore missing/permission issues
          }
        }
      }

      await safeDeleteMany('serviceRecords', seed.serviceRecordIds || [])
      await safeDeleteMany('bookings', seed.bookingIds || [])
      await safeDeleteMany('reviews', seed.reviewIds || [])
      await safeDeleteMany('reviewMeta', seed.reviewIds || [])
      await safeDeleteMany('procedures', seed.procedureIds || [])
      await safeDeleteMany('clients', seed.clientIds || [])

      localStorage.removeItem(DEMO_SEED_KEY)
      setSeedInfo(null)
      alert('Тестовые данные удалены.')
    } catch (e) {
      console.error(e)
      alert('Ошибка удаления тестовых данных')
    } finally {
      setSeeding(false)
    }
  }

  const totalRevenue = useMemo(
    () => records.reduce((sum, r) => sum + (r.price || 0), 0),
    [records]
  )

  const totalServices = records.length

  const dailyRevenue = useMemo(() => {
    const base = parseMonthValue(month)
    const start = startOfMonth(base)
    const totalDays = daysInMonth(base)
    const map = new Map<string, number>()
    for (let day = 1; day <= totalDays; day += 1) {
      const d = new Date(base.getFullYear(), base.getMonth(), day)
      map.set(dayLabel(d), 0)
    }
    for (const r of records) {
      const d = startOfDay(r.date)
      if (d < start) continue
      if (d.getMonth() !== base.getMonth() || d.getFullYear() !== base.getFullYear()) continue
      const key = dayLabel(d)
      map.set(key, (map.get(key) || 0) + (r.price || 0))
    }
    return Array.from(map.entries()).map(([day, revenue]) => ({ day, revenue: Math.round(revenue) }))
  }, [month, records])

  const topProcedures = useMemo(() => {
    const map = new Map<string, { name: string; count: number; revenue: number }>()
    for (const r of records) {
      const key = r.procedureName || 'Процедура'
      const cur = map.get(key) || { name: key, count: 0, revenue: 0 }
      cur.count += 1
      cur.revenue += r.price || 0
      map.set(key, cur)
    }
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map((x) => ({ ...x, revenue: Math.round(x.revenue) }))
  }, [records])

  const weekdayCounts = useMemo(() => {
    const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    const counts = new Array(7).fill(0)
    for (const r of records) {
      // JS: 0=Sun..6=Sat, we want Mon..Sun
      const dow = r.date.getDay()
      const idx = dow === 0 ? 6 : dow - 1
      counts[idx] += 1
    }
    return labels.map((name, i) => ({ name, count: counts[i] }))
  }, [records])

  const tooltipMoney = (value: any) => toKzt(Number(value) || 0)

  const handleCsvExport = () => {
    const header = ['date', 'procedureName', 'price', 'clientName', 'clientPhone']
    const rows = records.map((r) => [
      r.date.toISOString().split('T')[0],
      r.procedureName,
      String(Math.round(r.price || 0)),
      r.clientName || '',
      r.clientPhone || '',
    ])

    // Excel-friendly for RU/KZ locales: use semicolon delimiter
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`
    const csv =
      header.map(esc).join(';') +
      '\n' +
      rows.map((row) => row.map((v) => esc(String(v))).join(';')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `akbeauty-report-${month}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.reports}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Отчёты</h1>
          <p className={styles.subtitle}>Выручка считается по факту выполнено.</p>
          <div className={styles.seedNote}>
            Для демонстрации можно создать тестовые данные (заявки, отзывы и услуги). Их можно удалить одним кликом.
          </div>
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
          <Button onClick={handleCsvExport} disabled={records.length === 0}>
            Скачать CSV
          </Button>
          {!seedInfo ? (
            <Button onClick={seedDemoData} disabled={seeding} variant="outline">
              Создать тестовые данные
            </Button>
          ) : (
            <Button onClick={deleteDemoData} disabled={seeding} variant="secondary">
              Удалить тестовые данные
            </Button>
          )}
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <Card className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Выручка</div>
          <div className={styles.kpiValue}>{toKzt(totalRevenue)}</div>
        </Card>
        <Card className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Выполнено услуг</div>
          <div className={styles.kpiValue}>{totalServices}</div>
        </Card>
      </div>

      {loading ? (
        <Card className={styles.loading}>Загрузка…</Card>
      ) : records.length === 0 ? (
        <Card className={styles.empty}>За выбранный месяц данных нет.</Card>
      ) : (
        <div className={styles.chartsGrid}>
          <Card className={styles.chartCard}>
            <div className={styles.chartTitle}>Выручка по дням</div>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={dailyRevenue} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary-strong)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-primary-2)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(31,42,51,0.08)" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                  <Tooltip formatter={(v) => tooltipMoney(v)} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-primary-strong)"
                    strokeWidth={2}
                    fill="url(#revFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className={styles.chartCard}>
            <div className={styles.chartTitle}>Топ процедур (по количеству)</div>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topProcedures} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(31,42,51,0.08)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} hide />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-accent)" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className={styles.legendList}>
                {topProcedures.map((p) => (
                  <div key={p.name} className={styles.legendItem}>
                    <span className={styles.legendName}>{p.name}</span>
                    <span className={styles.legendValue}>{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className={styles.chartCard}>
            <div className={styles.chartTitle}>Посещения по дням недели</div>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weekdayCounts} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(31,42,51,0.08)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-primary-2)" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Reports


