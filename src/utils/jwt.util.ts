import jwt from 'jsonwebtoken'
import config from '../config'

interface TokenData {
  userId: string
  role: 'client' | 'admin' | 'super'
}

export const generateToken = ({ userId, role }: TokenData) => {
  const token = jwt.sign({ userId, role }, config.jwtSecret, {
    expiresIn: '2h'
  })
  return token
}

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret)
    return decoded as TokenData
  } catch (error) {
    return null
  }
}
