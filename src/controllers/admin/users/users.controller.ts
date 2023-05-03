import { Request, Response } from 'express'
import { User } from '../../../models/user.entity'
import AppDataSource from '../../../database/connection'
import { ApiResponseDto } from '../../../utils/api_response_dto.util'
import { CreateUserRequest } from '../../shared/users.types'
import { getErrorMessage } from '../../../utils/get_error_message.util'
import { hashPassword } from '../../../utils/bcrypt.util'

export class UsersController {
  private repository = AppDataSource.getRepository(User)

  public findAll = async (_req: Request, res: Response) => {
    try {
      const users = await this.repository.find({ order: { id: 'ASC' } })
      res.send(new ApiResponseDto(true, 'Users fetched successfully!', users))
    } catch (e) {
      res.send(
        new ApiResponseDto(
          false,
          'Error while fetching users!',
          getErrorMessage(e)
        )
      )
    }
  }

  public findOne = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id
      const user = await this.repository
        .createQueryBuilder('user')
        .where('user.id = :id', { id: userId })
        .getOne()
      if (!user) throw new Error('User not found!')
      res.send(new ApiResponseDto(true, 'User fetched successfully!', user))
    } catch (e) {
      res.send(
        new ApiResponseDto(
          false,
          'Error while fetching user!',
          getErrorMessage(e)
        )
      )
    }
  }

  public create = async (req: Request, res: Response) => {
    try {
      const { name, nickname, email, password, role } =
        req.body as CreateUserRequest

      if (!name || !nickname || !email || !password)
        return res
          .status(400)
          .send(new ApiResponseDto(false, 'Bad request', null))

      const hashedPassword = await hashPassword(password)

      const user = this.repository.create({
        name,
        nickname,
        email,
        password: hashedPassword,
        role
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

  public update = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id
      const { name, nickname, email, password, role } =
        req.body as CreateUserRequest
      const updatedData = { name, nickname, email, password, role }
      const queryResult = await this.repository
        .createQueryBuilder('user')
        .update(User)
        .set(updatedData)
        .where('id = :id', { id: userId })
        .execute()
      if (queryResult.affected === 0) throw new Error('User not found!')
      res.send(
        new ApiResponseDto(true, 'User updated successfully!', queryResult)
      )
    } catch (e) {
      res.send(
        new ApiResponseDto(
          false,
          'Error while updating user!',
          getErrorMessage(e)
        )
      )
    }
  }

  public delete = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id
      const queryResult = await this.repository
        .createQueryBuilder('user')
        .delete()
        .from(User)
        .where('id = :id', { id: userId })
        .execute()
      if (queryResult.affected === 0) throw new Error('User not found!')
      res.send(
        new ApiResponseDto(true, 'User deleted successfully!', queryResult)
      )
    } catch (e) {
      res.send(
        new ApiResponseDto(
          false,
          'Error while deleting user!',
          getErrorMessage(e)
        )
      )
    }
  }
}
