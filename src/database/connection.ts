import { DataSource } from 'typeorm'
import { User } from '../models/user.entity'
import { Room } from '../models/room.entity'
import { RoomsController } from '../controllers/admin/rooms/rooms.controller'

export const roomsController = new RoomsController()

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '852456753jose',
  database: 'test',
  entities: [User, Room],
  synchronize: true
})

AppDataSource.initialize()
  .then(() => {
    roomsController.init()
    console.log('Conexión establecida con éxito!')
  })
  .catch(error => {
    console.log('Error al establecer la conexión:', error)
  })

export default AppDataSource
