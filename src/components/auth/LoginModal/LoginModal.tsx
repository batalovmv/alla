import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../../store/hooks'
import { ROUTES } from '../../../config/routes'
import Modal from '../../common/Modal/Modal'
import LoginForm from '../LoginForm/LoginForm'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { user, isAdmin } = useAppSelector((state) => state.auth)

  const handleSuccess = () => {
    onClose()
    navigate(ROUTES.ADMIN)
  }

  // If user is already logged in, close modal and redirect
  React.useEffect(() => {
    if (user && isOpen) {
      if (isAdmin) {
        onClose()
        navigate(ROUTES.ADMIN)
      }
    }
  }, [user, isAdmin, isOpen, onClose, navigate])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Вход в админ-панель">
      <LoginForm onSuccess={handleSuccess} />
    </Modal>
  )
}

export default LoginModal

