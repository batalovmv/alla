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
  Timestamp,
  setDoc,
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
  async getAll(): Promise<Procedure[]> {
    checkFirebase()
    try {
      const q = query(collection(db!, 'procedures'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Procedure[]
    } catch (error) {
      // Если нет поля createdAt или другой ошибки, загружаем без сортировки
      checkFirebase()
      const querySnapshot = await getDocs(collection(db!, 'procedures'))
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Procedure[]
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
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  },

  async update(id: string, procedure: Partial<Procedure>): Promise<void> {
    checkFirebase()
    const docRef = doc(db!, 'procedures', id)
    await updateDoc(docRef, {
      ...procedure,
      updatedAt: Timestamp.now(),
    })
  },

  async delete(id: string): Promise<void> {
    checkFirebase()
    await deleteDoc(doc(db!, 'procedures', id))
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
    const q = query(collection(db!, 'bookings'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }))
  },

  async create(booking: BookingFormData & { procedureName?: string }): Promise<string> {
    checkFirebase()
    const docRef = await addDoc(collection(db!, 'bookings'), {
      ...booking,
      status: 'new',
      createdAt: Timestamp.now(),
    })
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
      createdAt: Timestamp.now(),
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

  async create(record: any): Promise<string> {
    checkFirebase()
    const docRef = await addDoc(collection(db!, 'serviceRecords'), {
      ...record,
      date: Timestamp.fromDate(record.date),
      createdAt: Timestamp.now(),
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

