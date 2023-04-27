import { Router } from 'express'
import userRoutes from './users.routes'

const api = Router()

api.use('/users', userRoutes)

export default api
