import React, { useEffect, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  submitBooking,
  submitBookingSuccess,
  submitBookingFailure,
  resetForm,
} from '../../store/slices/bookingSlice'
import { setProcedures } from '../../store/slices/proceduresSlice'
import { fetchProcedures } from '../../utils/api'
import { submitBooking as submitBookingAPI } from '../../utils/api'
import { CONTACT_INFO } from '../../config/constants'
import { BookingFormData } from '../../types'
import { validatePhone, validateEmail } from '../../utils/validation'
import Card from '../../components/common/Card/Card'
import Input from '../../components/common/Input/Input'
import Textarea from '../../components/common/Textarea/Textarea'
import Select from '../../components/common/Select/Select'
import Button from '../../components/common/Button/Button'
import SEO from '../../components/common/SEO/SEO'
import styles from './Contacts.module.css'

const Contacts: React.FC = () => {
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const { items: procedures } = useAppSelector((state) => state.procedures)
  const { isSubmitting, success, error } = useAppSelector(
    (state) => state.booking
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BookingFormData>({
    defaultValues: {
      consent: false,
    },
  })

  const loadProcedures = useCallback(async () => {
    const data = await fetchProcedures()
    dispatch(setProcedures(data))
  }, [dispatch])

  useEffect(() => {
    if (procedures.length === 0) {
      loadProcedures()
    }
  }, [procedures.length, loadProcedures])

  // Автоматически выбираем процедуру из URL параметра
  useEffect(() => {
    const procedureId = searchParams.get('procedureId')
    if (procedureId && procedures.length > 0) {
      // Проверяем, что процедура существует в списке
      const procedureExists = procedures.some((p) => p.id === procedureId)
      if (procedureExists) {
        // Проверяем текущее значение через watch
        const currentValue = watch('procedureId')
        // Устанавливаем значение только если оно отличается от текущего
        if (currentValue !== procedureId) {
          setValue('procedureId', procedureId, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
      }
    }
  }, [searchParams, procedures, setValue, watch])

  useEffect(() => {
    if (success) {
      reset()
      const timer = setTimeout(() => {
        dispatch(resetForm())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, reset, dispatch])

  const procedureOptions = useMemo(
    () =>
      procedures.map((p) => ({
        value: p.id,
        label: `${p.name} - ${p.price} ₽`,
      })),
    [procedures]
  )

  const onSubmit = useCallback(
    async (data: BookingFormData) => {
      dispatch(submitBooking())
      try {
        const result = await submitBookingAPI(data)
        if (result.success) {
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
                <a href={`tel:${CONTACT_INFO.phone}`}>
                  {CONTACT_INFO.phone}
                </a>
              </div>
              <div className={styles.contactItem}>
                <strong>Email:</strong>
                <a href={`mailto:${CONTACT_INFO.email}`}>
                  {CONTACT_INFO.email}
                </a>
              </div>
              <div className={styles.contactItem}>
                <strong>Адрес:</strong>
                <p>{CONTACT_INFO.address}</p>
              </div>
              <div className={styles.contactItem}>
                <strong>Часы работы:</strong>
                <p>{CONTACT_INFO.workingHours}</p>
              </div>

              <div className={styles.social}>
                <h3>Социальные сети</h3>
                <div className={styles.socialLinks}>
                  {CONTACT_INFO.socialMedia.instagram && (
                    <a
                      href={CONTACT_INFO.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Instagram
                    </a>
                  )}
                  {CONTACT_INFO.socialMedia.vk && (
                    <a
                      href={CONTACT_INFO.socialMedia.vk}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      VK
                    </a>
                  )}
                  {CONTACT_INFO.socialMedia.telegram && (
                    <a
                      href={CONTACT_INFO.socialMedia.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Telegram
                    </a>
                  )}
                  {CONTACT_INFO.socialMedia.whatsapp && (
                    <a
                      href={CONTACT_INFO.socialMedia.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>

              <div className={styles.map}>
                <div className={styles.mapPlaceholder}>
                  <p>Карта местоположения</p>
                  <p className={styles.mapNote}>
                    Здесь будет встроена карта Яндекс.Карт или Google Maps
                  </p>
                </div>
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
                </div>
              )}
              {error && (
                <div className={styles.errorMessage}>✗ {error}</div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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

                <Select
                  label="Процедура"
                  options={procedureOptions}
                  {...register('procedureId', {
                    required: 'Выберите процедуру',
                  })}
                  error={errors.procedureId?.message}
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
                  {...register('comment')}
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
                    Я согласен(а) на обработку персональных данных
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

