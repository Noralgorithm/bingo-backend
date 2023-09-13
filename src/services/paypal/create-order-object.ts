import { HOST } from '../../config'

export type OrderObjectParams = {
  value: string
  userId: number
}

export function createOrderObject({ value, userId }: OrderObjectParams) {
  return {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'USD',
          value: value
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
          return_url: `${HOST}/client/paypal/capture_order/${userId}`,
          cancel_url: 'https://example.com/cancelUrl'
        }
      }
    }
  }
}
