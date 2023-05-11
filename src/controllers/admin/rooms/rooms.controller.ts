import { Request, Response } from 'express'
import { ApiResponseDto } from '../../../utils/api_response_dto.util'
import { getErrorMessage } from '../../../utils/get_error_message.util'
import AppDataSource from '../../../database/connection'
import { Room } from '../../../models/room.entity'
import { Brackets } from 'typeorm'
import { Pagination } from '../../shared/types'

export class RoomsController {
  private repository = AppDataSource.getRepository(Room)

  public findAll = async (req: Request, res: Response) => {
    try {
      const currentPage = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.pageSize as string) || 10
      const search = req.query.search as string | undefined

      const queryBuilder = this.repository.createQueryBuilder('rooms')

      if (search) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('rooms.name ILIKE :search', { search: `%${search}%` })
          })
        )
      }

      const [rooms, total] = await queryBuilder
        .orderBy('rooms.id', 'ASC')
        .skip((currentPage - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount()

      const pageCount = Math.ceil(total / pageSize)
      const hasPreviousPage = currentPage > 1
      const hasNextPage = currentPage < pageCount

      const pagination: Pagination = {
        total: rooms.length,
        pageSize,
        pageCount,
        currentPage,
        hasPreviousPage,
        hasNextPage
      }

      res.send(
        new ApiResponseDto(true, 'Rooms fetched successfully!', {
          rooms,
          pagination
        })
      )
    } catch (e) {
      res.send(
        new ApiResponseDto(
          false,
          'Error while fetching rooms!',
          getErrorMessage(e)
        )
      )
    }
  }

  public create = async (req: Request, res: Response) => {
    try {
      const {
        name,
        bingos_amount,
        lines_amount,
        bingo_prize,
        line_prize,
        is_premium,
        card_price,
        frequency
      } = req.body as Room

      if (
        !name ||
        !bingos_amount ||
        !lines_amount ||
        !bingo_prize ||
        !line_prize ||
        !is_premium ||
        !card_price ||
        !frequency
      )
        return res
          .status(400)
          .send(new ApiResponseDto(false, 'Bad request', null))

      const room = this.repository.create({
        name,
        bingos_amount,
        lines_amount,
        bingo_prize,
        line_prize,
        is_premium,
        card_price,
        frequency
      })

      const data = await this.repository.save(room)
      res.send(new ApiResponseDto(true, 'Room created successfully!', data))
    } catch (e) {
      res.send(
        new ApiResponseDto(
          false,
          'Error while creating room!',
          getErrorMessage(e)
        )
      )
    }
  }

  public update = async (req: Request, res: Response) => {
    try {
      const roomId = req.params.id
      const {
        name,
        bingos_amount,
        lines_amount,
        bingo_prize,
        line_prize,
        is_premium,
        card_price,
        frequency
      } = req.body as Room

      const updatedData = {
        name,
        bingos_amount,
        lines_amount,
        bingo_prize,
        line_prize,
        is_premium,
        card_price,
        frequency
      }

      const queryResult = await this.repository
        .createQueryBuilder('room')
        .update(Room)
        .set(updatedData)
        .where('id = :id', { id: roomId })
        .execute()

      if (queryResult.affected === 0) throw new Error('Room not found!')
      res.send(
        new ApiResponseDto(true, 'Room updated successfully!', queryResult)
      )
    } catch (e) {
      res.send(
        new ApiResponseDto(
          false,
          'Error while updating room!',
          getErrorMessage(e)
        )
      )
    }
  }

  public delete = async (req: Request, res: Response) => {
    try {
      const roomId = req.params.id

      const queryResult = await this.repository
        .createQueryBuilder('room')
        .delete()
        .from(Room)
        .where('id = :id', { id: roomId })
        .execute()

      if (queryResult.affected === 0) throw new Error('Room not found!')
      res.send(
        new ApiResponseDto(true, 'Room deleted successfully!', queryResult)
      )
    } catch (e) {
      res.send(
        new ApiResponseDto(
          false,
          'Error while deleting room!',
          getErrorMessage(e)
        )
      )
    }
  }
}
