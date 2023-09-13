import dotenv from 'dotenv'

dotenv.config()

export const JWT_SECRET = process.env.JWT_SECRET || ''
export const DB_HOST = process.env.DB_HOST
export const DB_PORT = process.env.DB_PORT
export const DB_USERNAME = process.env.DB_USERNAME
export const DB_PASSWORD = process.env.DB_PASSWORD
export const DB_NAME = process.env.DB_NAME
export const PORT = process.env.PORT
export const CLIENT_ID = process.env.CLIENT_ID
export const APP_SECRET = process.env.APP_SECRET
export const PAYPAL_BASE_URL = 'https://api-m.sandbox.paypal.com'
export const HOST = process.env.HOST
