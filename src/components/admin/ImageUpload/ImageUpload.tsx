import React, { useState, useRef } from 'react'
import { storageService } from '../../../services/firebaseService'
import Button from '../../common/Button/Button'
import styles from './ImageUpload.module.css'

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  folder?: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  maxImages = 5,
  folder = 'procedures',
}) => {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - value.length
    const filesToUpload = Array.from(files).slice(0, remainingSlots)

    if (filesToUpload.length === 0) {
      alert(`Максимум ${maxImages} изображений`)
      return
    }

    setUploading(true)
    try {
      const urls = await storageService.uploadMultipleImages(
        filesToUpload,
        folder
      )
      onChange([...value, ...urls])
    } catch (error) {
      console.error('Ошибка загрузки изображений:', error)
      alert('Ошибка при загрузке изображений')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index)
    onChange(newUrls)
  }

  return (
    <div className={styles.imageUpload}>
      <div className={styles.images}>
        {value.map((url, index) => (
          <div key={index} className={styles.imageItem}>
            <img src={url} alt={`Изображение ${index + 1}`} />
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => handleRemove(index)}
            >
              ×
            </button>
          </div>
        ))}
        {value.length < maxImages && (
          <div className={styles.uploadButton}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <Button
              type="button"
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Загрузка...' : '+ Добавить'}
            </Button>
          </div>
        )}
      </div>
      {value.length >= maxImages && (
        <p className={styles.hint}>Достигнут лимит изображений ({maxImages})</p>
      )}
    </div>
  )
}

export default ImageUpload

