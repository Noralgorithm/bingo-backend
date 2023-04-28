import { Request, Response, NextFunction } from 'express'
import jwt from '../utils/jwt.util'

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Obtiene el token de la cabecera Authorization
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).send('Token no proporcionado')
  }

  // Verifica el token utilizando la función verifyToken
  const decoded = jwt.verifyToken(token)

  if (!decoded) {
    return res.status(401).send('Token inválido')
  }

  // Si el token es válido, almacena el ID del usuario en la solicitud para usarlo en la ruta protegida
  req.body.userId = decoded.userId

  // Continúa con la ejecución de la ruta protegida
  next()
}

export default authenticateToken
