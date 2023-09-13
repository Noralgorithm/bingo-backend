import { PaypalService } from '../paypal-driver'
import { OrderObjectParams } from '../create-order-object'
import { PACKS } from '../../../utils/packs.util'
import { TransactionService } from '../../transactions.service'

export class PaypalPaymentService {
  constructor(
    private paypalService: PaypalService,
    private transactionService: TransactionService
  ) {}

  public async createOrder({ value, userId }: OrderObjectParams) {
    const selectedPack = PACKS.find(p => p.price === value)

    if (!selectedPack) throw new Error('No pack available with that price.')

    return await this.paypalService.createOrder({
      value: selectedPack.price,
      userId
    })
  }

  public async captureOrder(orderID: string, userID: number) {
    const response = await this.paypalService.capturePayment(orderID)

    if (response?.status !== 'COMPLETED')
      throw new Error('Error capturing order')

    console.log('====>', response.purchase_units[0].payments)
    const orderValue =
      response.purchase_units[0].payments.captures[0].amount.value
    const userProfit = PACKS.find(p => p.price === orderValue)?.profit || 0

    await this.transactionService.createTransaction(userID, userProfit)
  }
}
