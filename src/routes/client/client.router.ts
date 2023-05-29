import { Router } from 'express'
import authRoutes from './auth.routes'
import roomsRoutes from './rooms.routes'

const clientRouter = Router()

clientRouter.use('/', authRoutes)
clientRouter.use('/rooms', roomsRoutes)

export default clientRouter
