import { Request, Response } from 'express'
import { User } from '../../../models/user.entity'
import AppDataSource from '../../../database/connection'
import { ApiResponseDto } from '../../../utils/api_response_dto.util'
import { CreateUserRequest } from '../../shared/users.types'
import { getErrorMessage } from '../../../utils/get_error_message.util'
import { hashPassword } from '../../../utils/bcrypt.util'
import { Pagination } from '../../shared/types'
import { Brackets } from 'typeorm'
export class UsersController {
  private repository = AppDataSource.getRepository(User)

  public findAll = async (req: Request, res: Response) => {
    try {
      const currentPage = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.pageSize as string) || 10
      const userType = req.query.userType as string | undefined
      const search = req.query.search as string | undefined
  
      const queryBuilder = this.repository.createQueryBuilder('user')
  
      if (userType) {
        queryBuilder.where('user.type = :userType', { userType })
      }
  
      if (search) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('user.nickname ILIKE :search', { search: `%${search}%` })
            qb.orWhere('user.email ILIKE :search', { search: `%${search}%` })
          })
        )
      }
  
      const [users, total] = await queryBuilder
        .orderBy('user.id', 'ASC')
        .skip((currentPage - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount()
  
      const pageCount = Math.ceil(total / pageSize)
      const hasPreviousPage = currentPage > 1
      const hasNextPage = currentPage < pageCount
  
      const pagination: Pagination = {
        total: users.length,
        pageSize,
        pageCount,
        currentPage,
        hasPreviousPage,
        hasNextPage,
      }
  
      res.send(
        new ApiResponseDto(true, 'Users fetched successfully!', {
          users,
          pagination
        })
      )
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
