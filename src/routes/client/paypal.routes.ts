import { Router } from 'express'
import { PaypalController } from '../../controllers/client/payment/paypal.controller'
import { PaypalPaymentService } from '../../services/paypal/paypal-payment'
import { PaypalService } from '../../services/paypal/paypal-driver'
import { TransactionService } from '../../services/transactions.service'
import AppDataSource from '../../database/connection'
import { User } from '../../models/user.entity'
import { Transaction } from '../../models/transaction.entity'
import authenticateToken from '../../middlewares/jwt.middleware'

const router = Router()

const usersRepository = AppDataSource.getRepository(User)
const transactionsRepository = AppDataSource.getRepository(Transaction)
const transactionService = new TransactionService(
  usersRepository,
  transactionsRepository
)
const paypalService = new PaypalService()
const paypalPaymentService = new PaypalPaymentService(
  paypalService,
  transactionService
)
const paypalController = new PaypalController(paypalPaymentService)

router.post('/create_order', authenticateToken, (req, res) =>
  paypalController.createOrder(req, res)
)
router.get('/capture_order/:userId', (req, res) =>
  paypalController.captureOrder(req, res)
)

export default router
