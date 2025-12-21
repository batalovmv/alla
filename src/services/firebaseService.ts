import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
  Timestamp,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../config/firebase'
import { Procedure, Review, BookingFormData } from '../types'

// Helper function to check if Firebase is initialized
const checkFirebase = () => {
  if (!db || !storage) {
    throw new Error('Firebase не настроен. Пожалуйста, настройте Firebase для работы админ-панели.')
  }
}

// Procedures
export const proceduresService = {
  async getAll(opts?: { includeArchived?: boolean }): Promise<Procedure[]> {
    checkFirebase()
    const includeArchived = Boolean(opts?.includeArchived)
    try {
      const q = query(collection(db!, 'procedures'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const all = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Procedure[]
      return includeArchived ? all : all.filter((p) => p.archived !== true)
    } catch (error) {
      // Если нет поля createdAt или другой ошибки, загружаем без сортировки
      checkFirebase()
      const querySnapshot = await getDocs(collection(db!, 'procedures'))
      const all = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Procedure[]
      return includeArchived ? all : all.filter((p) => p.archived !== true)
    }
  },

  async getById(id: string): Promise<Procedure | null> {
    checkFirebase()
    const docRef = doc(db!, 'procedures', id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Procedure
    }
    return null
  },

  async create(procedure: Omit<Procedure, 'id'>): Promise<string> {
    checkFirebase()
    const docRef = await addDoc(collection(db!, 'procedures'), {
      ...procedure,
      archived: false,
      archivedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  },

  async update(id: string, procedure: Partial<Procedure>): Promise<void> {
    checkFirebase()
    const docRef = doc(db!, 'procedures', id)
    await updateDoc(docRef, {
      ...procedure,
      updatedAt: serverTimestamp(),
    })
  },

  async delete(id: string): Promise<void> {
    checkFirebase()
    await deleteDoc(doc(db!, 'procedures', id))
  },

  async getUsageCounts(id: string): Promise<{ bookings: number; reviews: number; serviceRecords: number }> {
    checkFirebase()
    const [bookingsSnap, reviewsSnap, recordsSnap] = await Promise.all([
      getCountFromServer(query(collection(db!, 'bookings'), where('procedureId', '==', id))),
      getCountFromServer(query(collection(db!, 'reviews'), where('procedureId', '==', id))),
      getCountFromServer(query(collection(db!, 'serviceRecords'), where('procedureId', '==', id))),
    ])
    return {
      bookings: bookingsSnap.data().count,
      reviews: reviewsSnap.data().count,
      serviceRecords: recordsSnap.data().count,
    }
  },

  async archive(id: string): Promise<void> {
    checkFirebase()
    await updateDoc(doc(db!, 'procedures', id), {
      archived: true,
      archivedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  },

  async restore(id: string): Promise<void> {
    checkFirebase()
    await updateDoc(doc(db!, 'procedures', id), {
      archived: false,
      archivedAt: null,
      updatedAt: serverTimestamp(),
    })
  },
}

// Reviews
export const reviewsService = {
  async getAll(): Promise<Review[]> {
    checkFirebase()
    try {
      const q = query(collection(db!, 'reviews'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null
        return {
          id: doc.id,
          ...data,
          date: data.date || (createdAt ? createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        }
      }) as Review[]
    } catch (error) {
      // Если нет поля createdAt, загружаем без сортировки
      checkFirebase()
      const querySnapshot = await getDocs(collection(db!, 'reviews'))
      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          date: data.date || new Date().toISOString().split('T')[0],
        }
      }) as Review[]
    }
  },

  async getApproved(): Promise<Review[]> {
    checkFirebase()
    try {
      const q = query(
        collection(db!, 'reviews'),
        where('approved', '==', true),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null
        return {
          id: doc.id,
          ...data,
          date: data.date || (createdAt ? createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        }
      }) as Review[]
    } catch (error) {
      // Если нет поля createdAt, загружаем без сортировки
      checkFirebase()
      const q = query(collection(db!, 'reviews'), where('approved', '==', true))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          date: data.date || new Date().toISOString().split('T')[0],
        }
      }) as Review[]
    }
  },

  async create(review: Omit<Review, 'id'>): Promise<string> {
    checkFirebase()
    const docRef = await addDoc(collection(db!, 'reviews'), {
      ...review,
      // IMPORTANT:
      // Firestore rules validate `createdAt is timestamp` for public create.
      // `serverTimestamp()` is a transform sentinel and can fail strict rules.
      createdAt: Timestamp.now(),
    })
    return docRef.id
  },

  async update(id: string, review: Partial<Review>): Promise<void> {
    checkFirebase()
    await updateDoc(doc(db!, 'reviews', id), review)
  },

  async delete(id: string): Promise<void> {
    checkFirebase()
    await deleteDoc(doc(db!, 'reviews', id))
  },
}

// Review Meta (PII) - stored separately from public review content
export const reviewMetaService = {
  async upsert(reviewId: string, data: { phone: string }): Promise<void> {
    checkFirebase()
    await setDoc(
      doc(db!, 'reviewMeta', reviewId),
      {
        phone: data.phone,
        // IMPORTANT: rules validate `createdAt is timestamp` on create
        createdAt: Timestamp.now(),
      },
      { merge: true }
    )
  },

  async get(reviewId: string): Promise<{ phone?: string } | null> {
    checkFirebase()
    const docRef = doc(db!, 'reviewMeta', reviewId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) return docSnap.data() as any
    return null
  },
}

// Contact Info
export const contactInfoService = {
  async get(): Promise<any> {
    checkFirebase()
    const docRef = doc(db!, 'contactInfo', 'main')
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data()
    }
    return null
  },

  async update(data: any): Promise<void> {
    checkFirebase()
    await setDoc(doc(db!, 'contactInfo', 'main'), data, { merge: true })
  },
}

