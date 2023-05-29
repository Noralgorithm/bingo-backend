import { Request, Response } from 'express'
import { Brackets, Repository } from 'typeorm'
import AppDataSource from '../../database/connection'
import { Room } from '../../models/room.entity'
import { Pagination } from '../shared/types'
import { ApiResponseDto } from '../../utils/api_response_dto.util'
import { getErrorMessage } from '../../utils/get_error_message.util'

export class RoomsController {
  private repository: Repository<Room>

  constructor() {
    this.repository = AppDataSource.getRepository(Room)
  }

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
        .select(['rooms.id',
        'rooms.name',
        'rooms.bingos_amount',
        'rooms.lines_amount',
        'rooms.bingo_prize',
        'rooms.line_prize',
        'rooms.is_premium',
        'rooms.card_price',
        'rooms.frequency'])
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
}
