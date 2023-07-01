import { Request, Response } from 'express'
import { ApiResponseDto } from '../../../utils/api_response_dto.util'
import { getErrorMessage } from '../../../utils/get_error_message.util'
import { Room } from '../../../models/room.entity'
import { Brackets } from 'typeorm'
import { Pagination } from '../../shared/types'
import { CronJob } from 'cron'
import { Repository } from 'typeorm'
import AppDataSource from '../../../database/connection'
import isCronExpressionValid from '../../../utils/cron_expressions_checker.util'
import { BingoController } from '../../shared/bingo/bingo.controller'
import { Game } from '../../../models/game.entity'

export class RoomsController {
  private cronJobs: Array<{ id: number; cronJob: CronJob }>
  private roomsRepository: Repository<Room>
  private gamesRepository: Repository<Game>
  private bingoController: BingoController

  public init = async () => {
    try {
      this.gamesRepository = AppDataSource.getRepository(Game)
      this.roomsRepository = AppDataSource.getRepository(Room)
      this.bingoController = new BingoController(5, 5)

      const rooms = await this.roomsRepository
        .createQueryBuilder('rooms')
        .select('rooms')
        .getMany()

      this.cronJobs = await Promise.all(
        rooms.map(async room => {
          return await this.createCronJob(room)
        })
      )
    } catch (e) {
      console.log('Error initializing CronJobs...')
    }
  }

  public findAll = async (req: Request, res: Response) => {
    try {
      const currentPage = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.pageSize as string) || 10
      const search = req.query.search as string | undefined

      const queryBuilder = this.roomsRepository.createQueryBuilder('rooms')

      if (search) {
        queryBuilder.andWhere(
          new Brackets(qb => {
            qb.where('rooms.name ILIKE :search', { search: `%${search}%` })
          })
        )
      }

      const [rooms, total] = await queryBuilder
        .select()
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
        !card_price ||
        !isCronExpressionValid(frequency)
      )
        return res
          .status(400)
          .send(new ApiResponseDto(false, 'Bad request', null))

      const room = this.roomsRepository.create({
        name,
        bingos_amount,
        lines_amount,
        bingo_prize,
        line_prize,
        is_premium,
        card_price,
        frequency
      })

      const data = await this.roomsRepository.save(room)
      await this.generateGame(data.id)

      const newCronJob = await this.createCronJob(data)
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

      if (
        !name ||
        !bingos_amount ||
        !lines_amount ||
        !bingo_prize ||
        !line_prize ||
        !card_price ||
        !isCronExpressionValid(frequency)
      )
        return res
          .status(400)
          .send(new ApiResponseDto(false, 'Bad request', null))

      const updatedData = {
        name,
        bingos_amount,
        lines_amount,
        bingo_prize,
        line_prize,
        is_premium,
        card_price,
        frequency
      } as Room

      const queryResult = await this.roomsRepository
        .createQueryBuilder('room')
        .update(Room)
        .set(updatedData)
        .where('id = :id', { id: roomId })
        .execute()

      if (queryResult.affected === 0) throw new Error('Room not found!')

      this.cronJobs
        .filter(cronJob => cronJob.id === Number(roomId))[0]
        .cronJob.stop()
      this.cronJobs = this.cronJobs.filter(
        cronJob => cronJob.id !== Number(roomId)
      )

      updatedData.id = Number(roomId)

      const newCronJob = await this.createCronJob(updatedData)
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

      const queryResult = await this.roomsRepository
        .createQueryBuilder('room')
        .delete()
        .from(Room)
        .where('id = :id', { id: roomId })
        .execute()

      if (queryResult.affected === 0) throw new Error('Room not found!')

      this.cronJobs
        .filter(cronJob => cronJob.id === Number(roomId))[0]
        .cronJob.stop()
      this.cronJobs = this.cronJobs.filter(
        cronJob => cronJob.id !== Number(roomId)
      )

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

  private generateGame = async (roomId: number) => {
    try {
      const room = await this.roomsRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.games', 'game')
        .where('room.id = :id', { id: roomId })
        .getOne()
      if (!room) throw new Error('Room not found!')

      const nextGameBalls = this.bingoController.generateBalls()

      if (room.games) {
        room.games
          .filter(game => game.played_date === null)
          .forEach(game => (game.played_date = new Date()))

        this.gamesRepository.save(room.games)
      }


      const game = new Game()
      game.game_balls = nextGameBalls
      game.room = room

      await this.gamesRepository.save(game)
    } catch (e) {
      console.log(e)
    }
  }

  private createCronJob = async (room: Room) => {
    const cronJob = new CronJob(
      room.frequency,
      async () => await this.executeRoom(room),
      null,
      true
    )

    return {
      id: room.id,
      cronJob
    }
  }

  private executeRoom = async (room: Room) => {
    this.generateGame(room.id)
    console.log(`Ejecutada sala ${room.name} de id: ${room.id}`)
  }
}
