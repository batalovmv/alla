import { Procedure, Review, BookingFormData } from '../types'

// Симуляция API - в будущем здесь будут реальные запросы
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
  // Симуляция задержки сети
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockProcedures
}

export const fetchReviews = async (): Promise<Review[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockReviews
}

export const submitBooking = async (
  data: BookingFormData
): Promise<{ success: boolean; message: string }> => {
  // Симуляция отправки данных
  await new Promise((resolve) => setTimeout(resolve, 1000))
  console.log('Booking submitted:', data)
  return {
    success: true,
    message: 'Ваша заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.',
  }
}


