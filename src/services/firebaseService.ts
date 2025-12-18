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
  Timestamp,
  setDoc,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../config/firebase'
import { Procedure, Review, BookingFormData } from '../types'

// Procedures
export const proceduresService = {
  async getAll(): Promise<Procedure[]> {
    try {
      const q = query(collection(db, 'procedures'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Procedure[]
    } catch (error) {
      // Если нет поля createdAt или другой ошибки, загружаем без сортировки
      const querySnapshot = await getDocs(collection(db, 'procedures'))
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Procedure[]
    }
  },

  async getById(id: string): Promise<Procedure | null> {
    const docRef = doc(db, 'procedures', id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Procedure
    }
    return null
  },

  async create(procedure: Omit<Procedure, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'procedures'), {
      ...procedure,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return docRef.id
  },

  async update(id: string, procedure: Partial<Procedure>): Promise<void> {
    const docRef = doc(db, 'procedures', id)
    await updateDoc(docRef, {
      ...procedure,
      updatedAt: Timestamp.now(),
    })
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'procedures', id))
  },
}

// Reviews
export const reviewsService = {
  async getAll(): Promise<Review[]> {
    try {
      const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'))
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
      const querySnapshot = await getDocs(collection(db, 'reviews'))
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
    try {
      const q = query(
        collection(db, 'reviews'),
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
      const q = query(collection(db, 'reviews'), where('approved', '==', true))
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
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...review,
      createdAt: Timestamp.now(),
    })
    return docRef.id
  },

  async update(id: string, review: Partial<Review>): Promise<void> {
    await updateDoc(doc(db, 'reviews', id), review)
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'reviews', id))
  },
}

// Contact Info
export const contactInfoService = {
  async get(): Promise<any> {
    const docRef = doc(db, 'contactInfo', 'main')
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data()
    }
    return null
  },

  async update(data: any): Promise<void> {
    await setDoc(doc(db, 'contactInfo', 'main'), data, { merge: true })
  },
}

// About Info
export const aboutInfoService = {
  async get(): Promise<any> {
    const docRef = doc(db, 'aboutInfo', 'main')
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data()
    }
    return null
  },

  async update(data: any): Promise<void> {
    await setDoc(doc(db, 'aboutInfo', 'main'), data, { merge: true })
  },
}

// Bookings
export const bookingsService = {
  async getAll(): Promise<any[]> {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }))
  },

  async create(booking: BookingFormData): Promise<string> {
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...booking,
      status: 'new',
      createdAt: Timestamp.now(),
    })
    return docRef.id
  },

  async update(id: string, data: Partial<any>): Promise<void> {
    await updateDoc(doc(db, 'bookings', id), data)
  },
}

// Storage
export const storageService = {
  async uploadImage(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path)
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

