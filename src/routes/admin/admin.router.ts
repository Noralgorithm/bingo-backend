import { Router } from 'express'
import authRoutes from './auth.routes'
import userRoutes from './users.routes'

const adminRouter = Router()

adminRouter.use('/', authRoutes)
adminRouter.use('/users', userRoutes)

export default adminRouter
