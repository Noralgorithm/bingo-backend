import jwt from 'jsonwebtoken'
import config from '../config'

interface DecodedToken {
  userId: string
}

export const generateToken = (userId: string) => {
  const token = jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1h' })
  return token
}

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret)
    return decoded as DecodedToken
  } catch (error) {
    return null
  }
}
