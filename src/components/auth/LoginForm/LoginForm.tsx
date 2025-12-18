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
  } = useForm<LoginFormData>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const onSubmit = async (data: LoginFormData) => {
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


  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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

      <Button type="submit" disabled={isSubmitting} className={styles.submitButton}>
        {isSubmitting ? 'Вход...' : 'Войти'}
      </Button>
    </form>
  )
}

export default LoginForm

