import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from 'firebase/auth'

interface AuthState {
  user: User | null
  loading: boolean
  adminLoading: boolean
  isAdmin: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loading: false,
  adminLoading: true,
  isAdmin: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setAdminState: (
      state,
      action: PayloadAction<{ adminLoading: boolean; isAdmin: boolean }>
    ) => {
      state.adminLoading = action.payload.adminLoading
      state.isAdmin = action.payload.isAdmin
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.isAdmin = false
      state.adminLoading = false
      state.error = null
    },
  },
})

export const { setUser, setLoading, setAdminState, setError, logout } =
  authSlice.actions
export default authSlice.reducer

