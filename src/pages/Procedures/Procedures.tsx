import React, { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setProcedures } from '../../store/slices/proceduresSlice'
import { fetchProcedures } from '../../utils/api'
import { isStale } from '../../utils/cache'
import ProcedureCard from '../../components/procedures/ProcedureCard/ProcedureCard'
import ProcedureFilters from '../../components/procedures/ProcedureFilters/ProcedureFilters'
import SEO from '../../components/common/SEO/SEO'
import styles from './Procedures.module.css'

const Procedures: React.FC = () => {
  const dispatch = useAppDispatch()
  const { items: procedures, filters, lastFetched } = useAppSelector(
    (state) => state.procedures
  )

  useEffect(() => {
    const loadProcedures = async () => {
      const data = await fetchProcedures()
      dispatch(setProcedures(data))
    }
    const ttlMs = 5 * 60 * 1000
    if (procedures.length === 0 || isStale(lastFetched, ttlMs)) {
      loadProcedures()
    }
  }, [dispatch, procedures.length, lastFetched])

  const filteredProcedures = useMemo(() => {
    let result = [...procedures]

    // Фильтр по категории
    if (filters.category) {
      result = result.filter((p) => p.category === filters.category)
    }

    // Поиск
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      )
    }

    // Сортировка
    switch (filters.sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'popular':
      default:
        result.sort((a, b) => {
          if (a.popular && !b.popular) return -1
          if (!a.popular && b.popular) return 1
          return 0
        })
        break
    }

    return result
  }, [procedures, filters])

  return (
    <>
      <SEO
        title="Процедуры"
        description="Каталог косметологических процедур. Чистка лица, массаж, обертывания, аппаратная косметология и многое другое."
        keywords="косметологические процедуры, чистка лица, массаж лица, обертывания, косметология услуги"
      />
      <div className={styles.procedures}>
        <div className={styles.container}>
          <h1 className={styles.title}>Наши процедуры</h1>
        <p className={styles.subtitle}>
          Выберите процедуру, которая подходит именно вам
        </p>

        <ProcedureFilters />

        {filteredProcedures.length > 0 ? (
          <div className={styles.grid}>
            {filteredProcedures.map((procedure) => (
              <ProcedureCard key={procedure.id} procedure={procedure} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>Процедуры не найдены. Попробуйте изменить фильтры.</p>
          </div>
        )}
        </div>
      </div>
    </>
  )
}

export default Procedures

