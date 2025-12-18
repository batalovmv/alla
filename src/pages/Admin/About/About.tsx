import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { aboutInfoService, storageService } from '../../../services/firebaseService'
import Input from '../../../components/common/Input/Input'
import Textarea from '../../../components/common/Textarea/Textarea'
import Button from '../../../components/common/Button/Button'
import Card from '../../../components/common/Card/Card'
import styles from './About.module.css'

interface AboutFormData {
  name: string
  photo: string
  education: string
  experience: string
  description: string
  certificates: { value: string }[]
}

const About: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
    reset,
  } = useForm<AboutFormData>({
    defaultValues: {
      name: '',
      photo: '',
      education: '',
      experience: '',
      description: '',
      certificates: [],
    },
  })

  const {
    fields: certificateFields,
    append: appendCertificate,
    remove: removeCertificate,
  } = useFieldArray({
    control,
    name: 'certificates',
  })

  const photo = watch('photo')

  useEffect(() => {
    loadAbout()
  }, [])

  const loadAbout = async () => {
    try {
      setLoading(true)
      const data = await aboutInfoService.get()
      if (data) {
        reset({
          name: data.name || '',
          photo: data.photo || '',
          education: data.education || '',
          experience: data.experience || '',
          description: data.description || '',
          certificates: data.certificates?.map((c: string) => ({ value: c })) || [],
        })
      }
    } catch (error) {
      console.error('Ошибка загрузки информации:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      const url = await storageService.uploadImage(file, `about/${Date.now()}_${file.name}`)
      setValue('photo', url)
    } catch (error) {
      console.error('Ошибка загрузки фото:', error)
      alert('Ошибка при загрузке фото')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const onSubmit = async (data: AboutFormData) => {
    setSubmitting(true)
    setSuccess(false)
    try {
      await aboutInfoService.update({
        name: data.name,
        photo: data.photo,
        education: data.education,
        experience: data.experience,
        description: data.description,
        certificates: data.certificates.map((c) => c.value).filter((v) => v.trim()),
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Ошибка сохранения информации:', error)
      alert('Ошибка при сохранении информации')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>
  }

  return (
    <div className={styles.about}>
      <h1 className={styles.title}>Редактирование "О специалисте"</h1>
      <Card className={styles.card}>
        {success && (
          <div className={styles.successMessage}>
            ✓ Информация успешно сохранена
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label="Имя специалиста"
            {...register('name', { required: 'Имя обязательно' })}
            error={errors.name?.message}
          />

          <div className={styles.field}>
            <label className={styles.label}>Фото специалиста</label>
            {photo && (
              <div className={styles.photoPreview}>
                <img src={photo} alt="Фото специалиста" />
                <button
                  type="button"
                  className={styles.removePhoto}
                  onClick={() => setValue('photo', '')}
                >
                  ×
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
              style={{ marginTop: '0.5rem' }}
            />
            {uploadingPhoto && <p className={styles.hint}>Загрузка...</p>}
          </div>

          <Textarea
            label="Образование"
            rows={3}
            {...register('education', { required: 'Образование обязательно' })}
            error={errors.education?.message}
          />

          <Input
            label="Опыт работы"
            {...register('experience', { required: 'Опыт работы обязателен' })}
            error={errors.experience?.message}
          />

          <Textarea
            label="Описание"
            rows={8}
            {...register('description', { required: 'Описание обязательно' })}
            error={errors.description?.message}
          />

          <div className={styles.field}>
            <label className={styles.label}>Сертификаты (ссылки)</label>
            {certificateFields.map((field, index) => (
              <div key={field.id} className={styles.arrayItem}>
                <Input
                  {...register(`certificates.${index}.value`)}
                  placeholder="URL сертификата"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={() => removeCertificate(index)}
                >
                  Удалить
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="small"
              onClick={() => appendCertificate({ value: '' })}
            >
              + Добавить сертификат
            </Button>
          </div>

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

export default About

