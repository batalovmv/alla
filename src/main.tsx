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

// Initialize auth state
onAuthStateChanged(auth, (user) => {
  store.dispatch(setUser(user))
  store.dispatch(setLoading(false))
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)