// About Info
export const aboutInfoService = {
  async get(): Promise<any> {
    checkFirebase()
    const docRef = doc(db!, 'aboutInfo', 'main')
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data()
    }
    return null
  },

  async update(data: any): Promise<void> {
    checkFirebase()
    await setDoc(doc(db!, 'aboutInfo', 'main'), data, { merge: true })
  },
}

// Bookings
export const bookingsService = {
  async getAll(): Promise<any[]> {
    checkFirebase()
    try {
      const q = query(collection(db!, 'bookings'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }))
    } catch (error) {
      // Fallback если поле createdAt отсутствует или не индексировано
      const querySnapshot = await getDocs(collection(db!, 'bookings'))
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || undefined,
      }))
    }
  },

  async create(booking: BookingFormData & { procedureName?: string }): Promise<string> {
    checkFirebase()
    // Firestore client does not like `undefined` fields and our rules are strict about schema.
    // Use explicit nulls for optional fields.
    const payload = {
      name: booking.name,
      phone: booking.phone,
      email: booking.email ?? null,
      procedureId: booking.procedureId,
      procedureName: booking.procedureName ?? null,
      desiredDate: booking.desiredDate,
      desiredTime: booking.desiredTime,
      comment: booking.comment || '',
      consent: booking.consent,
      status: 'new',
      // IMPORTANT: rules validate `createdAt is timestamp` on create
      createdAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db!, 'bookings'), payload)
    return docRef.id
  },

  async update(id: string, data: Partial<any>): Promise<void> {
    checkFirebase()
    await updateDoc(doc(db!, 'bookings', id), data)
  },
}

// Clients
export const clientsService = {
  async getAll(): Promise<any[]> {
    checkFirebase()
    const q = query(collection(db!, 'clients'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      lastVisit: doc.data().lastVisit?.toDate(),
    }))
  },

  async get(id: string): Promise<any | null> {
    checkFirebase()
    const docRef = doc(db!, 'clients', id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        lastVisit: docSnap.data().lastVisit?.toDate(),
      }
    }
    return null
  },

  async getByPhone(phone: string): Promise<any | null> {
    checkFirebase()
    const q = query(collection(db!, 'clients'), where('phone', '==', phone), limit(1))
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastVisit: doc.data().lastVisit?.toDate(),
      }
    }
    return null
  },

  async create(client: any): Promise<string> {
    checkFirebase()
    const docRef = await addDoc(collection(db!, 'clients'), {
      ...client,
      totalVisits: client.totalVisits || 0,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  },

  async update(id: string, data: Partial<any>): Promise<void> {
    checkFirebase()
    await updateDoc(doc(db!, 'clients', id), data)
  },
}

// Service Records
export const serviceRecordsService = {
  async getAll(): Promise<any[]> {
    checkFirebase()
    const q = query(collection(db!, 'serviceRecords'), orderBy('date', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    }))
  },

  async getByClientId(clientId: string): Promise<any[]> {
    checkFirebase()
    const q = query(
      collection(db!, 'serviceRecords'),
      where('clientId', '==', clientId),
      orderBy('date', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    }))
  },

  async getByPhone(phone: string): Promise<any[]> {
    checkFirebase()
    const q = query(
      collection(db!, 'serviceRecords'),
      where('clientPhone', '==', phone),
      orderBy('date', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    }))
  },

  async getByDateRange(start: Date, end: Date): Promise<any[]> {
    checkFirebase()
    const startTs = Timestamp.fromDate(start)
    const endTs = Timestamp.fromDate(end)
    const q = query(
      collection(db!, 'serviceRecords'),
      where('date', '>=', startTs),
      where('date', '<', endTs),
      orderBy('date', 'asc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    }))
  },

  async create(record: any): Promise<string> {
    checkFirebase()
    const docRef = await addDoc(collection(db!, 'serviceRecords'), {
      ...record,
      date: Timestamp.fromDate(record.date),
      createdAt: serverTimestamp(),
    })
    return docRef.id
  },

  async update(id: string, data: Partial<any>): Promise<void> {
    checkFirebase()
    const updateData: any = { ...data }
    if (data.date) {
      updateData.date = Timestamp.fromDate(data.date)
    }
    await updateDoc(doc(db!, 'serviceRecords', id), updateData)
  },

  async delete(id: string): Promise<void> {
    checkFirebase()
    await deleteDoc(doc(db!, 'serviceRecords', id))
  },
}

// Storage
export const storageService = {
  async uploadImage(file: File, path: string): Promise<string> {
    checkFirebase()
    const storageRef = ref(storage!, path)
    await uploadBytes(storageRef, file)
    return await getDownloadURL(storageRef)
  },

  async uploadMultipleImages(files: File[], basePath: string): Promise<string[]> {
    const uploadPromises = files.map((file, index) => {
      const fileName = `${Date.now()}_${index}_${file.name}`
      return this.uploadImage(file, `${basePath}/${fileName}`)
    })
    return Promise.all(uploadPromises)
  },
}

