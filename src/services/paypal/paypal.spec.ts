import { beforeAll, describe, expect, it } from '@jest/globals'
import { PaypalService } from './paypal-driver/index'
import { createOrderObject } from './create-order-object'
import { HOST } from '../../config'

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

  it('Create order object', () => {
    const order = createOrderObject({ value: '10.00', userId: 1 })

    expect(order).toStrictEqual({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '10.00'
          }
        }
      ],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
            brand_name: 'Bingo Damasco',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: `${HOST}/client/paypal/capture_order`,
            cancel_url: 'https://example.com/cancelUrl'
          }
        }
      }
    })
  })

  it('Create order', async () => {
    const response = await paypalService.createOrder({
      value: '10.00',
      userId: 1
    })

    orderID = response.id

    expect(response).toBeDefined()
  })

  it('Capture order', async () => {
    const response = await paypalService.capturePayment(orderID)
    console.log(response)
    expect(response).toBeDefined()
  })
})
