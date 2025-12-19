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
    if (onChange) {
      // Controller от react-hook-form для нативных элементов принимает событие
      // и автоматически извлекает значение через e.target.value
      // Передаем событие напрямую - Controller сам извлечет значение
      onChange(e)
    }
  }

  // Обработчик onBlur: вызываем обработчик от react-hook-form
  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    if (onBlur) {
      onBlur(e)
    }
  }

  // Определяем, показывать ли опцию "Выберите..."
  // value может быть undefined, null, или пустой строкой
  // Используем value из параметров (который приходит от field через {...field})
  const currentValue = value !== undefined && value !== null ? String(value) : ''
  const shouldShowDefaultOption = showDefaultOption && currentValue === ''
  
  // Исключаем из props свойства, которые мы уже обработали, чтобы избежать конфликтов
  // Важно: эти свойства уже извлечены в параметрах функции, поэтому они не должны быть в props
  const {
    ref: _ref,
    id: _id,
    name: _name,
    value: _value,
    onChange: _onChange,
    onBlur: _onBlur,
    className: _className,
    ...restProps
  } = props

  return (
    <div className={styles.selectWrapper}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      <select
        {...restProps}
        ref={ref}
        id={selectId}
        name={name}
        value={currentValue}
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


