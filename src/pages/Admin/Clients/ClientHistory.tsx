import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { clientsService, serviceRecordsService, proceduresService } from '../../../services/firebaseService'
import { Client, ServiceRecord, Procedure } from '../../../types'
import { ROUTES } from '../../../config/routes'
import Card from '../../../components/common/Card/Card'
import Button from '../../../components/common/Button/Button'
import Input from '../../../components/common/Input/Input'
import Textarea from '../../../components/common/Textarea/Textarea'
import Select from '../../../components/common/Select/Select'
import { PageFallback } from '../../../components/common/PageFallback/PageFallback'
import styles from './ClientHistory.module.css'

interface ServiceRecordFormData {
  procedureId: string
  date: string
  price?: string
  notes?: string
}

const ClientHistory: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const [client, setClient] = useState<Client | null>(null)
  const [records, setRecords] = useState<ServiceRecord[]>([])
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ServiceRecordFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  })

  useEffect(() => {
    if (clientId) {
      loadData()
    }
  }, [clientId])

  const loadData = async () => {
    try {
      setLoading(true)
      if (clientId) {
        const [clientData, recordsData, proceduresData] = await Promise.all([
          clientsService.get(clientId),
          serviceRecordsService.getByClientId(clientId),
          proceduresService.getAll(),
        ])
        setClient(clientData as Client)
        setRecords(recordsData as ServiceRecord[])
        setProcedures(proceduresData as Procedure[])
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ServiceRecordFormData) => {
    if (!client) return

    try {
      const procedure = procedures.find((p) => p.id === data.procedureId)
      if (!procedure) {
        alert('Процедура не найдена')
        return
      }

      const serviceDate = new Date(data.date)
      await serviceRecordsService.create({
        clientId: client.id,
        clientPhone: client.phone,
        clientName: client.name,
        procedureId: procedure.id,
        procedureName: procedure.name,
        date: serviceDate,
        // Фиксируем цену в записи услуги (для отчётов), если админ не указал вручную — берём текущую цену процедуры
        price: data.price ? parseFloat(data.price) : procedure.price,
        notes: data.notes || undefined,
      })

      // Обновляем статистику клиента
      const newTotalVisits = (client.totalVisits || 0) + 1
      await clientsService.update(client.id, {
        totalVisits: newTotalVisits,
        lastVisit: serviceDate,
      })

      reset()
      setShowForm(false)
      await loadData()
    } catch (error) {
      console.error('Ошибка создания записи:', error)
      alert('Ошибка при создании записи')
    }
  }

  const handleDelete = async (recordId: string) => {
    if (!confirm('Удалить эту запись?')) return

    try {
      await serviceRecordsService.delete(recordId)
      if (client) {
        // Обновляем статистику клиента
        const newTotalVisits = Math.max((client.totalVisits || 0) - 1, 0)
        await clientsService.update(client.id, {
          totalVisits: newTotalVisits,
        })
      }
      await loadData()
    } catch (error) {
      console.error('Ошибка удаления записи:', error)
      alert('Ошибка при удалении записи')
    }
  }

  const procedureOptions = procedures.map((p) => ({
    value: p.id,
    label: `${p.name} - ${p.price} ₽`,
  }))

  const totalAmount = records.reduce((sum, record) => sum + (record.price || 0), 0)

  if (loading) {
    return <PageFallback variant="admin" />
  }

  if (!client) {
    return (
      <div className={styles.error}>
        <p>Клиент не найден</p>
        <Button onClick={() => navigate(ROUTES.ADMIN_CLIENTS)}>Вернуться к списку</Button>
      </div>
    )
  }

  return (
    <div className={styles.history}>
      <div className={styles.header}>
        <div>
          <Button variant="outline" onClick={() => navigate(ROUTES.ADMIN_CLIENTS)}>
            ← Назад к списку
          </Button>
          <h1 className={styles.title}>История клиента: {client.name}</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Отменить' : 'Добавить процедуру'}
        </Button>
      </div>

      <Card className={styles.clientInfo}>
        <div className={styles.infoGrid}>
          <div>
            <span className={styles.label}>Телефон:</span>
            <a href={`tel:${client.phone}`}>{client.phone}</a>
          </div>
          {client.email && (
            <div>
              <span className={styles.label}>Email:</span>
              <a href={`mailto:${client.email}`}>{client.email}</a>
            </div>
          )}
          <div>
            <span className={styles.label}>Всего визитов:</span>
            <span>{client.totalVisits || 0}</span>
          </div>
          {client.lastVisit && (
            <div>
              <span className={styles.label}>Последний визит:</span>
              <span>{new Date(client.lastVisit).toLocaleDateString('ru-RU')}</span>
            </div>
          )}
          {totalAmount > 0 && (
            <div>
              <span className={styles.label}>Общая сумма:</span>
              <span>{totalAmount.toLocaleString('ru-RU')} ₽</span>
            </div>
          )}
        </div>
      </Card>

      {showForm && (
        <Card className={styles.formCard}>
          <h2>Добавить оказанную процедуру</h2>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <Controller
              name="procedureId"
              control={control}
              rules={{ required: 'Выберите процедуру' }}
              render={({ field }) => (
                <Select
                  label="Процедура"
                  options={procedureOptions}
                  {...field}
                  error={errors.procedureId?.message}
                  showDefaultOption={true}
                />
              )}
            />

            <Input
              label="Дата оказания услуги"
              type="date"
              {...register('date', {
                required: 'Укажите дату',
              })}
              error={errors.date?.message}
            />

            <Input
              label="Цена (опционально)"
              type="number"
              step="0.01"
              {...register('price')}
              error={errors.price?.message}
            />

            <Textarea
              label="Заметки"
              {...register('notes')}
              error={errors.notes?.message}
              rows={3}
            />

            <div className={styles.formActions}>
              <Button type="submit">Добавить</Button>
              <Button type="button" variant="outline" onClick={() => {
                reset()
                setShowForm(false)
              }}>
                Отменить
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className={styles.records}>
        <h2>История процедур</h2>
        {records.length === 0 ? (
          <Card className={styles.empty}>
            <p>Записей пока нет</p>
          </Card>
        ) : (
          <div className={styles.recordsList}>
            {records.map((record) => (
              <Card key={record.id} className={styles.recordCard}>
                <div className={styles.recordHeader}>
                  <div>
                    <h3>{record.procedureName}</h3>
                    <p className={styles.recordDate}>
                      {new Date(record.date).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {record.price && (
                    <div className={styles.recordPrice}>
                      {record.price.toLocaleString('ru-RU')} ₽
                    </div>
                  )}
                </div>
                {record.notes && (
                  <div className={styles.recordNotes}>
                    <strong>Заметки:</strong> {record.notes}
                  </div>
                )}
                <div className={styles.recordActions}>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleDelete(record.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientHistory

