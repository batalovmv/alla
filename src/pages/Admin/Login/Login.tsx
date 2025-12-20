import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { setAdminState, setUser, setLoading, setError } from '../../../store/slices/authSlice'
import { auth } from '../../../config/firebase'
import { ROUTES } from '../../../config/routes'
import LoginForm from '../../../components/auth/LoginForm/LoginForm'
import { isAdminByClaims } from '../../../utils/adminClaims'
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
        dispatch(setAdminState({ adminLoading: true, isAdmin: false }))
        isAdminByClaims(user).then((ok) => {
          dispatch(setAdminState({ adminLoading: false, isAdmin: ok }))
          if (ok) {
            navigate(ROUTES.ADMIN)
          } else {
            // Important: do NOT auto sign-out here.
            // We may need the user to stay signed in to run the one-time bootstrap
            // grantAdmin call and receive the admin claim.
            dispatch(setError('У этого аккаунта нет прав администратора.'))
          }
        })
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

