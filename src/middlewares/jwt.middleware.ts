import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt.util'
import { ApiResponseDto } from '../utils/api_response_dto.util'

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Obtiene el token de la cabecera Authorization
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).send(new ApiResponseDto(false, 'Missing token', null))
  }

  // Verifica el token utilizando la función verifyToken
  const decoded = verifyToken(token)

  if (!decoded) {
    return res.status(401).send(new ApiResponseDto(false, 'Invalid token', null))
  }

  // Si el token es válido, almacena el ID del usuario en la solicitud para usarlo en la ruta protegida
  req.body.userId = decoded.userId

  // Continúa con la ejecución de la ruta protegida
  next()
}

export default authenticateToken
