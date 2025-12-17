import React from 'react'
import Card from '../../components/common/Card/Card'
import SEO from '../../components/common/SEO/SEO'
import styles from './About.module.css'

const About: React.FC = () => {
  return (
    <>
      <SEO
        title="О специалисте"
        description="Опытный косметолог с многолетним стажем. Образование, сертификаты, опыт работы и индивидуальный подход к каждому клиенту."
        keywords="косметолог, специалист косметологии, опыт работы, сертификаты"
      />
      <div className={styles.about}>
        <div className={styles.container}>
          <h1 className={styles.title}>О специалисте</h1>

        <div className={styles.content}>
          <div className={styles.imageSection}>
            <div className={styles.imagePlaceholder}>
              <span>Фото специалиста</span>
            </div>
          </div>

          <div className={styles.textSection}>
            <Card className={styles.card}>
              <h2>Биография</h2>
              <p>
                Добро пожаловать! Я профессиональный косметолог с многолетним
                опытом работы в сфере эстетической медицины и косметологии.
              </p>
              <p>
                Моя миссия - помочь каждому клиенту обрести уверенность в себе
                и почувствовать свою естественную красоту. Я верю, что
                правильный уход за кожей и профессиональные процедуры могут
                творить чудеса.
              </p>
            </Card>

            <Card className={styles.card}>
              <h2>Образование и сертификаты</h2>
              <ul className={styles.list}>
                <li>Высшее медицинское образование</li>
                <li>Сертификат по косметологии</li>
                <li>Регулярное повышение квалификации</li>
                <li>Участие в профессиональных семинарах и мастер-классах</li>
              </ul>
            </Card>

            <Card className={styles.card}>
              <h2>Опыт работы</h2>
              <p>
                Более 10 лет успешной практики в области косметологии. За это
                время я помогла сотням клиентов решить различные проблемы с
                кожей и достичь желаемых результатов.
              </p>
              <p>
                Работаю с различными типами кожи и индивидуально подхожу к
                каждому случаю, учитывая особенности и потребности клиента.
              </p>
            </Card>

            <Card className={styles.card}>
              <h2>Мой подход</h2>
              <p>
                Я убеждена, что красота - это не только внешний вид, но и
                внутреннее состояние. Поэтому в своей работе я уделяю особое
                внимание:
              </p>
              <ul className={styles.list}>
                <li>
                  <strong>Индивидуальному подходу</strong> - каждая процедура
                  подбирается с учетом особенностей вашей кожи
                </li>
                <li>
                  <strong>Безопасности</strong> - использую только
                  сертифицированные препараты и проверенные методики
                </li>
                <li>
                  <strong>Результату</strong> - стремлюсь к достижению
                  максимального эффекта от каждой процедуры
                </li>
                <li>
                  <strong>Комфорту</strong> - создаю приятную атмосферу для
                  расслабления и восстановления
                </li>
              </ul>
            </Card>

            <Card className={styles.card}>
              <h2>Галерея сертификатов</h2>
              <div className={styles.certificates}>
                <div className={styles.certificatePlaceholder}>
                  <span>Сертификат 1</span>
                </div>
                <div className={styles.certificatePlaceholder}>
                  <span>Сертификат 2</span>
                </div>
                <div className={styles.certificatePlaceholder}>
                  <span>Сертификат 3</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

export default About

