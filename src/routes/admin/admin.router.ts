import { Router } from 'express'
import authRoutes from './auth.routes'
import usersRoutes from './users.routes'
import roomsRoutes from './rooms.routes'

const adminRouter = Router()

adminRouter.use('/', authRoutes)
adminRouter.use('/users', usersRoutes)
adminRouter.use('/rooms', roomsRoutes)

export default adminRouter
