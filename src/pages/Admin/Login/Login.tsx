import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { setUser, setLoading } from '../../../store/slices/authSlice'
import { auth } from '../../../config/firebase'
import { ROUTES } from '../../../config/routes'
import LoginForm from '../../../components/auth/LoginForm/LoginForm'
import styles from './Login.module.css'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(setUser(user))
      dispatch(setLoading(false))
      if (user) {
        navigate(ROUTES.ADMIN)
      }
    })

    return () => unsubscribe()
  }, [dispatch, navigate])

  if (user) {
    return null
  }

  const handleSuccess = () => {
    navigate(ROUTES.ADMIN)
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <LoginForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}

export default Login

