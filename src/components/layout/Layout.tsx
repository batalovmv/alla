import React, { useEffect, useState } from 'react'
import Header from './Header/Header'
import Footer from './Footer/Footer'
import styles from './Layout.module.css'
import { ContactInfo } from '../../types'
import { getContactInfo } from '../../utils/contactInfo'
import StickyActions from './StickyActions/StickyActions'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)

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


