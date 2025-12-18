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
  ...props
}) => {
  // Extract onChange and onBlur from props (they come from register via {...emailRegister})
  // These are in props because they come from react-hook-form's register()
  const { onChange: propsOnChange, onBlur: propsOnBlur, ...restProps } = props
  
  // Use name from props (from register) if available, otherwise use the name prop or id
  const inputName = restProps.name || name || id || `input-${Math.random().toString(36).substr(2, 9)}`
  const inputId = id || inputName
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Call the handler from register first (this updates react-hook-form state)
    if (propsOnChange) {
      propsOnChange(e)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Call the handler from register (this triggers validation)
    if (propsOnBlur) {
      propsOnBlur(e)
    }
  }
  
  return (
    <div className={styles.inputWrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {restProps.required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        {...restProps}
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


