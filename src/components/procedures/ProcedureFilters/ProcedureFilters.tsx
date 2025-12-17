import React from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  setCategoryFilter,
  setSearchFilter,
  setSortFilter,
  clearFilters,
} from '../../../store/slices/proceduresSlice'
import Input from '../../common/Input/Input'
import Select from '../../common/Select/Select'
import Button from '../../common/Button/Button'
import styles from './ProcedureFilters.module.css'

const ProcedureFilters: React.FC = () => {
  const dispatch = useAppDispatch()
  const { categories, filters } = useAppSelector((state) => state.procedures)

  const categoryOptions = categories.map((cat) => ({
    value: cat,
    label: cat,
  }))

  const sortOptions = [
    { value: 'popular', label: 'По популярности' },
    { value: 'price-asc', label: 'По цене: сначала дешевые' },
    { value: 'price-desc', label: 'По цене: сначала дорогие' },
    { value: 'name', label: 'По названию' },
  ]

  return (
    <div className={styles.filters}>
      <div className={styles.search}>
        <Input
          type="text"
          placeholder="Поиск процедур..."
          value={filters.search}
          onChange={(e) => dispatch(setSearchFilter(e.target.value))}
        />
      </div>

      <div className={styles.selects}>
        <Select
          label="Категория"
          options={[{ value: '', label: 'Все категории' }, ...categoryOptions]}
          value={filters.category}
          onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
        />

        <Select
          label="Сортировка"
          options={sortOptions}
          value={filters.sort}
          onChange={(e) =>
            dispatch(
              setSortFilter(
                e.target.value as 'popular' | 'price-asc' | 'price-desc' | 'name'
              )
            )
          }
        />
      </div>

      {(filters.category || filters.search) && (
        <Button
          variant="outline"
          size="small"
          onClick={() => dispatch(clearFilters())}
        >
          Сбросить фильтры
        </Button>
      )}
    </div>
  )
}

export default ProcedureFilters


