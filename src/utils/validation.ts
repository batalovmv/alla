export const validatePhone = (phone: string): boolean => {
  // Российский формат телефона
  const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('8')) {
    return cleaned.replace(/^8/, '+7')
  }
  if (cleaned.startsWith('7')) {
    return `+${cleaned}`
  }
  return `+7${cleaned}`
}


