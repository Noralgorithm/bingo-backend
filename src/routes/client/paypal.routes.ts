import { Router } from 'express'
import { PaypalController } from '../../controllers/client/payment/paypal.controller'
import authenticateToken from '../../middlewares/jwt.middleware'

const router = Router()

router.use(authenticateToken)

const paypalController = new PaypalController()

router.post('/create_order', (req, res) =>
  paypalController.createOrder(req, res)
)
router.post('/capture_order', (req, res) =>
  paypalController.captureOrder(req, res)
)

export default router
