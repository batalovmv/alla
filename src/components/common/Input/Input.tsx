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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/aebc2654-a59d-4f02-bd1f-918a50878f95',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Input.tsx:handleChange',message:'Input onChange',data:{name:inputName,value:e.target.value,valueLength:e.target.value.length,hasOnChange:!!onChange},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    if (onChange) {
      onChange(e)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/aebc2654-a59d-4f02-bd1f-918a50878f95',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Input.tsx:handleBlur',message:'Input onBlur',data:{name:inputName,value:e.target.value,hasOnBlur:!!onBlur},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
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
        id={inputId}
        name={inputName}
        className={`${styles.input} ${error ? styles.error : ''} ${className}`}
        {...props}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  )
}

export default Input


