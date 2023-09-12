import { CLIENT_ID, APP_SECRET } from '../../config'

export type OrderCreationPayload = {
  id: string
  status: string
  links: unknown[]
}

export type TokenGenerationPayload = {
  access_token: string
}

export class PaypalService {
  private readonly BASE_URL = 'https://api-m.sandbox.paypal.com'

  public createOrder = async () => {
    const accessToken = await this.generateAccessToken()
    const url = `${this.BASE_URL}/v2/checkout/orders`
    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '0.02'
          }
        }
      ]
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      method: 'POST',
      body: JSON.stringify(payload)
    })

    const body = (await response.json()) as OrderCreationPayload

    return body
  }

  public capturePayment = async (orderID: string) => {
    const accessToken = await this.generateAccessToken()
    const url = `${this.BASE_URL}/v2/checkout/orders/${orderID}/capture`

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
      const response = await fetch(`${this.BASE_URL}/v1/oauth2/token`, {
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
