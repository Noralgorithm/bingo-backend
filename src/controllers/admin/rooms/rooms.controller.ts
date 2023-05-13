import { Request, Response } from 'express'
import { ApiResponseDto } from '../../../utils/api_response_dto.util'
import { getErrorMessage } from '../../../utils/get_error_message.util'
import { Room } from '../../../models/room.entity'
import { Brackets } from 'typeorm'
import { Pagination } from '../../shared/types'
import { CronJob } from 'cron'
import { Repository } from 'typeorm'
import AppDataSource from '../../../database/connection'

export class RoomsController {
  private cronJobs: Array<{ id: number; cronJob: CronJob }>
  private repository: Repository<Room>

  public init = async () => {
    try {
      this.repository = AppDataSource.getRepository(Room)

      const rooms = await this.repository
        .createQueryBuilder('rooms')
        .select('rooms')
        .getMany()
      this.cronJobs = rooms.map(room => {
        const cronJob = new CronJob(
          room.frequency,
          () => {
            console.log(`Ejecutada sala ${room.name} de id: ${room.id}`)
          },
          () => {
            console.log(
              `Detenida la ejecución de la sala ${room.name} de id: ${room.id}`
            )
          }
        )
        return {
          id: room.id,
          cronJob
        }
      })
      this.cronJobs.forEach(cronJob => cronJob.cronJob.start())
    } catch (e) {
      console.log('Error initializing CronJobs...')
    }
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

      const newCronJob = {
        id: data.id,
        cronJob: new CronJob(
          data.frequency,
          () => {
            console.log(`Ejecutada sala ${data.name} con el id: ${data.id}`)
          },
          null,
          true
        )
      }

      this.cronJobs.push(newCronJob)

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

      this.cronJobs.filter(cronJob => cronJob.id === Number(roomId))[0].cronJob.stop()
      this.cronJobs = this.cronJobs.filter(cronJob => cronJob.id !== Number(roomId))

      const newCronJob = {
        id: Number(roomId),
        cronJob: new CronJob(
          frequency,
          () => {
            console.log(`Ejecutada sala ${name} con el id: ${roomId}`)
          },
          null,
          true
        )
      }

      this.cronJobs.push(newCronJob)

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

      this.cronJobs.filter(cronJob => cronJob.id === Number(roomId))[0].cronJob.stop()
      this.cronJobs = this.cronJobs.filter(cronJob => cronJob.id !== Number(roomId))

      console.log(this.cronJobs)
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
