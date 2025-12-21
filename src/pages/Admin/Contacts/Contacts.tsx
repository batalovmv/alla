import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { contactInfoService } from '../../../services/firebaseService'
import { CONTACT_INFO } from '../../../config/constants'
import Input from '../../../components/common/Input/Input'
import Button from '../../../components/common/Button/Button'
import Card from '../../../components/common/Card/Card'
import { PageFallback } from '../../../components/common/PageFallback/PageFallback'
import { DayKey, WorkingSchedule, defaultWorkingSchedule, formatWorkingHoursFromSchedule, parseWorkingHoursStringToSchedule } from '../../../utils/workingHours'
import styles from './Contacts.module.css'

interface ContactFormData {
  phone: string
  whatsappPhone: string
  email: string
  address: string
  workingSchedule: WorkingSchedule
  mapEmbedUrl: string
  instagram: string
  vk: string
  telegram: string
  whatsapp: string
}

const Contacts: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [scheduleMode, setScheduleMode] = useState<'simple' | 'advanced'>(() => {
    const raw = localStorage.getItem('admin_schedule_mode')
    return raw === 'advanced' ? 'advanced' : 'simple'
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    getValues,
    setValue,
  } = useForm<ContactFormData>()

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const data = await contactInfoService.get()
      if (data) {
        const schedule: WorkingSchedule =
          (data.workingSchedule as any) ||
          parseWorkingHoursStringToSchedule(data.workingHours || CONTACT_INFO.workingHours) ||
          defaultWorkingSchedule()
        reset({
          phone: data.phone || CONTACT_INFO.phone,
          whatsappPhone: data.whatsappPhone || '',
          email: data.email || CONTACT_INFO.email,
          address: data.address || CONTACT_INFO.address,
          workingSchedule: schedule,
          mapEmbedUrl: data.mapEmbedUrl || '',
          instagram: data.socialMedia?.instagram || CONTACT_INFO.socialMedia.instagram,
          vk: data.socialMedia?.vk || CONTACT_INFO.socialMedia.vk,
          telegram: data.socialMedia?.telegram || CONTACT_INFO.socialMedia.telegram,
          whatsapp: data.socialMedia?.whatsapp || CONTACT_INFO.socialMedia.whatsapp,
        })
      } else {
        reset({
          phone: CONTACT_INFO.phone,
          whatsappPhone: '',
          email: CONTACT_INFO.email,
          address: CONTACT_INFO.address,
          workingSchedule: parseWorkingHoursStringToSchedule(CONTACT_INFO.workingHours),
          mapEmbedUrl: '',
          instagram: CONTACT_INFO.socialMedia.instagram,
          vk: CONTACT_INFO.socialMedia.vk,
          telegram: CONTACT_INFO.socialMedia.telegram,
          whatsapp: CONTACT_INFO.socialMedia.whatsapp,
        })
      }
    } catch (error) {
      console.error('Ошибка загрузки контактов:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true)
    setSuccess(false)
    try {
      const workingHours = formatWorkingHoursFromSchedule(data.workingSchedule)
      await contactInfoService.update({
        phone: data.phone,
        whatsappPhone: String(data.whatsappPhone || '').replace(/\D/g, ''),
        email: data.email,
        address: data.address,
        workingHours,
        workingSchedule: data.workingSchedule,
        mapEmbedUrl: data.mapEmbedUrl || '',
        socialMedia: {
          instagram: data.instagram,
          vk: data.vk,
          telegram: data.telegram,
          whatsapp: data.whatsapp,
        },
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Ошибка сохранения контактов:', error)
      alert('Ошибка при сохранении контактов')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <PageFallback variant="admin" />
  }

  const schedule = watch('workingSchedule') || defaultWorkingSchedule()
  const previewHours = formatWorkingHoursFromSchedule(schedule)
  const days: DayKey[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  const weekdayDays: DayKey[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт']
  const applyWeekTemplate = (opts: { open: string; close: string; closed: boolean }) => {
    for (const d of weekdayDays) {
      setValue(`workingSchedule.${d}.closed` as any, opts.closed, { shouldDirty: true })
      setValue(`workingSchedule.${d}.open` as any, opts.open, { shouldDirty: true })
      setValue(`workingSchedule.${d}.close` as any, opts.close, { shouldDirty: true })
    }
  }
  const applyDayTemplate = (day: DayKey, opts: { open: string; close: string; closed: boolean }) => {
    setValue(`workingSchedule.${day}.closed` as any, opts.closed, { shouldDirty: true })
    setValue(`workingSchedule.${day}.open` as any, opts.open, { shouldDirty: true })
    setValue(`workingSchedule.${day}.close` as any, opts.close, { shouldDirty: true })
  }

  const validateDay = (day: DayKey) => {
    const cur = getValues('workingSchedule')
    const d = cur?.[day]
    if (!d) return true
    if (d.closed) return true
    // Basic HH:MM compare
    const open = String(d.open || '')
    const close = String(d.close || '')
    if (!open || !close) return false
    return open < close
  }

  const weekOpen = watch('workingSchedule.Пн.open' as any) || '09:00'
  const weekClose = watch('workingSchedule.Пн.close' as any) || '18:00'
  const satClosed = Boolean(watch('workingSchedule.Сб.closed' as any))
  const satOpen = watch('workingSchedule.Сб.open' as any) || '10:00'
  const satClose = watch('workingSchedule.Сб.close' as any) || '16:00'
  const sunClosed = Boolean(watch('workingSchedule.Вс.closed' as any))
  const sunOpen = watch('workingSchedule.Вс.open' as any) || '10:00'
  const sunClose = watch('workingSchedule.Вс.close' as any) || '16:00'

  return (
    <div className={styles.contacts}>
      <h1 className={styles.title}>Редактирование контактов</h1>
      <Card className={styles.card}>
        {success && (
          <div className={styles.successMessage}>
            ✓ Контакты успешно сохранены
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label="Телефон"
            {...register('phone', { required: 'Телефон обязателен' })}
            error={errors.phone?.message}
          />

          <Input
            label="WhatsApp номер (для wa.me, формат 7700..., без + и пробелов)"
            {...register('whatsappPhone', {
              validate: (value) => {
                if (!value) return true
                const digits = String(value).replace(/\D/g, '')
                // KZ обычно 11 цифр: 7 + 10
                if (digits.length !== 11) return 'Введите номер из 11 цифр (например 77001234567)'
                if (!digits.startsWith('7')) return 'Номер должен начинаться с 7'
                return true
              },
            })}
            error={errors.whatsappPhone?.message}
          />

          <Input
            label="Email"
            type="email"
            {...register('email', { required: 'Email обязателен' })}
            error={errors.email?.message}
          />

          <Input
            label="Адрес"
            {...register('address', { required: 'Адрес обязателен' })}
            error={errors.address?.message}
          />

          <h3 className={styles.sectionTitle}>График работы</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Режим:</span>
              <select
                value={scheduleMode}
                onChange={(e) => {
                  const v = e.target.value === 'advanced' ? 'advanced' : 'simple'
                  setScheduleMode(v)
                  localStorage.setItem('admin_schedule_mode', v)
                }}
              >
                <option value="simple">Простой (Пн‑Пт / Сб / Вс)</option>
                <option value="advanced">По дням (расширенный)</option>
              </select>
            </label>
          </div>

          {scheduleMode === 'simple' ? (
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 10, alignItems: 'end' }}>
                <div style={{ fontWeight: 600, paddingBottom: 8 }}>Пн‑Пт</div>
                <Input
                  label="Открытие"
                  type="time"
                  step={900}
                  value={weekOpen}
                  onChange={(e) => applyWeekTemplate({ open: e.target.value, close: weekClose, closed: false })}
                />
                <Input
                  label="Закрытие"
                  type="time"
                  step={900}
                  value={weekClose}
                  onChange={(e) => applyWeekTemplate({ open: weekOpen, close: e.target.value, closed: false })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 120px', gap: 10, alignItems: 'end' }}>
                <div style={{ fontWeight: 600, paddingBottom: 8 }}>Сб</div>
                <Input
                  label="Открытие"
                  type="time"
                  step={900}
                  disabled={satClosed}
                  value={satOpen}
                  onChange={(e) => applyDayTemplate('Сб', { open: e.target.value, close: satClose, closed: false })}
                />
                <Input
                  label="Закрытие"
                  type="time"
                  step={900}
                  disabled={satClosed}
                  value={satClose}
                  onChange={(e) => applyDayTemplate('Сб', { open: satOpen, close: e.target.value, closed: false })}
                />
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', paddingBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={satClosed}
                    onChange={(e) => applyDayTemplate('Сб', { open: satOpen, close: satClose, closed: e.target.checked })}
                  />
                  Выходной
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 120px', gap: 10, alignItems: 'end' }}>
                <div style={{ fontWeight: 600, paddingBottom: 8 }}>Вс</div>
                <Input
                  label="Открытие"
                  type="time"
                  step={900}
                  disabled={sunClosed}
                  value={sunOpen}
                  onChange={(e) => applyDayTemplate('Вс', { open: e.target.value, close: sunClose, closed: false })}
                />
                <Input
                  label="Закрытие"
                  type="time"
                  step={900}
                  disabled={sunClosed}
                  value={sunClose}
                  onChange={(e) => applyDayTemplate('Вс', { open: sunOpen, close: e.target.value, closed: false })}
                />
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', paddingBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={sunClosed}
                    onChange={(e) => applyDayTemplate('Вс', { open: sunOpen, close: sunClose, closed: e.target.checked })}
                  />
                  Выходной
                </label>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {days.map((day) => (
                <div
                  key={day}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '72px 1fr 1fr 120px',
                    gap: 10,
                    alignItems: 'end',
                  }}
                >
                  <div style={{ fontWeight: 600, paddingBottom: 8 }}>{day}</div>
                  <Input
                    label="Открытие"
                    type="time"
                    step={900}
                    disabled={watch(`workingSchedule.${day}.closed` as any)}
                    {...register(`workingSchedule.${day}.open` as any, {
                      required: !watch(`workingSchedule.${day}.closed` as any),
                      validate: () => validateDay(day) || 'Открытие должно быть раньше закрытия',
                    })}
                  />
                  <Input
                    label="Закрытие"
                    type="time"
                    step={900}
                    disabled={watch(`workingSchedule.${day}.closed` as any)}
                    {...register(`workingSchedule.${day}.close` as any, {
                      required: !watch(`workingSchedule.${day}.closed` as any),
                      validate: () => validateDay(day) || 'Закрытие должно быть позже открытия',
                    })}
                  />
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', paddingBottom: 8 }}>
                    <input type="checkbox" {...register(`workingSchedule.${day}.closed` as any)} />
                    Выходной
                  </label>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 8, opacity: 0.85 }}>
            <strong>Как будет показано на сайте:</strong> {previewHours}
          </div>

          <Input
            label="Ссылка для встраивания карты (iframe src)"
            type="url"
            {...register('mapEmbedUrl')}
            error={errors.mapEmbedUrl?.message}
          />

          <h3 className={styles.sectionTitle}>Социальные сети</h3>

          <Input
            label="Instagram"
            type="url"
            {...register('instagram')}
            error={errors.instagram?.message}
          />

          <Input
            label="VK"
            type="url"
            {...register('vk')}
            error={errors.vk?.message}
          />

          <Input
            label="Telegram"
            type="url"
            {...register('telegram')}
            error={errors.telegram?.message}
          />

          <Input
            label="WhatsApp"
            type="url"
            {...register('whatsapp')}
            error={errors.whatsapp?.message}
          />

          <div className={styles.actions}>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default Contacts

