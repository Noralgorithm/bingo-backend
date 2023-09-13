import { Request, Response } from 'express'
import { ApiResponseDto } from '../../../utils/api_response_dto.util'
import { PaypalPaymentService } from '../../../services/paypal/paypal-payment'

export class PaypalController {
  constructor(private paypalPaymentService: PaypalPaymentService) {}

  public createOrder = async (req: Request, res: Response) => {
    try {
      if (!req.body?.value) throw new Error('Bad request.')

      const { userId } = req.body as { userId: string }
      const { value } = req.body

      const response = await this.paypalPaymentService.createOrder({
        value,
        userId: Number(userId)
      })
      return res
        .status(200)
        .json(new ApiResponseDto(true, 'Succesfully created order', response))
    } catch (error) {
      return res
        .status(400)
        .json(new ApiResponseDto(false, 'Failed to create order', error))
    }
  }

  public captureOrder = async (req: Request, res: Response) => {
    try {
      const { token } = req.query
      const { userId } = req.params
      const response = await this.paypalPaymentService.captureOrder(
        token as string,
        Number(userId)
      )
      return res
        .status(200)
        .json(new ApiResponseDto(true, 'Succesfully captured order', response))
    } catch (error) {
      return res
        .status(400)
        .json(new ApiResponseDto(false, 'Failed to capture order', error))
    }
  }
}
