import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ReviewsState, Review } from '../../types'

const initialState: ReviewsState = {
  items: [],
  averageRating: 0,
  loading: false,
}

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setReviews: (state, action: PayloadAction<Review[]>) => {
      state.items = action.payload
      // Вычисляем средний рейтинг
      if (action.payload.length > 0) {
        const sum = action.payload.reduce((acc, review) => acc + review.rating, 0)
        state.averageRating = sum / action.payload.length
      } else {
        state.averageRating = 0
      }
    },
    addReview: (state, action: PayloadAction<Review>) => {
      state.items.push(action.payload)
      // Пересчитываем средний рейтинг
      const sum = state.items.reduce((acc, review) => acc + review.rating, 0)
      state.averageRating = sum / state.items.length
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const {
  setReviews,
  addReview,
  setLoading,
} = reviewsSlice.actions

export default reviewsSlice.reducer


