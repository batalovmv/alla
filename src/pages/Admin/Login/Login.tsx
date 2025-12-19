import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { setUser, setLoading, setError } from '../../../store/slices/authSlice'
import { auth } from '../../../config/firebase'
import { ROUTES } from '../../../config/routes'
import { isAdminUid } from '../../../config/admin'
import LoginForm from '../../../components/auth/LoginForm/LoginForm'
import styles from './Login.module.css'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!auth) {
      dispatch(setError('Firebase не настроен. Пожалуйста, настройте Firebase для работы админ-панели.'))
      dispatch(setLoading(false))
      return
    }

    const unsubscribe = onAuthStateChanged(auth!, (user) => {
      dispatch(setUser(user))
      dispatch(setLoading(false))
      if (user) {
        if (isAdminUid(user.uid)) {
          navigate(ROUTES.ADMIN)
        } else {
          dispatch(
            setError(
              `У этого аккаунта нет прав администратора. UID: ${user.uid}. Добавьте этот UID в allowlist (VITE_ADMIN_UID(S)) и в Firebase Rules.`
            )
          )
          signOut(auth!).catch(() => {})
        }
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

