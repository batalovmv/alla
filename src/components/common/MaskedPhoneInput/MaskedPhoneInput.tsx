import React from 'react'
import { IMaskInput } from 'react-imask'
import styles from './MaskedPhoneInput.module.css'

export interface MaskedPhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'defaultValue'> {
  label?: string
  error?: string
  value?: string
  onChange?: (value: string) => void
}

export const MaskedPhoneInput = React.forwardRef<HTMLInputElement, MaskedPhoneInputProps>(
  ({ label, error, className = '', id, name, required, value, onChange, ...props }, ref) => {
    const inputId = id || name || `phone-${Math.random().toString(36).slice(2)}`

    return (
      <div className={styles.inputWrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <IMaskInput
          {...props}
          // Visual: +7 (999) 462-10-36
          mask="+{7} (000) 000-00-00"
          lazy={false}
          placeholderChar="_"
          inputRef={ref as any}
          id={inputId}
          name={name}
          value={value}
          className={[styles.input, error ? styles.error : '', className].filter(Boolean).join(' ')}
          // react-hook-form works fine with string values
          onAccept={(val) => {
            onChange?.(String(val || ''))
          }}
        />

        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    )
  }
)

MaskedPhoneInput.displayName = 'MaskedPhoneInput'


