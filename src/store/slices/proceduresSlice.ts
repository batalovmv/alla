import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ProceduresState, Procedure } from '../../types'

const initialState: ProceduresState = {
  items: [],
  categories: [],
  filters: {
    category: '',
    search: '',
    sort: 'popular',
  },
  loading: false,
  error: null,
  lastFetched: undefined,
}

const proceduresSlice = createSlice({
  name: 'procedures',
  initialState,
  reducers: {
    setProcedures: (state, action: PayloadAction<Procedure[]>) => {
      state.items = action.payload
      // Автоматически извлекаем категории из процедур
      const categories = Array.from(
        new Set(action.payload.map((p) => p.category))
      )
      state.categories = categories
      state.lastFetched = Date.now()
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.filters.category = action.payload
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload
    },
    setSortFilter: (
      state,
      action: PayloadAction<'popular' | 'price-asc' | 'price-desc' | 'name'>
    ) => {
      state.filters.sort = action.payload
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        search: '',
        sort: 'popular',
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setProcedures,
  setCategoryFilter,
  setSearchFilter,
  setSortFilter,
  clearFilters,
  setLoading,
  setError,
} = proceduresSlice.actions

export default proceduresSlice.reducer


