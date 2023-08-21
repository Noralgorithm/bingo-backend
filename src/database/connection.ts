import { DataSource } from 'typeorm'
import { User } from '../models/user.entity'
import { Room } from '../models/room.entity'
import { RoomsController } from '../controllers/admin/rooms/rooms.controller'
import { Participation } from '../models/participation.entity'
import { Card } from '../models/card.entity'
import { Transaction } from '../models/transaction.entity'
import { Game } from '../models/game.entity'
import { Victory } from '../models/victory.entity'
import { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_PORT, DB_NAME } from '../config'

export const roomsController = new RoomsController()

const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  ssl: true,
  entities: [User, Room, Participation, Card, Transaction, Game, Victory],
  synchronize: true
})

export async function connectToDatabase(roomsController: RoomsController) {
  AppDataSource.initialize()
    .then(async () => {
      roomsController.init()
      console.log('Conexión establecida con éxito!')
    })
    .catch((error: unknown) => {
      console.log('Error al establecer la conexión:', error)
    })
}

export default AppDataSource
