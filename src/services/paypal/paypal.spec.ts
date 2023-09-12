import { beforeAll, describe, expect, it } from '@jest/globals'
import { PaypalService } from './index'

describe('PaypalService', () => {
  let paypalService: PaypalService
  let orderID: string

  beforeAll(() => {
    paypalService = new PaypalService()
  })

  it('Generate access token', async () => {
    const token = await paypalService['generateAccessToken']()

    expect(token).toBeDefined()
  })

  it('Create order', async () => {
    const response = await paypalService.createOrder()

    orderID = response.id

    expect(response).toBeDefined()
  })

  it('Capture order', async () => {
    const response = await paypalService.capturePayment(orderID)

    expect(response).toBeDefined()
  })
})
