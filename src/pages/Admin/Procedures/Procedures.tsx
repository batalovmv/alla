import React, { useState, useEffect } from 'react'
import { proceduresService } from '../../../services/firebaseService'
import { Procedure } from '../../../types'
import ProceduresList from './ProceduresList'
import ProcedureForm from './ProcedureForm'
import Button from '../../../components/common/Button/Button'
import { PageFallback } from '../../../components/common/PageFallback/PageFallback'
import styles from './Procedures.module.css'

const Procedures: React.FC = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null)

  useEffect(() => {
    loadProcedures()
  }, [])

  const loadProcedures = async () => {
    try {
      setLoading(true)
      const data = await proceduresService.getAll()
      setProcedures(data)
    } catch (error) {
      console.error('Ошибка загрузки процедур:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingProcedure(null)
    setShowForm(true)
  }

  const handleEdit = (procedure: Procedure) => {
    setEditingProcedure(procedure)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const usage = await proceduresService.getUsageCounts(id)
      const hasLinks = usage.bookings > 0 || usage.reviews > 0 || usage.serviceRecords > 0
      const msg = hasLinks
        ? `Процедура используется:\n- заявок: ${usage.bookings}\n- отзывов: ${usage.reviews}\n- записей услуг: ${usage.serviceRecords}\n\nУдаление НЕ удалит связанные документы каскадом, но часть экранов может потерять “связь” с процедурой.\n\nУдалить всё равно?`
        : 'Вы уверены, что хотите удалить эту процедуру?'
      if (!window.confirm(msg)) return
      if (hasLinks && !window.confirm('Последнее подтверждение: точно удалить процедуру?')) return
      await proceduresService.delete(id)
      await loadProcedures()
    } catch (error) {
      console.error('Ошибка удаления процедуры:', error)
      alert('Ошибка при удалении процедуры')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingProcedure(null)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingProcedure(null)
    loadProcedures()
  }

  if (showForm) {
    return (
      <ProcedureForm
        procedure={editingProcedure}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    )
  }

  return (
    <div className={styles.procedures}>
      <div className={styles.header}>
        <h1 className={styles.title}>Управление процедурами</h1>
        <Button onClick={handleAdd}>+ Добавить процедуру</Button>
      </div>

      {loading ? (
        <PageFallback variant="admin" />
      ) : (
        <ProceduresList
          procedures={procedures}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default Procedures

