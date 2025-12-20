import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import App from './App'
import { store } from './store'
import { auth } from './config/firebase'
import { setAdminState, setUser, setLoading } from './store/slices/authSlice'
import { isAdminByClaims } from './utils/adminClaims'
import './assets/styles/index.css'

// Initialize auth state (only if Firebase is configured)
if (auth) {
  onAuthStateChanged(auth, async (user) => {
    store.dispatch(setUser(user))
    store.dispatch(setAdminState({ adminLoading: true, isAdmin: false }))

    const isAdmin = await isAdminByClaims(user)
    store.dispatch(setAdminState({ adminLoading: false, isAdmin }))
    store.dispatch(setLoading(false))
  })
} else {
  store.dispatch(setLoading(false))
  store.dispatch(setAdminState({ adminLoading: false, isAdmin: false }))
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* Vite sets import.meta.env.BASE_URL from `vite.config.ts` `base` option.
          This is required for correct routing on GitHub Pages (e.g. /alla/...). */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)

