import React from 'react'
import { Procedure } from '../../../types'
import Card from '../../../components/common/Card/Card'
import Button from '../../../components/common/Button/Button'
import { formatKzt } from '../../../utils/money'
import styles from './ProceduresList.module.css'

interface ProceduresListProps {
  procedures: Procedure[]
  onEdit: (procedure: Procedure) => void
  onDelete: (id: string) => void
}

const ProceduresList: React.FC<ProceduresListProps> = ({
  procedures,
  onEdit,
  onDelete,
}) => {
  if (procedures.length === 0) {
    return (
      <Card className={styles.empty}>
        <p>Процедур пока нет. Добавьте первую процедуру.</p>
      </Card>
    )
  }

  return (
    <div className={styles.list}>
      {procedures.map((procedure) => (
        <Card key={procedure.id} className={styles.item}>
          <div className={styles.content}>
            {procedure.images && procedure.images.length > 0 && (
              <img
                src={procedure.images[0]}
                alt={procedure.name}
                className={styles.image}
              />
            )}
            <div className={styles.info}>
              <h3 className={styles.name}>{procedure.name}</h3>
              <p className={styles.category}>{procedure.category}</p>
              <p className={styles.price}>{formatKzt(procedure.price)}</p>
              {procedure.popular && (
                <span className={styles.badge}>Популярная</span>
              )}
            </div>
          </div>
          <div className={styles.actions}>
            <Button size="small" onClick={() => onEdit(procedure)}>
              Редактировать
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => onDelete(procedure.id)}
            >
              Удалить
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default ProceduresList

