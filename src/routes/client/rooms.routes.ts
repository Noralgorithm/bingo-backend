import { Router } from 'express'
import authenticateToken from '../../middlewares/jwt.middleware'
import { RoomsController } from '../../controllers/client/rooms.controller'

const router = Router()

router.use(authenticateToken)

const roomsController = new RoomsController()

router.get('/', (req, res) => roomsController.findAll(req, res))
router.get('/:roomId/cards', (req, res) =>
  roomsController.getUserCards(req, res)
)
router.post('/:roomId/buy_cards', (req, res) =>
  roomsController.buyCards(req, res)
)

export default router
