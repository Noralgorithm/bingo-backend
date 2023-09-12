import { Router } from 'express'
import authRoutes from './auth.routes'
import roomsRoutes from './rooms.routes'
import paypalRoutes from './paypal.routes'

const clientRouter = Router()

clientRouter.use('/', authRoutes)
clientRouter.use('/rooms', roomsRoutes)
clientRouter.use('/paypal', paypalRoutes)

export default clientRouter
