import { Router } from 'express'
import authRoutes from './auth.routes'
import roomsRoutes from './rooms.routes'
import paypalRoutes from './paypal.routes'
import userRoutes from './user.routes'

const clientRouter = Router()

clientRouter.use('/', authRoutes)
clientRouter.use('/rooms', roomsRoutes)
clientRouter.use('/paypal', paypalRoutes)
clientRouter.use('/user', userRoutes)

export default clientRouter
