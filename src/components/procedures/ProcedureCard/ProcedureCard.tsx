import React from 'react'
import { Link } from 'react-router-dom'
import { Procedure } from '../../../types'
import { ROUTES } from '../../../config/routes'
import Card from '../../common/Card/Card'
import Button from '../../common/Button/Button'
import styles from './ProcedureCard.module.css'

interface ProcedureCardProps {
  procedure: Procedure
}

const ProcedureCard: React.FC<ProcedureCardProps> = ({ procedure }) => {
  return (
    <Card className={styles.card}>
      <div className={styles.imageContainer}>
        <img
          src={procedure.images[0] || '/images/placeholder.jpg'}
          alt={procedure.name}
          className={styles.image}
        />
        {procedure.popular && (
          <span className={styles.badge}>Популярно</span>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{procedure.name}</h3>
        <p className={styles.description}>{procedure.description}</p>
        <div className={styles.info}>
          <span className={styles.price}>{procedure.price} ₽</span>
          <span className={styles.duration}>{procedure.duration} мин</span>
        </div>
        <div className={styles.actions}>
          <Link to={ROUTES.PROCEDURE_DETAIL(procedure.id)}>
            <Button variant="outline" size="small">
              Подробнее
            </Button>
          </Link>
          <Link to={ROUTES.CONTACTS}>
            <Button size="small">Записаться</Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

export default ProcedureCard


