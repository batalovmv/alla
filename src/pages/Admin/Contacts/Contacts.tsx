import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { contactInfoService } from '../../../services/firebaseService'
import { CONTACT_INFO } from '../../../config/constants'
import Input from '../../../components/common/Input/Input'
import Button from '../../../components/common/Button/Button'
import Card from '../../../components/common/Card/Card'
import styles from './Contacts.module.css'

interface ContactFormData {
  phone: string
  email: string
  address: string
  workingHours: string
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
  } = useForm<ContactFormData>()

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const data = await contactInfoService.get()
      if (data) {
        reset({
          phone: data.phone || CONTACT_INFO.phone,
          email: data.email || CONTACT_INFO.email,
          address: data.address || CONTACT_INFO.address,
          workingHours: data.workingHours || CONTACT_INFO.workingHours,
          mapEmbedUrl: data.mapEmbedUrl || '',
          instagram: data.socialMedia?.instagram || CONTACT_INFO.socialMedia.instagram,
          vk: data.socialMedia?.vk || CONTACT_INFO.socialMedia.vk,
          telegram: data.socialMedia?.telegram || CONTACT_INFO.socialMedia.telegram,
          whatsapp: data.socialMedia?.whatsapp || CONTACT_INFO.socialMedia.whatsapp,
        })
      } else {
        reset({
          phone: CONTACT_INFO.phone,
          email: CONTACT_INFO.email,
          address: CONTACT_INFO.address,
          workingHours: CONTACT_INFO.workingHours,
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
      await contactInfoService.update({
        phone: data.phone,
        email: data.email,
        address: data.address,
        workingHours: data.workingHours,
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
    return <div className={styles.loading}>Загрузка...</div>
  }

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

          <Input
            label="Часы работы"
            {...register('workingHours', { required: 'Часы работы обязательны' })}
            error={errors.workingHours?.message}
          />

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

