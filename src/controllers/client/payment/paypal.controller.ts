import { Request, Response } from 'express'
import { PaypalService } from '../../../services/paypal'
import { ApiResponseDto } from '../../../utils/api_response_dto.util'

export class PaypalController {
  private paypalService: PaypalService

  public createOrder = async (_req: Request, res: Response) => {
    try {
      const response = await this.paypalService.createOrder()
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
      const { orderID } = req.body as { orderID: string }
      const response = await this.paypalService.capturePayment(orderID)
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
