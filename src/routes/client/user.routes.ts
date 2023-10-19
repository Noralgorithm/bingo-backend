import { Router } from 'express'
import { UserController } from '../../controllers/client/user.controller'
import authenticateToken from '../../middlewares/jwt.middleware'
import AppDataSource from '../../database/connection'
import { User } from '../../models/user.entity'

const router = Router()

const userRepository = AppDataSource.getRepository(User)
const userController = new UserController(userRepository)

router.use(authenticateToken)

router.get('/my_info', (req, res) => {
  userController.getUserInfo(req, res)
})

router.get('/my-participations', (req, res) => {
  userController.getUserParticipations(req, res)
})

export default router
