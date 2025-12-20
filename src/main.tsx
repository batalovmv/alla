import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import App from './App'
import { store } from './store'
import { auth } from './config/firebase'
import { setUser, setLoading } from './store/slices/authSlice'
import './assets/styles/index.css'

// Initialize auth state (only if Firebase is configured)
if (auth) {
  onAuthStateChanged(auth, (user) => {
    store.dispatch(setUser(user))
    store.dispatch(setLoading(false))
  })
} else {
  store.dispatch(setLoading(false))
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

