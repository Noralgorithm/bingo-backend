import { Router } from 'express'
import { UsersController } from '../../controllers/admin/users/users.controller'
import authenticateToken from '../../middlewares/jwt.middleware'
import isAdmin from '../../middlewares/is_admin.middleware'

const router = Router()
const usersController = new UsersController()

router.use(authenticateToken)
router.use(isAdmin)

router.get('/', (req, res) => usersController.findAll(req, res))

router.post('/', (req, res) => usersController.create(req, res))

router.put('/:id', (req, res) => usersController.update(req, res))

router.delete('/:id', (req, res) => usersController.delete(req, res))

export default router
