import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { setUser, setError, setLoading } from '../../../store/slices/authSlice'
import { auth } from '../../../config/firebase'
import Input from '../../common/Input/Input'
import Button from '../../common/Button/Button'
import styles from './LoginForm.module.css'

interface LoginFormData {
  email: string
  password: string
}

interface LoginFormProps {
  onSuccess?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch()
  const { error } = useAppSelector((state) => state.auth)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    mode: 'onChange',
  })

  // Debug logging
  const emailValue = watch('email')
  const passwordValue = watch('password')

  const onSubmit = async (data: LoginFormData) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/aebc2654-a59d-4f02-bd1f-918a50878f95',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:31',message:'Form submit called',data:{email:data.email,passwordLength:data.password?.length,hasEmail:!!data.email,hasPassword:!!data.password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!auth) {
      dispatch(setError('Firebase не настроен. Пожалуйста, настройте Firebase для работы админ-панели.'))
      return
    }

    setIsSubmitting(true)
    dispatch(setError(null))
    dispatch(setLoading(true))

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth!,
        data.email,
        data.password
      )
      dispatch(setUser(userCredential.user))
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      const errorMessage =
        err.code === 'auth/invalid-credential'
          ? 'Неверный email или пароль'
          : err.code === 'auth/too-many-requests'
          ? 'Слишком много попыток. Попробуйте позже'
          : err.code === 'auth/invalid-api-key'
          ? 'Firebase не настроен. Проверьте конфигурацию.'
          : 'Ошибка входа. Попробуйте еще раз'
      dispatch(setError(errorMessage))
    } finally {
      setIsSubmitting(false)
      dispatch(setLoading(false))
    }
  }

  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/aebc2654-a59d-4f02-bd1f-918a50878f95',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:67',message:'Form render',data:{emailValue,passwordValue,errors:Object.keys(errors),errorCount:Object.keys(errors).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  }, [emailValue, passwordValue, errors]);
  // #endregion

  const emailRegister = register('email', {
    required: 'Email обязателен',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Неверный формат email',
    },
  })

  const passwordRegister = register('password', {
    required: 'Пароль обязателен',
    minLength: {
      value: 6,
      message: 'Пароль должен содержать минимум 6 символов',
    },
  })

  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/aebc2654-a59d-4f02-bd1f-918a50878f95',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginForm.tsx:85',message:'Register objects',data:{emailRegisterName:emailRegister.name,emailRegisterOnChange:!!emailRegister.onChange,passwordRegisterName:passwordRegister.name,passwordRegisterOnChange:!!passwordRegister.onChange},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  }, []);
  // #endregion

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h2 className={styles.title}>Вход в админ-панель</h2>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <Input
        label="Email"
        type="email"
        id="email"
        {...emailRegister}
        error={errors.email?.message}
      />

      <Input
        label="Пароль"
        type="password"
        id="password"
        {...passwordRegister}
        error={errors.password?.message}
      />
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
          Email: {emailValue || '(пусто)'} | Пароль: {passwordValue ? '***' : '(пусто)'}
          <br />
          Errors: {JSON.stringify(errors)}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className={styles.submitButton}>
        {isSubmitting ? 'Вход...' : 'Войти'}
      </Button>
    </form>
  )
}

export default LoginForm

