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
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`
  
  // #region agent log
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    fetch('http://127.0.0.1:7243/ingest/aebc2654-a59d-4f02-bd1f-918a50878f95',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Input.tsx:handleChange',message:'Input onChange',data:{id:inputId,name:name||inputId,value:e.target.value,valueLength:e.target.value.length,hasOnChange:!!onChange},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
    if (onChange) {
      onChange(e)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    fetch('http://127.0.0.1:7243/ingest/aebc2654-a59d-4f02-bd1f-918a50878f95',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Input.tsx:handleBlur',message:'Input onBlur',data:{id:inputId,name:name||inputId,value:e.target.value,hasOnBlur:!!onBlur},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
    if (onBlur) {
      onBlur(e)
    }
  }

  React.useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/aebc2654-a59d-4f02-bd1f-918a50878f95',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Input.tsx:render',message:'Input render',data:{id:inputId,name:name||inputId,hasOnChange:!!onChange,hasOnBlur:!!onBlur,hasError:!!error,errorMessage:error,type:props.type,value:props.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
  }, [inputId, name, onChange, onBlur, error, props.value, props.type]);
  // #endregion
  
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
        name={name || inputId}
        className={`${styles.input} ${error ? styles.error : ''} ${className}`}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  )
}

export default Input


