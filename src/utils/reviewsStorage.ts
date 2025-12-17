import { Review } from '../types'

const STORAGE_KEY = 'cosmetology_reviews'
const STORAGE_VERSION = '1.0'

interface StoredReviews {
  version: string
  reviews: Review[]
  lastUpdated: string
}

/**
 * Загружает отзывы из localStorage
 */
export const loadReviewsFromStorage = (): Review[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }

    const data: StoredReviews = JSON.parse(stored)
    
    // Проверка версии для миграций в будущем
    if (data.version !== STORAGE_VERSION) {
      // Можно добавить логику миграции
      return data.reviews || []
    }

    return data.reviews || []
  } catch (error) {
    console.error('Ошибка загрузки отзывов из localStorage:', error)
    return []
  }
}

/**
 * Сохраняет отзывы в localStorage
 */
export const saveReviewsToStorage = (reviews: Review[]): boolean => {
  try {
    const data: StoredReviews = {
      version: STORAGE_VERSION,
      reviews,
      lastUpdated: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('Ошибка сохранения отзывов в localStorage:', error)
    return false
  }
}

/**
 * Добавляет новый отзыв в localStorage
 */
export const addReviewToStorage = (review: Review): boolean => {
  const reviews = loadReviewsFromStorage()
  reviews.push(review)
  return saveReviewsToStorage(reviews)
}

/**
 * Обновляет отзыв в localStorage
 */
export const updateReviewInStorage = (
  reviewId: string,
  updates: Partial<Review>
): boolean => {
  const reviews = loadReviewsFromStorage()
  const index = reviews.findIndex((r) => r.id === reviewId)
  
  if (index === -1) {
    return false
  }

  reviews[index] = { ...reviews[index], ...updates }
  return saveReviewsToStorage(reviews)
}

/**
 * Удаляет отзыв из localStorage
 */
export const deleteReviewFromStorage = (reviewId: string): boolean => {
  const reviews = loadReviewsFromStorage()
  const filtered = reviews.filter((r) => r.id !== reviewId)
  return saveReviewsToStorage(filtered)
}

/**
 * Экспортирует отзывы в JSON для резервного копирования
 */
export const exportReviews = (): string => {
  const reviews = loadReviewsFromStorage()
  return JSON.stringify(reviews, null, 2)
}

/**
 * Импортирует отзывы из JSON
 */
export const importReviews = (json: string): boolean => {
  try {
    const reviews: Review[] = JSON.parse(json)
    if (Array.isArray(reviews)) {
      return saveReviewsToStorage(reviews)
    }
    return false
  } catch (error) {
    console.error('Ошибка импорта отзывов:', error)
    return false
  }
}

/**
 * Очищает все отзывы из localStorage
 */
export const clearReviewsStorage = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Ошибка очистки localStorage:', error)
    return false
  }
}

/**
 * Синхронизирует отзывы между вкладками через StorageEvent
 */
export const setupStorageSync = (
  callback: (reviews: Review[]) => void
): (() => void) => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const data: StoredReviews = JSON.parse(e.newValue)
        callback(data.reviews || [])
      } catch (error) {
        console.error('Ошибка синхронизации отзывов:', error)
      }
    }
  }

  window.addEventListener('storage', handleStorageChange)
  
  // Возвращаем функцию для отписки
  return () => {
    window.removeEventListener('storage', handleStorageChange)
  }
}

