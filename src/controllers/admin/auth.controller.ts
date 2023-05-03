import { Request, Response } from 'express'
import AppDataSource from '../../database/connection'
import { User } from '../../models/user.entity'
import { ApiResponseDto } from '../../utils/api_response_dto.util'
import { comparePassword } from '../../utils/bcrypt.util'
import { generateToken } from '../../utils/jwt.util'

interface LoginRequest {
  email: string
  password: string
}

export class AuthController {
  private repository = AppDataSource.getRepository(User)

  public login = async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginRequest

    if (!email || !password)
      return res
        .status(400)
        .send(new ApiResponseDto(false, 'Bad request', null))

    const user = await this.repository.findOneBy({ email })

    if (!user)
      return res
        .status(404)
        .send(new ApiResponseDto(false, 'Usuario no encontrado', null))

    if (user.role !== 'admin' && user.role !== 'super')
      return res
        .status(403)
        .send(new ApiResponseDto(false, 'Unauthorized', null))

    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid)
      return res
        .status(401)
        .send(new ApiResponseDto(false, 'Contraseña invalida', null))

    res.send(
      new ApiResponseDto(true, 'Login success!', {
        token: generateToken({ userId: String(user.id), role: user.role })
      })
    )
  }
}
