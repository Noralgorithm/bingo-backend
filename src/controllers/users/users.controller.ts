import { Request, Response } from 'express'
import { User } from '../../models/user.entity'
import AppDataSource from '../../database/connection'
import { ApiResponseDto } from '../../utils/api_response_dto.util'
import { CreateUserRequest } from './users.types'
import { getErrorMessage } from '../../utils/get_error_message.util'

export class UsersController {
  private repository = AppDataSource.getRepository(User)

  public findAll = async (_req: Request, res: Response) => {
    try {
      const users = await this.repository.find()
      res.send(new ApiResponseDto(true, 'Users fetched successfully!', users))
    } catch (e) {
      res.send(new ApiResponseDto(false, 'Error while fetching users!', e))
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
      const { name, nickname, email, password } = req.body as CreateUserRequest
      const user = this.repository.create({
        name: name,
        nickname: nickname,
        email: email,
        password: password
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
      const { name, nickname, email, password } = req.body as CreateUserRequest
      const updatedData = { name, nickname, email, password }
      const updatedUser = await this.repository
        .createQueryBuilder('user')
        .update(User)
        .set(updatedData)
        .where('id = :id', { id: userId })
        .execute()
      if (updatedUser.affected === 0) throw new Error('User not found!')
      res.send(
        new ApiResponseDto(true, 'User updated successfully!', updatedUser)
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

  public delete = (_req: Request, res: Response) => {
    res.send('delete')
  }
}