import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config'

interface TokenData {
  userId: string
  role: 'client' | 'admin' | 'super'
}

export const generateToken = ({ userId, role }: TokenData) => {
  const token = jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: '2h'
  })
  return token
}

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded as TokenData
  } catch (error) {
    return null
  }
}
