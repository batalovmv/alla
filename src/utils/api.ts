import { Procedure, Review, BookingFormData } from '../types'
import { proceduresService, reviewsService, bookingsService, reviewMetaService } from '../services/firebaseService'

// Fallback на mock данные если Firebase не настроен
const useFirebase = !!import.meta.env.VITE_FIREBASE_API_KEY && !!import.meta.env.VITE_FIREBASE_PROJECT_ID

// Важно для перфоманса: mock-данные не должны попадать в production bundle.
// Поэтому подгружаем их динамически только когда они реально нужны.
async function getMockProcedures(): Promise<Procedure[]> {
  const mod = await import('./mockData')
  return mod.mockProcedures
}

async function getMockReviews(): Promise<Review[]> {
  const mod = await import('./mockData')
  return mod.mockReviews
}

export const fetchProcedures = async (): Promise<Procedure[]> => {
  if (useFirebase) {
    try {
      return await proceduresService.getAll()
    } catch (error) {
      console.error('Ошибка загрузки процедур из Firebase:', error)
      // Fallback на mock данные
      return await getMockProcedures()
    }
  }
  // Симуляция задержки сети
  await new Promise((resolve) => setTimeout(resolve, 500))
  return await getMockProcedures()
}

export const fetchReviews = async (): Promise<Review[]> => {
  if (useFirebase) {
    try {
      return await reviewsService.getApproved()
    } catch (error) {
      console.error('Ошибка загрузки отзывов из Firebase:', error)
      // Fallback на mock данные
      return await getMockReviews()
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 300))
  return await getMockReviews()
}

export const submitBooking = async (
  data: BookingFormData
): Promise<{ success: boolean; message: string }> => {
  if (useFirebase) {
    try {
      // Важно для безопасности:
      // Публичная часть сайта НЕ должна создавать/обновлять коллекцию `clients`.
      // Клиентов создаём/обновляем из админки при обработке/выполнении заявки.
      await bookingsService.create(data)

      return {
        success: true,
        message: 'Ваша заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.',
      }
    } catch (error) {
      console.error('Ошибка отправки заявки в Firebase:', error)
      return {
        success: false,
        message: 'Ошибка при отправке заявки. Попробуйте позже.',
      }
    }
  }
  // Симуляция отправки данных
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log('Booking submitted:', data)
  return {
    success: true,
    message: 'Ваша заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.',
  }
}

export const submitReview = async (data: {
  clientName: string
  phone: string
  procedureId: string
  procedureName: string
  rating: number
  text: string
}): Promise<{ success: boolean; message: string }> => {
  if (useFirebase) {
    try {
      const reviewId = await reviewsService.create({
        clientName: data.clientName,
        procedureId: data.procedureId,
        procedureName: data.procedureName,
        rating: data.rating,
        text: data.text,
        date: new Date().toISOString().split('T')[0],
      })

      // Телефон сохраняем отдельно (PII) — не публикуется вместе с отзывом
      await reviewMetaService.upsert(reviewId, { phone: data.phone })

      return {
        success: true,
        message: 'Спасибо! Отзыв отправлен и появится на сайте после модерации.',
      }
    } catch (error) {
      console.error('Ошибка отправки отзыва в Firebase:', error)
      return {
        success: false,
        message: 'Ошибка при отправке отзыва. Попробуйте позже.',
      }
    }
  }

  // Offline/mock режим: на проекте отзывы живут локально
  return {
    success: true,
    message: 'Спасибо! Отзыв сохранён локально (режим без Firebase).',
  }
}


