import { Router } from 'express'
import userRoutes from './users.routes'

const adminRouter = Router()

adminRouter.use('/users', userRoutes)

export default adminRouter
