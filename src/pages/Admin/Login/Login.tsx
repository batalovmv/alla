import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { setAdminState, setUser, setLoading, setError } from '../../../store/slices/authSlice'
import { auth } from '../../../config/firebase'
import { ROUTES } from '../../../config/routes'
import LoginForm from '../../../components/auth/LoginForm/LoginForm'
import { isAdminByClaims } from '../../../utils/adminClaims'
import Button from '../../../components/common/Button/Button'
import Input from '../../../components/common/Input/Input'
import styles from './Login.module.css'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user, isAdmin, adminLoading, error } = useAppSelector((state) => state.auth)
  const [bootstrapSecret, setBootstrapSecret] = useState('')
  const [bootstrapping, setBootstrapping] = useState(false)

  const canBootstrap = useMemo(() => {
    return Boolean(user) && !adminLoading && !isAdmin
  }, [user, adminLoading, isAdmin])

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
    // If user is logged in but not admin yet, show a small bootstrap tool to grant the first admin claim.
    if (canBootstrap) {
      const onBootstrap = async () => {
        if (!auth) {
          dispatch(setError('Firebase не настроен.'))
          return
        }
        const secret = bootstrapSecret.trim()
        if (!secret) {
          dispatch(setError('Введите ADMIN_GRANT_SECRET.'))
          return
        }

        try {
          setBootstrapping(true)
          dispatch(setError(null))
          const fn = httpsCallable(getFunctions(undefined, 'us-central1'), 'grantAdmin')
          await fn({ bootstrapSecret: secret })
          dispatch(setError('Готово: права выданы. Выйдите и войдите снова, чтобы токен обновился.'))
        } catch (e: any) {
          const msg =
            e?.code === 'functions/permission-denied'
              ? 'Секрет неверный или bootstrap уже отключён.'
              : e?.message || 'Ошибка при выдаче прав. Проверьте секрет и попробуйте снова.'
          dispatch(setError(msg))
        } finally {
          setBootstrapping(false)
        }
      }

      return (
        <div className={styles.loginPage}>
          <div className={styles.container}>
            <div className={styles.panel}>
              <h2 className={styles.heading}>Вход выполнен</h2>
              <p className={styles.subheading}>
                Аккаунт вошёл, но прав администратора пока нет. Если это первый админ — выдайте claim через секрет.
              </p>

              {error && <div className={styles.notice}>{error}</div>}

              <div className={styles.bootstrapBox}>
                <Input
                  label="ADMIN_GRANT_SECRET (одноразовый)"
                  type="password"
                  value={bootstrapSecret}
                  onChange={(e) => setBootstrapSecret(e.target.value)}
                />
                <Button onClick={onBootstrap} disabled={bootstrapping}>
                  {bootstrapping ? 'Выдача прав…' : 'Выдать права администратора'}
                </Button>
              </div>

              <div className={styles.bootstrapActions}>
                <Button variant="secondary" onClick={() => navigate(ROUTES.HOME)}>
                  На сайт
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    // simplest way for user to refresh token is to re-login
                    window.location.reload()
                  }}
                >
                  Обновить
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // If admin already, route guard will redirect; keep blank here.
    return null
  }

  const handleSuccess = () => {
    navigate(ROUTES.ADMIN)
  }

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.panel}>
        <LoginForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  )
}

export default Login

