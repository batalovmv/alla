import React from 'react'
import styles from './Textarea.module.css'

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  className = '',
  id,
  name,
  onChange,
  onBlur,
  ...props
}, ref) => {
  const textareaId = id || name || `textarea-${Math.random().toString(36).substr(2, 9)}`
  
  // Обработчик onChange: вызываем обработчик от react-hook-form
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e)
    }
  }

  // Обработчик onBlur: вызываем обработчик от react-hook-form
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (onBlur) {
      onBlur(e)
    }
  }
  
  return (
    <div className={styles.textareaWrapper}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        {...props}
        ref={ref}
        id={textareaId}
        name={name}
        className={`${styles.textarea} ${error ? styles.error : ''} ${className}`}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea


