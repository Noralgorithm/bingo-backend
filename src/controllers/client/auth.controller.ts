import { Request, Response } from 'express'
import AppDataSource from '../../database/connection'
import { User } from '../../models/user.entity'
import { ApiResponseDto } from '../../utils/api_response_dto.util'
import { comparePassword, hashPassword } from '../../utils/bcrypt.util'
import { generateToken } from '../../utils/jwt.util'
import { CreateUserRequest } from '../shared/users.types'
import { getErrorMessage } from '../../utils/get_error_message.util'

interface LoginRequest {
  email: string
  password: string
}

export class AuthController {
  private repository = AppDataSource.getRepository(User)

  public login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body as LoginRequest

      if (!email || !password)
        return res
          .status(400)
          .send(new ApiResponseDto(false, 'Bad request', null))

      const user = await this.repository.findOneBy({
        email: email.toLowerCase()
      })

      if (!user)
        return res
          .status(404)
          .send(new ApiResponseDto(false, 'Usuario no encontrado', null))

      const isPasswordValid = await comparePassword(password, user.password)

      if (!isPasswordValid)
        return res
          .status(401)
          .send(new ApiResponseDto(false, 'Contraseña invalida', null))

      res.send(
        new ApiResponseDto(true, 'Login success!', {
          token: generateToken({ userId: String(user.id), role: user.role }),
          ...user
        })
      )
    } catch (e) {
      res
        .status(500)
        .send(new ApiResponseDto(false, 'Error', getErrorMessage(e)))
    }
  }

  public register = async (req: Request, res: Response) => {
    try {
      const { name, nickname, email, password } = req.body as CreateUserRequest

      if (!name || !nickname || !email || !password)
        return res
          .status(400)
          .send(new ApiResponseDto(false, 'Bad request', null))

      const hashedPassword = await hashPassword(password)

      const user = this.repository.create({
        name,
        nickname,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'client'
      })

      const data = await this.repository.save(user)
      res.send(new ApiResponseDto(true, 'User created successfully!', data))
    } catch (e) {
      res.send(
        new ApiResponseDto(
          false,
          'Error while creating user!',
          getErrorMessage(e)
        )
      )
    }
  }
}
