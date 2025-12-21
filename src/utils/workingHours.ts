export type DayKey = 'Пн' | 'Вт' | 'Ср' | 'Чт' | 'Пт' | 'Сб' | 'Вс'

const DAY_ORDER: DayKey[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function toDayKey(date: Date): DayKey {
  // JS: 0=Sun ... 6=Sat
  const d = date.getDay()
  if (d === 0) return 'Вс'
  return DAY_ORDER[d - 1]
}

function parseTimeToMinutes(raw: string): number | null {
  const m = raw.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const hh = Number(m[1])
  const mm = Number(m[2])
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null
  return hh * 60 + mm
}

function parseDaysToken(token: string): DayKey[] {
  const t = token.trim()
  const range = t.match(/^(Пн|Вт|Ср|Чт|Пт|Сб|Вс)\s*-\s*(Пн|Вт|Ср|Чт|Пт|Сб|Вс)$/)
  if (range) {
    const start = range[1] as DayKey
    const end = range[2] as DayKey
    const si = DAY_ORDER.indexOf(start)
    const ei = DAY_ORDER.indexOf(end)
    if (si === -1 || ei === -1) return []
    if (si <= ei) return DAY_ORDER.slice(si, ei + 1)
    // wrap-around (rare)
    return [...DAY_ORDER.slice(si), ...DAY_ORDER.slice(0, ei + 1)]
  }
  const single = t.match(/^(Пн|Вт|Ср|Чт|Пт|Сб|Вс)$/)
  if (single) return [single[1] as DayKey]
  return []
}

export type WorkingWindow = { openMin: number; closeMin: number }

export type WorkingScheduleDay = {
  closed: boolean
  open: string // HH:MM
  close: string // HH:MM
}

export type WorkingSchedule = Record<DayKey, WorkingScheduleDay>

export function defaultWorkingSchedule(): WorkingSchedule {
  return {
    'Пн': { closed: false, open: '09:00', close: '18:00' },
    'Вт': { closed: false, open: '09:00', close: '18:00' },
    'Ср': { closed: false, open: '09:00', close: '18:00' },
    'Чт': { closed: false, open: '09:00', close: '18:00' },
    'Пт': { closed: false, open: '09:00', close: '18:00' },
    'Сб': { closed: false, open: '10:00', close: '16:00' },
    'Вс': { closed: true, open: '10:00', close: '16:00' },
  }
}

export function normalizeWorkingSchedule(raw: any): WorkingSchedule | null {
  if (!raw || typeof raw !== 'object') return null
  const base = defaultWorkingSchedule()
  const out: any = { ...base }
  for (const day of DAY_ORDER) {
    const v = (raw as any)[day]
    if (!v || typeof v !== 'object') continue
    const closed = Boolean(v.closed)
    const open = typeof v.open === 'string' ? v.open : base[day].open
    const close = typeof v.close === 'string' ? v.close : base[day].close
    out[day] = { closed, open, close }
  }
  return out as WorkingSchedule
}

export function formatWorkingHoursFromSchedule(schedule: WorkingSchedule): string {
  const parts: string[] = []

  type Sig = { closed: boolean; open: string; close: string }
  const sigOf = (d: DayKey): Sig => {
    const s = schedule[d]
    return { closed: Boolean(s.closed), open: s.open, close: s.close }
  }

  let start: DayKey | null = null
  let prev: DayKey | null = null
  let prevSig: Sig | null = null

  const flush = () => {
    if (!start || !prev || !prevSig) return
    const dayLabel = start === prev ? start : `${start}-${prev}`
    if (prevSig.closed) {
      parts.push(`${dayLabel}: выходной`)
    } else {
      parts.push(`${dayLabel}: ${prevSig.open} - ${prevSig.close}`)
    }
  }

  for (const d of DAY_ORDER) {
    const sig = sigOf(d)
    if (!start) {
      start = d
      prev = d
      prevSig = sig
      continue
    }
    const same =
      prevSig?.closed === sig.closed &&
      prevSig?.open === sig.open &&
      prevSig?.close === sig.close
    if (same) {
      prev = d
      continue
    }
    flush()
    start = d
    prev = d
    prevSig = sig
  }
  flush()

  return parts.join(', ')
}

export function parseWorkingHoursStringToSchedule(workingHours: string): WorkingSchedule {
  // Start from all closed; then set windows from parsed string.
  const out: WorkingSchedule = {
    'Пн': { closed: true, open: '09:00', close: '18:00' },
    'Вт': { closed: true, open: '09:00', close: '18:00' },
    'Ср': { closed: true, open: '09:00', close: '18:00' },
    'Чт': { closed: true, open: '09:00', close: '18:00' },
    'Пт': { closed: true, open: '09:00', close: '18:00' },
    'Сб': { closed: true, open: '10:00', close: '16:00' },
    'Вс': { closed: true, open: '10:00', close: '16:00' },
  }

  const parts = String(workingHours || '').split(',').map((x) => x.trim()).filter(Boolean)
  for (const p of parts) {
    const m = p.match(/^(.*?)\s*:\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$/)
    if (!m) continue
    const daysToken = m[1]
    const days = parseDaysToken(daysToken)
    const open = m[2].padStart(5, '0')
    const close = m[3].padStart(5, '0')
    for (const d of days) {
      out[d] = { closed: false, open, close }
    }
  }
  return out
}

export function getWorkingWindowForDateFromSchedule(schedule: WorkingSchedule, date: Date): WorkingWindow | null {
  const day = toDayKey(date)
  const d = schedule[day]
  if (!d || d.closed) return null
  const openMin = parseTimeToMinutes(d.open)
  const closeMin = parseTimeToMinutes(d.close)
  if (openMin == null || closeMin == null) return null
  if (closeMin <= openMin) return null
  return { openMin, closeMin }
}

// Parses strings like: "Пн-Пт: 9:00 - 18:00, Сб: 10:00 - 16:00"
export function getWorkingWindowForDate(workingHours: string, date: Date): WorkingWindow | null {
  const day = toDayKey(date)
  const parts = String(workingHours || '').split(',').map((x) => x.trim()).filter(Boolean)
  for (const p of parts) {
    const m = p.match(/^(.*?)\s*:\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*$/)
    if (!m) continue
    const daysToken = m[1]
    const days = parseDaysToken(daysToken)
    if (!days.includes(day)) continue
    const openMin = parseTimeToMinutes(m[2])
    const closeMin = parseTimeToMinutes(m[3])
    if (openMin == null || closeMin == null) continue
    if (closeMin <= openMin) continue
    return { openMin, closeMin }
  }
  return null
}

export function roundUpToStep(mins: number, step: number): number {
  return Math.ceil(mins / step) * step
}

export function minutesToHHMM(mins: number): string {
  const hh = Math.floor(mins / 60)
  const mm = mins % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export function toISODateLocal(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export type BookingSuggestion = {
  suggestedDate: string
  suggestedTime: string
  notice?: string
  isClosedNow?: boolean
  isClosingSoon?: boolean
}

export function suggestBookingSlot(opts: {
  workingHours: string
  schedule?: WorkingSchedule | null
  now?: Date
  leadMinutes?: number
  stepMinutes?: number
}): BookingSuggestion {
  const now = opts.now ?? new Date()
  const leadMinutes = opts.leadMinutes ?? 90
  const stepMinutes = opts.stepMinutes ?? 15

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayWindow = opts.schedule
    ? getWorkingWindowForDateFromSchedule(opts.schedule, today)
    : getWorkingWindowForDate(opts.workingHours, today)

  const nowMin = now.getHours() * 60 + now.getMinutes()
  const requestedMin = nowMin + leadMinutes

  if (todayWindow) {
    const closingSoon = todayWindow.closeMin - nowMin <= 60 && nowMin < todayWindow.closeMin
    // If before open — suggest open+lead rounded
    if (nowMin < todayWindow.openMin) {
      const t = roundUpToStep(todayWindow.openMin + 30, stepMinutes)
      return {
        suggestedDate: toISODateLocal(today),
        suggestedTime: minutesToHHMM(Math.min(t, todayWindow.closeMin - stepMinutes)),
        notice: 'Мы ещё не открылись — выбрано ближайшее доступное время.',
        isClosedNow: true,
      }
    }
    // If within working hours — suggest now+lead rounded, but not after close
    if (nowMin >= todayWindow.openMin && nowMin < todayWindow.closeMin) {
      const t = roundUpToStep(requestedMin, stepMinutes)
      // If lead pushes beyond close or too close to close, move to next day open
      if (t >= todayWindow.closeMin) {
        // fallthrough to next day
      } else {
        return {
          suggestedDate: toISODateLocal(today),
          suggestedTime: minutesToHHMM(t),
          notice: closingSoon
            ? 'До закрытия остался примерно час — пожалуйста, выберите удобное время.'
            : undefined,
          isClosingSoon: closingSoon,
        }
      }
    }
  }

  // Otherwise: suggest next available day at open+30min (rounded)
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    const w = opts.schedule
      ? getWorkingWindowForDateFromSchedule(opts.schedule, d)
      : getWorkingWindowForDate(opts.workingHours, d)
    if (!w) continue
    const t = roundUpToStep(w.openMin + 30, stepMinutes)
    return {
      suggestedDate: toISODateLocal(d),
      suggestedTime: minutesToHHMM(Math.min(t, w.closeMin - stepMinutes)),
      notice: 'Сейчас мы закрыты — выбрано ближайшее доступное время.',
      isClosedNow: true,
    }
  }

  // Last resort
  return {
    suggestedDate: toISODateLocal(today),
    suggestedTime: '10:00',
    notice: 'Не удалось распознать часы работы — выберите дату и время вручную.',
    isClosedNow: true,
  }
}


