import { Router } from 'express'
import adminRouter from './admin/admin.router'
import clientRouter from './client/client.router'

const api = Router()

api.use('/admin', adminRouter)
api.use('/client', clientRouter)

export default api
