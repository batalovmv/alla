import React, { useState, useEffect } from 'react'
import { proceduresService } from '../../../services/firebaseService'
import { Procedure } from '../../../types'
import ProceduresList from './ProceduresList'
import ProcedureForm from './ProcedureForm'
import Button from '../../../components/common/Button/Button'
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
    if (window.confirm('Вы уверены, что хотите удалить эту процедуру?')) {
      try {
        await proceduresService.delete(id)
        await loadProcedures()
      } catch (error) {
        console.error('Ошибка удаления процедуры:', error)
        alert('Ошибка при удалении процедуры')
      }
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
        <div className={styles.loading}>Загрузка...</div>
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

