export interface Procedure {
  id: string
  name: string
  category: string
  description: string
  fullDescription: string
  price: number
  duration: number // в минутах
  images: string[]
  indications: string[]
  contraindications: string[]
  popular?: boolean
}

export interface BookingFormData {
  name: string
  phone: string
  email?: string
  procedureId: string
  desiredDate: string
  desiredTime: string
  comment: string
  consent: boolean
}

export interface Review {
  id: string
  clientName: string
  clientPhoto?: string
  procedureId: string
  procedureName: string
  rating: number
  text: string
  date: string
  approved?: boolean
  createdAt?: string
}

export interface ProceduresState {
  items: Procedure[]
  categories: string[]
  filters: {
    category: string
    search: string
    sort: 'popular' | 'price-asc' | 'price-desc' | 'name'
  }
  loading: boolean
  error: string | null
}

export interface BookingState {
  formData: Partial<BookingFormData>
  isSubmitting: boolean
  success: boolean
  error: string | null
}

export interface ReviewsState {
  items: Review[]
  averageRating: number
  loading: boolean
}


