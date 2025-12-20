import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setProcedures, setLoading } from '../../store/slices/proceduresSlice'
import { fetchProcedures } from '../../utils/api'
import { isStale } from '../../utils/cache'
import ProcedureCard from '../../components/procedures/ProcedureCard/ProcedureCard'
import ProcedureFilters from '../../components/procedures/ProcedureFilters/ProcedureFilters'
import SEO from '../../components/common/SEO/SEO'
import { useDelayedFlag } from '../../utils/useDelayedFlag'
import { ProcedureCardSkeleton } from '../../components/common/Skeleton/SkeletonPresets'
import { useInView } from '../../utils/useInView'
import { Reveal } from '../../components/common/Reveal/Reveal'
import styles from './Procedures.module.css'

const Procedures: React.FC = () => {
  const dispatch = useAppDispatch()
  const { items: procedures, filters, lastFetched, loading } = useAppSelector(
    (state) => state.procedures
  )

  useEffect(() => {
    const loadProcedures = async () => {
      dispatch(setLoading(true))
      try {
        const data = await fetchProcedures()
        dispatch(setProcedures(data))
      } finally {
        dispatch(setLoading(false))
      }
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

  const showSkeleton = useDelayedFlag(loading && procedures.length === 0, 160)
  const [visibleCount, setVisibleCount] = useState(9)
  const { ref: sentinelRef, inView: sentinelInView } = useInView<HTMLDivElement>({
    once: false,
    rootMargin: '600px 0px',
  })
  const prevInViewRef = useRef(false)

  useEffect(() => {
    // Reset windowed rendering when filters change to avoid confusing “empty” screens.
    setVisibleCount(9)
  }, [filters.category, filters.search, filters.sort])

  useEffect(() => {
    const prev = prevInViewRef.current
    prevInViewRef.current = sentinelInView
    if (!sentinelInView || prev) return

    setVisibleCount((c) => {
      const next = Math.min(c + 6, filteredProcedures.length)
      return next
    })
  }, [sentinelInView, filteredProcedures.length])

  const visibleProcedures = useMemo(
    () => filteredProcedures.slice(0, visibleCount),
    [filteredProcedures, visibleCount]
  )

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

        {showSkeleton ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <ProcedureCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProcedures.length > 0 ? (
          <div className={styles.grid}>
            {visibleProcedures.map((procedure, i) => (
              <Reveal
                key={procedure.id}
                delayMs={Math.min(i * 28, 180)}
              >
                <ProcedureCard procedure={procedure} />
              </Reveal>
            ))}
            {/* Infinite scroll sentinel */}
            {visibleCount < filteredProcedures.length && (
              <div
                ref={sentinelRef}
                style={{ height: 1, width: '100%', gridColumn: '1 / -1' }}
                aria-hidden="true"
              />
            )}
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

