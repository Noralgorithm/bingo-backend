import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt.util'
import { ApiResponseDto } from '../utils/api_response_dto.util'

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res
      .status(401)
      .send(new ApiResponseDto(false, 'Missing token', null))
  }

  const decoded = verifyToken(token)

  if (!decoded) {
    return res
      .status(401)
      .send(new ApiResponseDto(false, 'Invalid token', null))
  }

  req.body.userId = decoded.userId
  req.body.role = decoded.role

  next()
}

export default authenticateToken
