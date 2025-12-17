import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ReviewsState, Review } from '../../types'

const initialState: ReviewsState = {
  items: [],
  averageRating: 0,
  loading: false,
}

const calculateAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return sum / reviews.length
}

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setReviews: (state, action: PayloadAction<Review[]>) => {
      state.items = action.payload
      state.averageRating = calculateAverageRating(action.payload)
    },
    addReview: (state, action: PayloadAction<Review>) => {
      state.items.push(action.payload)
      state.averageRating = calculateAverageRating(state.items)
    },
    updateReview: (state, action: PayloadAction<{ id: string; updates: Partial<Review> }>) => {
      const index = state.items.findIndex((r) => r.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates }
        state.averageRating = calculateAverageRating(state.items)
      }
    },
    deleteReview: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((r) => r.id !== action.payload)
      state.averageRating = calculateAverageRating(state.items)
    },
    approveReview: (state, action: PayloadAction<string>) => {
      const index = state.items.findIndex((r) => r.id === action.payload)
      if (index !== -1) {
        state.items[index].approved = true
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const {
  setReviews,
  addReview,
  updateReview,
  deleteReview,
  approveReview,
  setLoading,
} = reviewsSlice.actions

export default reviewsSlice.reducer


