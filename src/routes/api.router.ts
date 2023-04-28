import { Router } from 'express'
import adminRouter from './admin/admin.router'

const api = Router()

api.use('/admin', adminRouter)

export default api
