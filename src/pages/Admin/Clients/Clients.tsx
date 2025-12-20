import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { clientsService } from '../../../services/firebaseService'
import { Client } from '../../../types'
import { ROUTES } from '../../../config/routes'
import Card from '../../../components/common/Card/Card'
import Button from '../../../components/common/Button/Button'
import Input from '../../../components/common/Input/Input'
import { PageFallback } from '../../../components/common/PageFallback/PageFallback'
import styles from './Clients.module.css'

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.phone.includes(query) ||
          (client.email && client.email.toLowerCase().includes(query))
      )
      setFilteredClients(filtered)
    }
  }, [searchQuery, clients])

  const loadClients = async () => {
    try {
      setLoading(true)
      const allClients = await clientsService.getAll()
      setClients(allClients as Client[])
      setFilteredClients(allClients as Client[])
    } catch (error) {
      console.error('Ошибка загрузки клиентов:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <PageFallback variant="admin" />
  }

  return (
    <div className={styles.clients}>
      <div className={styles.header}>
        <h1 className={styles.title}>Клиенты</h1>
        <Input
          type="text"
          placeholder="Поиск по имени, телефону или email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {filteredClients.length === 0 ? (
        <Card className={styles.empty}>
          <p>{searchQuery ? 'Клиенты не найдены' : 'Клиентов нет'}</p>
        </Card>
      ) : (
        <div className={styles.list}>
          {filteredClients.map((client) => (
            <Card key={client.id} className={styles.clientCard}>
              <div className={styles.clientHeader}>
                <div>
                  <h3 className={styles.clientName}>{client.name}</h3>
                  <p className={styles.clientPhone}>
                    <a href={`tel:${client.phone}`}>{client.phone}</a>
                  </p>
                  {client.email && (
                    <p className={styles.clientEmail}>
                      <a href={`mailto:${client.email}`}>{client.email}</a>
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.clientInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Визитов:</span>
                  <span>{client.totalVisits || 0}</span>
                </div>
                {client.lastVisit && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Последний визит:</span>
                    <span>
                      {new Date(client.lastVisit).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <span className={styles.label}>Дата регистрации:</span>
                  <span>
                    {new Date(client.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>

              <div className={styles.actions}>
                <Link to={ROUTES.ADMIN_CLIENT_HISTORY(client.id)}>
                  <Button size="small">История</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Clients

