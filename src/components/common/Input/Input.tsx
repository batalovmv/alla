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
  // #region agent log
  React.useEffect(() => {
    if (props.value !== undefined || props.defaultValue !== undefined) {
      fetch('http://127.0.0.1:7243/ingest/aebc2654-a59d-4f02-bd1f-918a50878f95',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Input.tsx:15',message:'Input render',data:{id,name,hasValue:props.value!==undefined,hasDefaultValue:props.defaultValue!==undefined,hasOnChange:!!props.onChange,hasOnBlur:!!props.onBlur,value:props.value,type:props.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    }
  }, [props.value, props.defaultValue, props.onChange, props.onBlur]);
  // #endregion

  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`
  
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
        name={name || inputId}
        className={`${styles.input} ${error ? styles.error : ''} ${className}`}
        {...props}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  )
}

export default Input


