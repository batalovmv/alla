import React, { useEffect, useMemo, useCallback, useState } from 'react'
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
import { validatePhone, validateEmail } from '../../utils/validation'
import { useDelayedFlag } from '../../utils/useDelayedFlag'
import Card from '../../components/common/Card/Card'
import Input from '../../components/common/Input/Input'
import Textarea from '../../components/common/Textarea/Textarea'
import Select from '../../components/common/Select/Select'
import Button from '../../components/common/Button/Button'
import SEO from '../../components/common/SEO/SEO'
import { Skeleton } from '../../components/common/Skeleton/Skeleton'
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
      // Honeypot field: если бот заполнил скрытое поле — имитируем успех без записи в базу
      const hp = (document.getElementById('hp_company') as HTMLInputElement | null)
        ?.value
      if (hp && hp.trim().length > 0) {
        dispatch(submitBookingSuccess())
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
        const result = await submitBookingAPI(data)
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
    [dispatch]
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
          </div>

          <div className={styles.formSection}>
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
                  id="hp_company"
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

                <Input
                  label="Телефон"
                  type="tel"
                  {...register('phone', {
                    required: 'Телефон обязателен для заполнения',
                    validate: (value) =>
                      validatePhone(value) || 'Неверный формат телефона',
                  })}
                  error={errors.phone?.message}
                />

                <Input
                  label="Email"
                  type="email"
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
                  })}
                  error={errors.desiredDate?.message}
                />

                <Input
                  label="Желаемое время"
                  type="time"
                  {...register('desiredTime', {
                    required: 'Укажите желаемое время',
                  })}
                  error={errors.desiredTime?.message}
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
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default Contacts

