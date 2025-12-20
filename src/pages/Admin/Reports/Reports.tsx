import React, { useEffect, useMemo, useState } from 'react'
import Card from '../../../components/common/Card/Card'
import Button from '../../../components/common/Button/Button'
import { serviceRecordsService } from '../../../services/firebaseService'
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

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
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


