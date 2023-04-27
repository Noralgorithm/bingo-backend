import { DataSource } from 'typeorm'
import { User } from '../models/user.entity'

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '852456753jose',
  database: 'test',
  entities: [
    User
    // Aquí debes añadir las entidades que utilizarás en tu aplicación
  ],
  synchronize: true // esto creará automáticamente las tablas en la base de datos
})

AppDataSource.initialize()
  .then(() => {
    console.log('Conexión establecida con éxito!')
  })
  .catch(error => {
    console.log('Error al establecer la conexión:', error)
  })

export default AppDataSource
