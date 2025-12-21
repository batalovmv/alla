type DayKey = 'Пн' | 'Вт' | 'Ср' | 'Чт' | 'Пт' | 'Сб' | 'Вс'

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
  now?: Date
  leadMinutes?: number
  stepMinutes?: number
}): BookingSuggestion {
  const now = opts.now ?? new Date()
  const leadMinutes = opts.leadMinutes ?? 90
  const stepMinutes = opts.stepMinutes ?? 15

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayWindow = getWorkingWindowForDate(opts.workingHours, today)

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
    const w = getWorkingWindowForDate(opts.workingHours, d)
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


