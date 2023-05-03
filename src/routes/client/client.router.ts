import { Router } from 'express'
import authRoutes from './auth.routes'

const clientRouter = Router()

clientRouter.use('/', authRoutes)

export default clientRouter
