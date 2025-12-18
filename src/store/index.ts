import { configureStore } from '@reduxjs/toolkit'
import proceduresReducer from './slices/proceduresSlice'
import bookingReducer from './slices/bookingSlice'
import reviewsReducer from './slices/reviewsSlice'
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    procedures: proceduresReducer,
    booking: bookingReducer,
    reviews: reviewsReducer,
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


