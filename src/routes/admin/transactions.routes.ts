import { Router } from 'express'
import authenticateToken from '../../middlewares/jwt.middleware'
import isAdmin from '../../middlewares/is_admin.middleware'
import { TransactionsController } from '../../controllers/admin/transactions/transactions.controller'

const router = Router()
const transactionsController = new TransactionsController()

router.use(authenticateToken)
router.use(isAdmin)

router.post('/', (req, res) =>
  transactionsController.createTransaction(req, res)
)

export default router
