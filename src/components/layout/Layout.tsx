import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header/Header'
import Footer from './Footer/Footer'
import styles from './Layout.module.css'
import { ContactInfo } from '../../types'
import { getContactInfo } from '../../utils/contactInfo'
import StickyActions from './StickyActions/StickyActions'
import { requestIdle, cancelIdle } from '../../utils/idleCallback'
import {
  prefetchContactsPage,
  prefetchProcedureDetailPage,
  prefetchProceduresPage,
  prefetchReviewsPage,
} from '../../utils/prefetchPages'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const location = useLocation()

  useEffect(() => {
    let mounted = true
    getContactInfo()
      .then((ci) => {
        if (mounted) setContactInfo(ci)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    // Conservative idle prefetch: helps make next navigation feel instant without wasting bandwidth.
    const path = location.pathname
    const handle = requestIdle(() => {
      if (path === '/') {
        prefetchProceduresPage()
        prefetchContactsPage()
        return
      }
      if (path.startsWith('/procedures')) {
        prefetchProcedureDetailPage()
        prefetchReviewsPage()
        return
      }
      if (path.startsWith('/reviews')) {
        prefetchProceduresPage()
        return
      }
      if (path.startsWith('/contacts')) {
        prefetchProceduresPage()
        return
      }
    })

    return () => cancelIdle(handle)
  }, [location.pathname])

  return (
    <div className={styles.layout}>
      <Header contactInfo={contactInfo || undefined} />
      <main className={styles.main}>{children}</main>
      <Footer contactInfo={contactInfo || undefined} />
      {contactInfo && <StickyActions contactInfo={contactInfo} />}
    </div>
  )
}

export default Layout


