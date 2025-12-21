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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
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
                  {...register(`workingSchedule.${day}.open` as any, { required: true })}
                />
                <Input
                  label="Закрытие"
                  type="time"
                  step={900}
                  disabled={watch(`workingSchedule.${day}.closed` as any)}
                  {...register(`workingSchedule.${day}.close` as any, { required: true })}
                />
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', paddingBottom: 8 }}>
                  <input type="checkbox" {...register(`workingSchedule.${day}.closed` as any)} />
                  Выходной
                </label>
              </div>
            ))}
          </div>

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

