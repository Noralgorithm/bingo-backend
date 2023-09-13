import { CLIENT_ID, APP_SECRET } from '../../../config'
import { PAYPAL_BASE_URL } from '../../../config'
import { OrderObjectParams, createOrderObject } from '../create-order-object'

export type CreatedOrderPayload = {
  id: string
  status: string
  links: unknown[]
}

export type TokenGenerationPayload = {
  access_token: string
}

export class PaypalService {
  public createOrder = async ({ value, userId }: OrderObjectParams) => {
    const accessToken = await this.generateAccessToken()
    const url = `${PAYPAL_BASE_URL}/v2/checkout/orders`
    const payload = createOrderObject({ value, userId })

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      method: 'POST',
      body: JSON.stringify(payload)
    })

    const body = (await response.json()) as CreatedOrderPayload

    return body
  }

  public capturePayment = async (orderID: string) => {
    const accessToken = await this.generateAccessToken()
    const url = `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`

    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })

    const body = await response.json()

    return body
  }

  private generateAccessToken = async () => {
    try {
      const auth = Buffer.from(CLIENT_ID + ':' + APP_SECRET).toString('base64')
      const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
        method: 'post',
        body: 'grant_type=client_credentials',
        headers: {
          Authorization: `Basic ${auth}`
        }
      })

      const data = (await response.json()) as TokenGenerationPayload
      return data.access_token
    } catch (error) {
      console.error('Failed to generate Access Token:', error)
    }
  }
}
