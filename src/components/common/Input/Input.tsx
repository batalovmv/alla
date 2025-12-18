import React from 'react'
import styles from './Input.module.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  name,
  onChange,
  onBlur,
  ...props
}) => {
  // Use name from props if provided (from register), otherwise use id or generate
  const inputName = name || id || `input-${Math.random().toString(36).substr(2, 9)}`
  const inputId = id || inputName
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) {
      onBlur(e)
    }
  }
  
  return (
    <div className={styles.inputWrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        {...props}
        id={inputId}
        name={inputName}
        className={`${styles.input} ${error ? styles.error : ''} ${className}`}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  )
}

export default Input


