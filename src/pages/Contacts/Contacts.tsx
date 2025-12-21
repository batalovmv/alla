import React, { useEffect, useMemo, useCallback, useState, useRef } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  submitBooking,
  submitBookingSuccess,
  submitBookingFailure,
  resetForm,
} from '../../store/slices/bookingSlice'
import { setProcedures, setLoading as setProceduresLoading } from '../../store/slices/proceduresSlice'
import { fetchProcedures } from '../../utils/api'
import { submitBooking as submitBookingAPI } from '../../utils/api'
import { isStale } from '../../utils/cache'
import { CONTACT_INFO } from '../../config/constants'
import { getContactInfo } from '../../utils/contactInfo'
import { buildWhatsAppHref } from '../../utils/whatsapp'
import { buildTelegramHref } from '../../utils/telegram'
import { safeHttpUrl } from '../../utils/url'
import { BookingFormData, ContactInfo } from '../../types'
import { validatePhone, validateEmail, normalizePhone } from '../../utils/validation'
import { getWorkingWindowForDate, suggestBookingSlot, toISODateLocal, minutesToHHMM, roundUpToStep } from '../../utils/workingHours'
import { useDelayedFlag } from '../../utils/useDelayedFlag'
import Card from '../../components/common/Card/Card'
import Input from '../../components/common/Input/Input'
import { MaskedPhoneInput } from '../../components/common/MaskedPhoneInput/MaskedPhoneInput'
import Textarea from '../../components/common/Textarea/Textarea'
import Select from '../../components/common/Select/Select'
import Button from '../../components/common/Button/Button'
import SEO from '../../components/common/SEO/SEO'
import { Skeleton } from '../../components/common/Skeleton/Skeleton'
import { Reveal } from '../../components/common/Reveal/Reveal'
import styles from './Contacts.module.css'

const Contacts: React.FC = () => {
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const { items: procedures, lastFetched, loading: proceduresLoading } = useAppSelector((state) => state.procedures)
  const { isSubmitting, success, error } = useAppSelector(
    (state) => state.booking
  )
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    ...CONTACT_INFO,
    mapEmbedUrl: '',
    whatsappPhone: '',
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<BookingFormData>({
    defaultValues: {
      consent: false,
    },
  })
  const selectedProcedureId = useWatch({ control, name: 'procedureId' })
  const desiredDate = useWatch({ control, name: 'desiredDate' })
  const desiredTime = useWatch({ control, name: 'desiredTime' })
  const hpRef = useRef<HTMLInputElement | null>(null)
  const hpName = useMemo(() => `hp_${Math.random().toString(36).slice(2)}`, [])

  const loadProcedures = useCallback(async () => {
    dispatch(setProceduresLoading(true))
    try {
      const data = await fetchProcedures()
      dispatch(setProcedures(data))
    } finally {
      dispatch(setProceduresLoading(false))
    }
  }, [dispatch])

  useEffect(() => {
    const ttlMs = 5 * 60 * 1000
    if (procedures.length === 0 || isStale(lastFetched, ttlMs)) {
      loadProcedures()
    }
  }, [procedures.length, lastFetched, loadProcedures])

  // Автоматически выбираем процедуру из URL параметра
  useEffect(() => {
    const procedureId = searchParams.get('procedureId')
    if (procedureId && procedures.length > 0) {
      // Проверяем, что процедура существует в списке
      const procedureExists = procedures.some((p) => p.id === procedureId)
      if (procedureExists) {
        // Устанавливаем значение с небольшой задержкой, чтобы убедиться, что DOM обновлен
        const timer = setTimeout(() => {
          setValue('procedureId', procedureId, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }, 0)
        return () => clearTimeout(timer)
      }
    }
  }, [searchParams, procedures, setValue])

  useEffect(() => {
    if (success) {
      reset()
      const timer = setTimeout(() => {
        dispatch(resetForm())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, reset, dispatch])

  // Auto-suggest date/time based on working hours (only when fields are empty).
  useEffect(() => {
    const hasDate = Boolean(desiredDate)
    const hasTime = Boolean(desiredTime)
    if (hasDate && hasTime) return
    const { suggestedDate, suggestedTime } = suggestBookingSlot({
      workingHours: contactInfo.workingHours,
      leadMinutes: 90,
      stepMinutes: 15,
    })
    if (!hasDate) setValue('desiredDate', suggestedDate, { shouldDirty: false })
    if (!hasTime) setValue('desiredTime', suggestedTime, { shouldDirty: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactInfo.workingHours])

  const bookingTimeNotice = useMemo(() => {
    const s = suggestBookingSlot({
      workingHours: contactInfo.workingHours,
      leadMinutes: 90,
      stepMinutes: 15,
    })
    return s.notice || ''
  }, [contactInfo.workingHours])

  const timeBounds = useMemo(() => {
    if (!desiredDate) return null
    const d = new Date(`${desiredDate}T00:00:00`)
    const w = getWorkingWindowForDate(contactInfo.workingHours, d)
    if (!w) return null

    const now = new Date()
    const isToday = toISODateLocal(now) === desiredDate
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const minMin = isToday ? Math.max(w.openMin, nowMin + 30) : w.openMin

    // UX rule: latest selectable time is 60 minutes before close
    const maxMin = Math.max(w.openMin, w.closeMin - 60)

    const min = minutesToHHMM(roundUpToStep(minMin, 15))
    const max = minutesToHHMM(roundUpToStep(maxMin, 15))
    return { min, max }
  }, [contactInfo.workingHours, desiredDate])

  // If user changes date after selecting time (or tries to "cheat"), clamp time into allowed range.
  useEffect(() => {
    if (!desiredDate) return
    if (!timeBounds) return
    if (!desiredTime) {
      setValue('desiredTime', timeBounds.max, { shouldDirty: false })
      return
    }
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number)
      if (!Number.isFinite(h) || !Number.isFinite(m)) return null
      return h * 60 + m
    }
    const cur = toMin(desiredTime)
    const min = toMin(timeBounds.min)
    const max = toMin(timeBounds.max)
    if (cur == null || min == null || max == null) return
    if (cur < min) setValue('desiredTime', timeBounds.min, { shouldValidate: true, shouldDirty: true })
    if (cur > max) setValue('desiredTime', timeBounds.max, { shouldValidate: true, shouldDirty: true })
  }, [desiredDate, desiredTime, timeBounds, setValue])

  const timeValidationMessage = useMemo(() => {
    if (!desiredDate || !desiredTime) return ''
    const d = new Date(`${desiredDate}T00:00:00`)
    const w = getWorkingWindowForDate(contactInfo.workingHours, d)
    if (!w) return 'Для выбранной даты часы работы не указаны. Пожалуйста, выберите другое время.'
    const [hh, mm] = desiredTime.split(':').map(Number)
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 'Укажите корректное время.'
    const t = hh * 60 + mm
    if (t < w.openMin || t >= w.closeMin) return 'Мы не работаем в это время — выберите другое.'
    // If today and chosen time already in the past by > 10min, warn
    const now = new Date()
    const isToday = toISODateLocal(now) === desiredDate
    if (isToday) {
      const nowMin = now.getHours() * 60 + now.getMinutes()
      if (t < nowMin + 30) return 'Пожалуйста, выберите время чуть позже (минимум через 30 минут).'
    }
    return ''
  }, [contactInfo.workingHours, desiredDate, desiredTime])

  useEffect(() => {
    let mounted = true
    getContactInfo()
      .then((ci) => {
        if (mounted) setContactInfo(ci)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  const procedureOptions = useMemo(
    () =>
      procedures.map((p) => ({
        value: p.id,
        label: `${p.name} - ${p.price} ₽`,
      })),
    [procedures]
  )

  const selectedProcedureName = useMemo(() => {
    if (!selectedProcedureId) return ''
    const p = procedures.find((x) => x.id === selectedProcedureId)
    return p?.name || ''
  }, [procedures, selectedProcedureId])

  const whatsappHref = useMemo(() => {
    if (contactInfo.whatsappEnabled === false) return null
    const base = 'Здравствуйте! Хочу записаться в A.K.beauty.'
    const text = selectedProcedureName ? `${base} Процедура: "${selectedProcedureName}".` : base
    return buildWhatsAppHref({ whatsappPhone: contactInfo.whatsappPhone, text })
  }, [contactInfo.whatsappEnabled, contactInfo.whatsappPhone, selectedProcedureName])

  const telegramHref = useMemo(() => {
    return buildTelegramHref({ telegramLink: contactInfo.socialMedia.telegram })
  }, [contactInfo.socialMedia.telegram])

  const instagramHref = useMemo(() => {
    return safeHttpUrl(contactInfo.socialMedia.instagram)
  }, [contactInfo.socialMedia.instagram])

  const vkHref = useMemo(() => {
    return safeHttpUrl(contactInfo.socialMedia.vk)
  }, [contactInfo.socialMedia.vk])

  const whatsappSocialHref = useMemo(() => {
    return safeHttpUrl(contactInfo.socialMedia.whatsapp)
  }, [contactInfo.socialMedia.whatsapp])

  const onSubmit = useCallback(
    async (data: BookingFormData) => {
      // Honeypot field: если поле заполнено (бот/автофилл) — НЕ симулируем успех.
      // Иначе пользователь думает, что заявка ушла, хотя мы её отбросили.
      const hp = hpRef.current?.value
      if (hp && hp.trim().length > 0) {
        dispatch(submitBookingFailure('Похоже, сработала защита от спама. Обновите страницу и попробуйте снова.'))
        return
      }

      // Анти-спам (клиентский слой): простая защита от частых отправок
      const now = Date.now()
      const lastSubmitRaw = localStorage.getItem('booking_last_submit_ts')
      const lastSubmitTs = lastSubmitRaw ? Number(lastSubmitRaw) : 0
      if (lastSubmitTs && now - lastSubmitTs < 60_000) {
        dispatch(submitBookingFailure('Пожалуйста, подождите минуту и попробуйте снова.'))
        return
      }

      dispatch(submitBooking())
      try {
        const normalizedPhone = normalizePhone(data.phone)
        if (!normalizedPhone) {
          dispatch(submitBookingFailure('Укажите телефон в формате +7 (XXX) XXX-XX-XX'))
          return
        }

        const procedureId = String((data as any).procedureId ?? '').trim()
        if (!procedureId) {
          dispatch(submitBookingFailure('Выберите процедуру.'))
          return
        }
        const procedure = procedures.find((p) => p.id === procedureId)
        if (!procedure) {
          dispatch(submitBookingFailure('Выбранная процедура не найдена. Обновите страницу и попробуйте снова.'))
          return
        }

        const emailRaw = (data.email ?? '').trim()
        const cleaned: BookingFormData = {
          ...data,
          procedureId,
          phone: normalizedPhone,
          email: emailRaw ? emailRaw : undefined,
        }

        const result = await submitBookingAPI({ ...(cleaned as any), procedureName: procedure.name })
        if (result.success) {
          localStorage.setItem('booking_last_submit_ts', String(now))
          dispatch(submitBookingSuccess())
        } else {
          dispatch(submitBookingFailure(result.message || 'Ошибка отправки'))
        }
      } catch (err) {
        dispatch(
          submitBookingFailure(
            err instanceof Error ? err.message : 'Произошла ошибка'
          )
        )
      }
    },
    [dispatch, procedures]
  )

  const mapEmbedUrl = contactInfo.mapEmbedUrl || ''
  const showProcedureSkeleton = useDelayedFlag(
    proceduresLoading && procedures.length === 0,
    160
  )

  return (
    <>
      <SEO
        title="Контакты и запись"
        description="Свяжитесь с нами или запишитесь на консультацию. Телефон, адрес, форма записи на сеанс."
        keywords="контакты косметолог, запись на процедуру, косметология контакты"
      />
      <div className={styles.contacts}>
        <div className={styles.container}>
          <h1 className={styles.title}>Контакты и запись</h1>

        <div className={styles.content}>
          <div className={styles.infoSection}>
            <Reveal>
              <Card className={styles.infoCard}>
                <h2>Контактная информация</h2>
              <div className={styles.contactItem}>
                <strong>Телефон:</strong>
                <a href={`tel:${contactInfo.phone}`}>
                  {contactInfo.phone}
                </a>
              </div>
              {whatsappHref && (
                <div className={styles.contactItem}>
                  <strong>WhatsApp:</strong>
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    Написать в WhatsApp
                  </a>
                </div>
              )}
              {telegramHref && (
                <div className={styles.contactItem}>
                  <strong>Telegram:</strong>
                  <a href={telegramHref} target="_blank" rel="noopener noreferrer">
                    Написать в Telegram
                  </a>
                </div>
              )}
              <div className={styles.contactItem}>
                <strong>Email:</strong>
                <a href={`mailto:${contactInfo.email}`}>
                  {contactInfo.email}
                </a>
              </div>
              <div className={styles.contactItem}>
                <strong>Адрес:</strong>
                <p>{contactInfo.address}</p>
              </div>
              <div className={styles.contactItem}>
                <strong>Часы работы:</strong>
                <p>{contactInfo.workingHours}</p>
              </div>

              <div className={styles.social}>
                <h3>Социальные сети</h3>
                <div className={styles.socialLinks}>
                  {instagramHref && (
                    <a
                      href={instagramHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Instagram
                    </a>
                  )}
                  {vkHref && (
                    <a
                      href={vkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      VK
                    </a>
                  )}
                  {telegramHref && (
                    <a
                      href={telegramHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Telegram
                    </a>
                  )}
                  {whatsappSocialHref && (
                    <a
                      href={whatsappSocialHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>

              <div className={styles.map}>
                {mapEmbedUrl ? (
                  <iframe
                    title="Карта"
                    src={mapEmbedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    style={{ width: '100%', height: 320, border: 0, borderRadius: 12 }}
                  />
                ) : (
                  <div className={styles.mapPlaceholder}>
                    <p>Карта местоположения</p>
                    <p className={styles.mapNote}>
                      Укажите VITE_MAP_EMBED_URL в .env.local (или заполните ссылку в админке → Контакты), чтобы встроить карту
                    </p>
                  </div>
                )}
              </div>
              </Card>
            </Reveal>
          </div>

          <div className={styles.formSection}>
            <Reveal delayMs={60}>
              <Card className={styles.formCard}>
                <h2>Записаться на сеанс</h2>
              {success && (
                <div className={styles.successMessage}>
                  ✓ Ваша заявка успешно отправлена! Мы свяжемся с вами в
                  ближайшее время.
                  {whatsappHref && (
                    <div style={{ marginTop: 12 }}>
                      <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="small">
                          Написать в WhatsApp сейчас
                        </Button>
                      </a>
                    </div>
                  )}
                  {telegramHref && (
                    <div style={{ marginTop: 12 }}>
                      <a href={telegramHref} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="small">
                          Написать в Telegram сейчас
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              )}
              {error && (
                <div className={styles.errorMessage}>✗ {error}</div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                {/* Honeypot: скрытое поле для ботов */}
                <input
                  ref={hpRef}
                  id={hpName}
                  name={hpName}
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ position: 'absolute', left: '-10000px', top: 'auto' }}
                  aria-hidden="true"
                />

                <Input
                  label="Имя"
                  {...register('name', {
                    required: 'Имя обязательно для заполнения',
                    minLength: {
                      value: 2,
                      message: 'Имя должно содержать минимум 2 символа',
                    },
                  })}
                  error={errors.name?.message}
                />

                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    required: 'Телефон обязателен для заполнения',
                    validate: (value) => validatePhone(String(value || '')) || 'Неверный формат телефона',
                  }}
                  render={({ field }) => (
                    <MaskedPhoneInput
                      label="Телефон"
                      inputMode="tel"
                      autoComplete="tel"
                      value={String(field.value || '')}
                      onChange={(v) => field.onChange(v)}
                      onBlur={field.onBlur}
                      required
                      error={errors.phone?.message}
                    />
                  )}
                />

                <Input
                  label="Email (необязательно)"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  {...register('email', {
                    validate: (value) =>
                      !value || validateEmail(value) || 'Неверный формат email',
                  })}
                  error={errors.email?.message}
                />

                <Controller
                  name="procedureId"
                  control={control}
                  rules={{ required: 'Выберите процедуру' }}
                  render={({ field }) => (
                    showProcedureSkeleton ? (
                      <div style={{ display: 'grid', gap: 6 }}>
                        <label style={{ fontWeight: 600, fontSize: 14 }}>Процедура</label>
                        <Skeleton height={56} radius={12} />
                      </div>
                    ) : (
                      <Select
                        label="Процедура"
                        options={procedureOptions}
                        {...field}
                        error={errors.procedureId?.message}
                      />
                    )
                  )}
                />

                <Input
                  label="Желаемая дата"
                  type="date"
                  {...register('desiredDate', {
                    required: 'Укажите желаемую дату',
                    validate: (value) => {
                      if (!value) return 'Укажите желаемую дату'
                      const today = toISODateLocal(new Date())
                      if (value < today) return 'Нельзя выбрать прошедшую дату'
                      return true
                    },
                  })}
                  error={errors.desiredDate?.message}
                />

                <Input
                  label="Желаемое время"
                  type="time"
                  step={900}
                  min={timeBounds?.min}
                  max={timeBounds?.max}
                  {...register('desiredTime', {
                    required: 'Укажите желаемое время',
                    validate: () => {
                      return timeValidationMessage ? timeValidationMessage : true
                    },
                  })}
                  error={errors.desiredTime?.message || timeValidationMessage || (bookingTimeNotice ? bookingTimeNotice : undefined)}
                />

                <Textarea
                  label="Комментарий"
                  {...register('comment', {
                    maxLength: {
                      value: 2000,
                      message: 'Комментарий не должен превышать 2000 символов',
                    },
                  })}
                  error={errors.comment?.message}
                />

                <div className={styles.checkbox}>
                  <input
                    type="checkbox"
                    id="consent"
                    {...register('consent', {
                      required:
                        'Необходимо согласие на обработку персональных данных',
                    })}
                  />
                  <label htmlFor="consent">
                    Я согласен(а) на обработку персональных данных.{' '}
                    <a
                      href={`${import.meta.env.BASE_URL}privacy`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Политика конфиденциальности
                    </a>
                  </label>
                  {errors.consent && (
                    <span className={styles.errorMessage}>
                      {errors.consent.message}
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  size="large"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                </Button>
              </form>
              </Card>
            </Reveal>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default Contacts

