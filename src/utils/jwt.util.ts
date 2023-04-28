import jwt from 'jsonwebtoken'
import config from '../config'

interface DecodedToken {
  userId: string
}

const generateToken = (userId: string) => {
  const token = jwt.sign({ userId }, config.jwtSecret, { expiresIn: '1h' })
  return token
}

const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret)
    return decoded as DecodedToken
  } catch (error) {
    return null
  }
}

export default {
  generateToken,
  verifyToken
}
