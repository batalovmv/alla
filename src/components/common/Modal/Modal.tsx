import React, { useEffect } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
              ×
            </button>
          </div>
        )}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal

