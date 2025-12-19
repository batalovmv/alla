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
  name: propName,
  ...props
}, ref) => {
  // Extract name, onChange, onBlur, and ref from props (they come from register via {...register()})
  // These are in props because they come from react-hook-form's register()
  // We need to extract them BEFORE spreading restProps to ensure they're not lost
  const registerName = (props as any).name
  const registerOnChange = (props as any).onChange
  const registerOnBlur = (props as any).onBlur
  const registerRef = (props as any).ref || ref
  
  // Use name from register if available (this is critical for react-hook-form),
  // otherwise use the name prop or id
  const textareaName = registerName || propName || id || `textarea-${Math.random().toString(36).substr(2, 9)}`
  const textareaId = id || textareaName
  
  // Remove name, onChange, onBlur, ref from restProps to avoid conflicts
  const { name: _, onChange: __, onBlur: ___, ref: ____, ...restProps } = props as any
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Call the handler from register first (this updates react-hook-form state)
    if (registerOnChange) {
      registerOnChange(e)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    // Call the handler from register (this triggers validation)
    if (registerOnBlur) {
      registerOnBlur(e)
    }
  }
  
  return (
    <div className={styles.textareaWrapper}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
          {restProps.required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        {...restProps}
        ref={registerRef}
        id={textareaId}
        name={textareaName}
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


