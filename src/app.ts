import express from 'express'
import api from './routes/api.router'
import cors from 'cors'
import { RoomsController } from './controllers/admin/rooms/rooms.controller'

export const app = express()

app.use(cors())
app.use(express.json())

app.use(api)

app.get('/', (_req, res) => {
  res.send('Hello World!')
})

export const roomsController = new RoomsController()
