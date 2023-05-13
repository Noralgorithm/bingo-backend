import { Router } from 'express'
import authenticateToken from '../../middlewares/jwt.middleware'
import isAdmin from '../../middlewares/is_admin.middleware'
import { roomsController } from '../../database/connection'

const router = Router()

router.use(authenticateToken)
router.use(isAdmin)

router.get('/', (req, res) => roomsController.findAll(req, res))

router.post('/', (req, res) => roomsController.create(req, res))

router.put('/:id', (req, res) => roomsController.update(req, res))

router.delete('/:id', (req, res) => roomsController.delete(req, res))

export default router
