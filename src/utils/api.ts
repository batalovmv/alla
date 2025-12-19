import { Procedure, Review, BookingFormData } from '../types'
import { proceduresService, reviewsService, bookingsService, clientsService } from '../services/firebaseService'

// Fallback на mock данные если Firebase не настроен
const useFirebase = !!import.meta.env.VITE_FIREBASE_API_KEY

// Симуляция API - fallback если Firebase не настроен
export const mockProcedures: Procedure[] = [
  {
    id: '1',
    name: 'Чистка лица',
    category: 'Лицо',
    description: 'Профессиональная чистка лица с использованием современных технологий',
    fullDescription: 'Глубокая чистка лица с использованием профессиональных средств. Процедура включает очищение пор, удаление черных точек и комедонов, увлажнение и питание кожи.',
    price: 2500,
    duration: 60,
    images: ['/images/procedure-1.jpg'],
    indications: ['Проблемная кожа', 'Расширенные поры', 'Черные точки'],
    contraindications: ['Акне в стадии обострения', 'Открытые раны'],
    popular: true,
  },
  {
    id: '2',
    name: 'Массаж лица',
    category: 'Лицо',
    description: 'Омолаживающий массаж лица для улучшения тонуса кожи',
    fullDescription: 'Классический массаж лица, направленный на улучшение кровообращения, лимфодренаж и повышение тонуса кожи. Помогает разгладить мелкие морщины и улучшить цвет лица.',
    price: 2000,
    duration: 45,
    images: ['/images/procedure-2.jpg'],
    indications: ['Дряблая кожа', 'Тусклый цвет лица', 'Мелкие морщины'],
    contraindications: ['Купероз', 'Воспаления на коже'],
    popular: true,
  },
  {
    id: '3',
    name: 'Обертывание',
    category: 'Тело',
    description: 'Антицеллюлитное обертывание для коррекции фигуры',
    fullDescription: 'Процедура обертывания с использованием специальных составов для борьбы с целлюлитом, улучшения тонуса кожи и выведения лишней жидкости.',
    price: 3000,
    duration: 90,
    images: ['/images/procedure-3.jpg'],
    indications: ['Целлюлит', 'Дряблая кожа тела', 'Отеки'],
    contraindications: ['Варикоз', 'Беременность', 'Онкологические заболевания'],
    popular: false,
  },
  {
    id: '4',
    name: 'Лазерная эпиляция',
    category: 'Аппаратная косметология',
    description: 'Безболезненное удаление нежелательных волос',
    fullDescription: 'Современная процедура удаления волос с помощью лазера. Безболезненно, эффективно, долговременный результат.',
    price: 4000,
    duration: 30,
    images: ['/images/procedure-4.jpg'],
    indications: ['Нежелательные волосы', 'Гипертрихоз'],
    contraindications: ['Беременность', 'Онкология', 'Свежий загар'],
    popular: true,
  },
]

export const mockReviews: Review[] = [
  {
    id: '1',
    clientName: 'Анна',
    procedureId: '1',
    procedureName: 'Чистка лица',
    rating: 5,
    text: 'Отличная процедура! Кожа стала чище и свежее. Очень довольна результатом.',
    date: '2024-01-15',
    approved: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    clientName: 'Мария',
    procedureId: '2',
    procedureName: 'Массаж лица',
    rating: 5,
    text: 'Прекрасный массаж, очень расслабляет. Кожа стала более упругой.',
    date: '2024-01-10',
    approved: true,
    createdAt: '2024-01-10T14:30:00Z',
  },
  {
    id: '3',
    clientName: 'Елена',
    procedureId: '4',
    procedureName: 'Лазерная эпиляция',
    rating: 4,
    text: 'Процедура прошла комфортно, результат виден уже после первого сеанса.',
    date: '2024-01-05',
    approved: true,
    createdAt: '2024-01-05T09:15:00Z',
  },
]

export const fetchProcedures = async (): Promise<Procedure[]> => {
  if (useFirebase) {
    try {
      return await proceduresService.getAll()
    } catch (error) {
      console.error('Ошибка загрузки процедур из Firebase:', error)
      // Fallback на mock данные
      return mockProcedures
    }
  }
  // Симуляция задержки сети
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockProcedures
}

export const fetchReviews = async (): Promise<Review[]> => {
  if (useFirebase) {
    try {
      return await reviewsService.getApproved()
    } catch (error) {
      console.error('Ошибка загрузки отзывов из Firebase:', error)
      // Fallback на mock данные
      return mockReviews
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockReviews
}

export const submitBooking = async (
  data: BookingFormData
): Promise<{ success: boolean; message: string }> => {
  if (useFirebase) {
    try {
      // Получаем процедуру для добавления procedureName
      const procedures = await proceduresService.getAll()
      const procedure = procedures.find((p) => p.id === data.procedureId)
      const procedureName = procedure?.name || 'Неизвестная процедура'

      // Находим или создаем клиента по телефону
      let client = await clientsService.getByPhone(data.phone)
      if (!client) {
        // Создаем нового клиента
        const clientId = await clientsService.create({
          phone: data.phone,
          name: data.name,
          email: data.email,
          totalVisits: 0,
        })
        client = await clientsService.get(clientId)
      } else {
        // Обновляем информацию клиента, если она изменилась
        const updateData: any = {}
        if (client.name !== data.name) updateData.name = data.name
        if (data.email && client.email !== data.email) updateData.email = data.email
        if (Object.keys(updateData).length > 0) {
          await clientsService.update(client.id, updateData)
        }
      }

      // Создаем заявку с procedureName
      await bookingsService.create({
        ...data,
        procedureName,
      })

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


