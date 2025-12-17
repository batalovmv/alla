import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useAppSelector } from '../../../store/hooks'
import { validatePhone } from '../../../utils/validation'
import Input from '../../common/Input/Input'
import Textarea from '../../common/Textarea/Textarea'
import Select from '../../common/Select/Select'
import Button from '../../common/Button/Button'
import styles from './AddReviewForm.module.css'

interface ReviewFormData {
  clientName: string
  phone: string
  procedureId: string
  rating: number
  text: string
}

interface AddReviewFormProps {
  onSubmit: (data: ReviewFormData) => void
  isSubmitting?: boolean
}

const AddReviewForm: React.FC<AddReviewFormProps> = ({
  onSubmit,
  isSubmitting = false,
}) => {
  const { items: procedures } = useAppSelector((state) => state.procedures)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    defaultValues: {
      rating: 5,
    },
  })

  const procedureOptions = useMemo(
    () =>
      procedures.map((p) => ({
        value: p.id,
        label: p.name,
      })),
    [procedures]
  )

  const handleFormSubmit = (data: ReviewFormData) => {
    onSubmit(data)
    reset()
  }

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.title}>Оставить отзыв</h3>
      <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
        <Input
          label="Ваше имя"
          {...register('clientName', {
            required: 'Имя обязательно для заполнения',
            minLength: {
              value: 2,
              message: 'Имя должно содержать минимум 2 символа',
            },
            maxLength: {
              value: 50,
              message: 'Имя не должно превышать 50 символов',
            },
          })}
          error={errors.clientName?.message}
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

        <Select
          label="Процедура"
          options={procedureOptions}
          {...register('procedureId', {
            required: 'Выберите процедуру',
          })}
          error={errors.procedureId?.message}
        />

        <div className={styles.ratingSection}>
          <label className={styles.ratingLabel}>
            Оценка <span className={styles.required}>*</span>
          </label>
          <div className={styles.ratingStars}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <label key={rating} className={styles.starLabel}>
                <input
                  type="radio"
                  value={rating}
                  {...register('rating', {
                    required: 'Выберите оценку',
                  })}
                  className={styles.starInput}
                />
                <span className={styles.star}>⭐</span>
              </label>
            ))}
          </div>
          {errors.rating && (
            <span className={styles.errorMessage}>
              {errors.rating.message}
            </span>
          )}
        </div>

        <Textarea
          label="Ваш отзыв"
          {...register('text', {
            required: 'Отзыв обязателен для заполнения',
            minLength: {
              value: 10,
              message: 'Отзыв должен содержать минимум 10 символов',
            },
            maxLength: {
              value: 1000,
              message: 'Отзыв не должен превышать 1000 символов',
            },
          })}
          error={errors.text?.message}
          rows={5}
        />

        <Button
          type="submit"
          size="large"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
        </Button>
      </form>
    </div>
  )
}

export default React.memo(AddReviewForm)

