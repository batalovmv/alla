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
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    loadProcedures()
  }, [])

  const loadProcedures = async () => {
    try {
      setLoading(true)
      const data = await proceduresService.getAll({ includeArchived: true })
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

  const handleArchive = async (id: string) => {
    try {
      const usage = await proceduresService.getUsageCounts(id)
      const hasLinks = usage.bookings > 0 || usage.reviews > 0 || usage.serviceRecords > 0
      const msg = hasLinks
        ? `Процедура используется:\n- заявок: ${usage.bookings}\n- отзывов: ${usage.reviews}\n- записей услуг: ${usage.serviceRecords}\n\nРекомендуем архивировать, чтобы не терять историю.\n\nАрхивировать процедуру?`
        : 'Архивировать процедуру? (она пропадёт с сайта и из списка выбора)'
      if (!window.confirm(msg)) return
      await proceduresService.archive(id)
      await loadProcedures()
    } catch (error) {
      console.error('Ошибка архивирования процедуры:', error)
      alert('Ошибка при архивировании процедуры')
    }
  }

  const handleRestore = async (id: string) => {
    if (!window.confirm('Восстановить процедуру из архива?')) return
    try {
      await proceduresService.restore(id)
      await loadProcedures()
    } catch (error) {
      console.error('Ошибка восстановления процедуры:', error)
      alert('Ошибка при восстановлении процедуры')
    }
  }

  const handleHardDelete = async (id: string) => {
    try {
      const usage = await proceduresService.getUsageCounts(id)
      const hasLinks = usage.bookings > 0 || usage.reviews > 0 || usage.serviceRecords > 0
      const msg = hasLinks
        ? `ВНИМАНИЕ: процедура используется:\n- заявок: ${usage.bookings}\n- отзывов: ${usage.reviews}\n- записей услуг: ${usage.serviceRecords}\n\nПолное удаление может ухудшить читаемость истории/отчётов.\n\nУдалить навсегда?`
        : 'Удалить процедуру НАВСЕГДА?'
      if (!window.confirm(msg)) return
      if (!window.confirm('Последнее подтверждение: удалить навсегда?')) return
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

  const visibleProcedures = procedures.filter((p) => (showArchived ? p.archived === true : p.archived !== true))

  return (
    <div className={styles.procedures}>
      <div className={styles.header}>
        <h1 className={styles.title}>Управление процедурами</h1>
        <Button onClick={handleAdd}>+ Добавить процедуру</Button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant={showArchived ? 'outline' : 'secondary'}
          onClick={() => setShowArchived(false)}
        >
          Активные
        </Button>
        <Button
          size="small"
          variant={showArchived ? 'secondary' : 'outline'}
          onClick={() => setShowArchived(true)}
        >
          Архив
        </Button>
      </div>

      {loading ? (
        <PageFallback variant="admin" />
      ) : (
        <ProceduresList
          procedures={visibleProcedures}
          onEdit={handleEdit}
          onDelete={handleArchive}
          onRestore={handleRestore}
          onHardDelete={handleHardDelete}
          showArchived={showArchived}
        />
      )}
    </div>
  )
}

export default Procedures

