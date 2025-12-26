export function formatKzt(value: number): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0 ₸'
  // Kazakhstan uses KZT, locale-friendly grouping; currency symbol ₸
  return `${Math.round(n).toLocaleString('ru-RU')} ₸`
}



