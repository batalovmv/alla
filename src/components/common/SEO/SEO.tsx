import { useEffect } from 'react'
import { CONTACT_INFO, SITE_NAME } from '../../../config/constants'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  type?: string
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  type = 'website',
}) => {
  const siteName = SITE_NAME
  const fullTitle = title ? `${title} | ${siteName}` : siteName
  const defaultDescription =
    'Профессиональные косметологические процедуры. Индивидуальный подход, современные технологии, гарантия качества.'
  const metaDescription = description || defaultDescription
  const siteUrl =
    (import.meta.env.VITE_SITE_URL as string | undefined) ||
    `${window.location.origin}${import.meta.env.BASE_URL || '/'}`
  const metaImage = image || `${siteUrl.replace(/\/$/, '')}/images/og-image.jpg`

  useEffect(() => {
    // Обновляем title
    document.title = fullTitle

    // Обновляем или создаем мета-теги
    const updateMetaTag = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(
        `meta[${attribute}="${name}"]`
      ) as HTMLMetaElement
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // Базовые мета-теги
    updateMetaTag('description', metaDescription)
    if (keywords) {
      updateMetaTag('keywords', keywords)
    }

    // Open Graph
    updateMetaTag('og:title', fullTitle, 'property')
    updateMetaTag('og:description', metaDescription, 'property')
    updateMetaTag('og:type', type, 'property')
    updateMetaTag('og:image', metaImage, 'property')
    updateMetaTag('og:url', siteUrl, 'property')
    updateMetaTag('og:site_name', siteName, 'property')

    // Twitter Card
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', fullTitle)
    updateMetaTag('twitter:description', metaDescription)
    updateMetaTag('twitter:image', metaImage)

    // Schema.org для LocalBusiness
    const schemaScript = document.getElementById('local-business-schema')
    if (schemaScript) {
      schemaScript.remove()
    }

    const script = document.createElement('script')
    script.id = 'local-business-schema'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: siteName,
      description: metaDescription,
      telephone: CONTACT_INFO.phone,
      email: CONTACT_INFO.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: CONTACT_INFO.address,
      },
      openingHours: CONTACT_INFO.workingHours,
      image: metaImage,
      url: siteUrl,
    })
    document.head.appendChild(script)
  }, [fullTitle, metaDescription, keywords, metaImage, type, siteName, siteUrl])

  return null
}

export default SEO


