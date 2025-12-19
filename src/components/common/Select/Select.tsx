import React from 'react'
import styles from './Select.module.css'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  className = '',
  id,
  name: propName,
  value: propValue,
  ...props
}, ref) => {
  // Extract name, onChange, onBlur, value, and ref from props (they come from register via {...register('procedureId')})
  // These are in props because they come from react-hook-form's register()
  // We need to extract them BEFORE spreading restProps to ensure they're not lost
  const registerName = (props as any).name
  const registerOnChange = (props as any).onChange
  const registerOnBlur = (props as any).onBlur
  const registerValue = (props as any).value
  const registerRef = (props as any).ref || ref

  // Use value from register if available, otherwise use prop value
  const selectValue = registerValue !== undefined ? registerValue : (propValue !== undefined ? propValue : '')

  // Use name from register if available (this is critical for react-hook-form),
  // otherwise use the name prop or id
  const selectName = registerName || propName || id || `select-${Math.random().toString(36).substr(2, 9)}`
  const selectId = id || selectName

  // Remove name, onChange, onBlur, value, ref from restProps to avoid conflicts
  const { name: _, onChange: __, onBlur: ___, value: ____, ref: _____, ...restProps } = props as any

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Call the handler from register first (this updates react-hook-form state)
    if (registerOnChange) {
      registerOnChange(e)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    // Call the handler from register (this triggers validation)
    if (registerOnBlur) {
      registerOnBlur(e)
    }
  }

  return (
    <div className={styles.selectWrapper}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {restProps.required && <span className={styles.required}>*</span>}
        </label>
      )}
      <select
        {...restProps}
        ref={registerRef}
        id={selectId}
        name={selectName}
        value={selectValue}
        className={`${styles.select} ${error ? styles.error : ''} ${className}`}
        onChange={handleChange}
        onBlur={handleBlur}
      >
        <option value="">Выберите...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  )
})

Select.displayName = 'Select'

export default Select


