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

export type BookingStatus = 'new' | 'awaiting' | 'completed' | 'cancelled'

export interface Booking {
  id: string
  name: string
  phone: string
  email?: string
  procedureId: string
  procedureName: string
  desiredDate: string
  desiredTime: string
  comment: string
  status: BookingStatus
  createdAt: Date
}

export interface Client {
  id: string
  phone: string
  name: string
  email?: string
  createdAt: Date
  lastVisit?: Date
  totalVisits: number
  notes?: string
}

export interface ServiceRecord {
  id: string
  clientId: string
  clientPhone: string
  clientName: string
  procedureId: string
  procedureName: string
  date: Date
  price?: number
  notes?: string
  createdAt: Date
  bookingId?: string // Связь с заявкой, если процедура была оказана из заявки
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

export interface ContactSocialMedia {
  instagram: string
  vk: string
  telegram: string
  whatsapp: string
}

export interface ContactInfo {
  phone: string
  // For wa.me links: digits only, e.g. 77001234567 (no +, spaces, brackets)
  whatsappPhone: string
  email: string
  address: string
  workingHours: string
  socialMedia: ContactSocialMedia
  mapEmbedUrl: string
  whatsappEnabled?: boolean
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
  lastFetched?: number
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
  lastFetched?: number
}


