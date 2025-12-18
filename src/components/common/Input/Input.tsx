import React from 'react'
import styles from './Input.module.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  className = '',
  id,
  name: propName,
  ...props
}, ref) => {
  // Extract name, onChange, onBlur, and ref from props (they come from register via {...emailRegister})
  // These are in props because they come from react-hook-form's register()
  // We need to extract them BEFORE spreading restProps to ensure they're not lost
  const registerName = (props as any).name
  const registerOnChange = (props as any).onChange
  const registerOnBlur = (props as any).onBlur
  const registerRef = (props as any).ref || ref
  
  // Use name from register if available (this is critical for react-hook-form),
  // otherwise use the name prop or id
  const inputName = registerName || propName || id || `input-${Math.random().toString(36).substr(2, 9)}`
  const inputId = id || inputName
  
  // Remove name, onChange, onBlur, ref from restProps to avoid conflicts
  const { name: _, onChange: __, onBlur: ___, ref: ____, ...restProps } = props as any
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Call the handler from register first (this updates react-hook-form state)
    if (registerOnChange) {
      registerOnChange(e)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Call the handler from register (this triggers validation)
    if (registerOnBlur) {
      registerOnBlur(e)
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
        ref={registerRef}
        id={inputId}
        name={inputName}
        className={`${styles.input} ${error ? styles.error : ''} ${className}`}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  )
})

Input.displayName = 'Input'

export default Input


