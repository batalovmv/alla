import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BookingState, BookingFormData } from '../../types'

const initialState: BookingState = {
  formData: {},
  isSubmitting: false,
  success: false,
  error: null,
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<Partial<BookingFormData>>) => {
      state.formData = { ...state.formData, ...action.payload }
    },
    resetForm: (state) => {
      state.formData = {}
      state.success = false
      state.error = null
    },
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload
    },
    setSuccess: (state, action: PayloadAction<boolean>) => {
      state.success = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    submitBooking: (state) => {
      state.isSubmitting = true
      state.error = null
    },
    submitBookingSuccess: (state) => {
      state.isSubmitting = false
      state.success = true
      state.formData = {}
    },
    submitBookingFailure: (state, action: PayloadAction<string>) => {
      state.isSubmitting = false
      state.error = action.payload
    },
  },
})

export const {
  setFormData,
  resetForm,
  setSubmitting,
  setSuccess,
  setError,
  submitBooking,
  submitBookingSuccess,
  submitBookingFailure,
} = bookingSlice.actions

export default bookingSlice.reducer


