import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Procedure } from '../../../types'
import { proceduresService } from '../../../services/firebaseService'
import Input from '../../../components/common/Input/Input'
import Textarea from '../../../components/common/Textarea/Textarea'
import Button from '../../../components/common/Button/Button'
import ImageUpload from '../../../components/admin/ImageUpload/ImageUpload'
import Card from '../../../components/common/Card/Card'
import styles from './ProcedureForm.module.css'

interface ProcedureFormProps {
  procedure: Procedure | null
  onClose: () => void
  onSuccess: () => void
}

interface ProcedureFormData {
  name: string
  category: string
  description: string
  fullDescription: string
  price: number
  duration: number
  images: string[]
  indications: { value: string }[]
  contraindications: { value: string }[]
  popular: boolean
}

const ProcedureForm: React.FC<ProcedureFormProps> = ({
  procedure,
  onClose,
  onSuccess,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm<ProcedureFormData>({
    defaultValues: {
      name: procedure?.name || '',
      category: procedure?.category || '',
      description: procedure?.description || '',
      fullDescription: procedure?.fullDescription || '',
      price: procedure?.price || 0,
      duration: procedure?.duration || 60,
      images: procedure?.images || [],
      indications: procedure?.indications?.map((i) => ({ value: i })) || [{ value: '' }],
      contraindications: procedure?.contraindications?.map((c) => ({ value: c })) || [{ value: '' }],
      popular: procedure?.popular || false,
    },
  })

  const {
    fields: indicationFields,
    append: appendIndication,
    remove: removeIndication,
  } = useFieldArray({
    control,
    name: 'indications',
  })

  const {
    fields: contraindicationFields,
    append: appendContraindication,
    remove: removeContraindication,
  } = useFieldArray({
    control,
    name: 'contraindications',
  })

  const images = watch('images')

  const onSubmit = async (data: ProcedureFormData) => {
    setSubmitting(true)
    try {
      const procedureData: Omit<Procedure, 'id'> = {
        name: data.name,
        category: data.category,
        description: data.description,
        fullDescription: data.fullDescription,
        price: Number(data.price),
        duration: Number(data.duration),
        images: data.images,
        indications: data.indications.map((i) => i.value).filter((v) => v.trim()),
        contraindications: data.contraindications.map((c) => c.value).filter((v) => v.trim()),
        popular: data.popular,
      }

      if (procedure) {
        await proceduresService.update(procedure.id, procedureData)
      } else {
        await proceduresService.create(procedureData)
      }

      onSuccess()
    } catch (error) {
      console.error('Ошибка сохранения процедуры:', error)
      alert('Ошибка при сохранении процедуры')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.formContainer}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <h2>{procedure ? 'Редактировать процедуру' : 'Добавить процедуру'}</h2>
          <Button variant="secondary" onClick={onClose}>
            ×
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label="Название"
            {...register('name', { required: 'Название обязательно' })}
            error={errors.name?.message}
          />

          <Input
            label="Категория"
            {...register('category', { required: 'Категория обязательна' })}
            error={errors.category?.message}
          />

          <Textarea
            label="Краткое описание"
            rows={3}
            {...register('description', { required: 'Описание обязательно' })}
            error={errors.description?.message}
          />

          <Textarea
            label="Полное описание"
            rows={5}
            {...register('fullDescription', { required: 'Полное описание обязательно' })}
            error={errors.fullDescription?.message}
          />

          <div className={styles.row}>
            <Input
              label="Цена (₽)"
              type="number"
              {...register('price', {
                required: 'Цена обязательна',
                min: { value: 0, message: 'Цена должна быть положительной' },
                valueAsNumber: true,
              })}
              error={errors.price?.message}
            />

            <Input
              label="Длительность (минуты)"
              type="number"
              {...register('duration', {
                required: 'Длительность обязательна',
                min: { value: 1, message: 'Минимум 1 минута' },
                valueAsNumber: true,
              })}
              error={errors.duration?.message}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Изображения</label>
            <ImageUpload
              value={images}
              onChange={(urls) => setValue('images', urls)}
              maxImages={5}
              folder="procedures"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Показания</label>
            {indicationFields.map((field, index) => (
              <div key={field.id} className={styles.arrayItem}>
                <Input
                  {...register(`indications.${index}.value`)}
                  placeholder="Показание"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={() => removeIndication(index)}
                >
                  Удалить
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={() => appendIndication({ value: '' })}
            >
              + Добавить показание
            </Button>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Противопоказания</label>
            {contraindicationFields.map((field, index) => (
              <div key={field.id} className={styles.arrayItem}>
                <Input
                  {...register(`contraindications.${index}.value`)}
                  placeholder="Противопоказание"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={() => removeContraindication(index)}
                >
                  Удалить
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={() => appendContraindication({ value: '' })}
            >
              + Добавить противопоказание
            </Button>
          </div>

          <div className={styles.checkbox}>
            <input
              type="checkbox"
              id="popular"
              {...register('popular')}
            />
            <label htmlFor="popular">Популярная процедура</label>
          </div>

          <div className={styles.actions}>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default ProcedureForm

