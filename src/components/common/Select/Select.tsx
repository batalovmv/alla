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
  showDefaultOption?: boolean // Показывать ли опцию "Выберите..." по умолчанию
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  className = '',
  id,
  name,
  value,
  onChange,
  onBlur,
  showDefaultOption = true,
  ...props
}, ref) => {
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`
  
  // Обработчик onChange: правильно обрабатываем как register, так и Controller
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Controller может передать onChange, который принимает значение напрямую
    // Но для select элемента onChange всегда получает событие
    // Проверяем, является ли onChange функцией, которая принимает событие
    if (onChange) {
      // Если это функция от Controller, она может принимать значение напрямую
      // Но мы всегда передаем событие, так как это стандартное поведение для select
      onChange(e)
    }
  }

  // Обработчик onBlur: вызываем оба обработчика
  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    // Вызываем обработчик от react-hook-form (register или Controller)
    if (onBlur) {
      onBlur(e)
    }
  }

  // Определяем, показывать ли опцию "Выберите..."
  const shouldShowDefaultOption = showDefaultOption && (!value || value === '')

  return (
    <div className={styles.selectWrapper}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      <select
        {...props}
        ref={ref}
        id={selectId}
        name={name}
        value={value ?? ''}
        className={`${styles.select} ${error ? styles.error : ''} ${className}`}
        onChange={handleChange}
        onBlur={handleBlur}
      >
        {shouldShowDefaultOption && (
          <option value="">Выберите...</option>
        )}
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


