import { Request, Response } from 'express'
import { Brackets, Repository } from 'typeorm'
import AppDataSource from '../../database/connection'
import { Room } from '../../models/room.entity'
import { Transaction } from '../../models/transaction.entity'
import { Pagination } from '../shared/types'
import { ApiResponseDto } from '../../utils/api_response_dto.util'
import { getErrorMessage } from '../../utils/get_error_message.util'
import { Participation } from '../../models/participation.entity'
import { User } from '../../models/user.entity'
import { Card } from '../../models/card.entity'
import { BingoController } from '../shared/bingo/bingo.controller'

export class RoomsController {
  private roomsRepository: Repository<Room>
  private participationsRepository: Repository<Participation>
  private usersRepository: Repository<User>
  private bingoController: BingoController

  constructor() {
    this.roomsRepository = AppDataSource.getRepository(Room)
    this.participationsRepository = AppDataSource.getRepository(Participation)
    this.usersRepository = AppDataSource.getRepository(User)
    this.bingoController = new BingoController(5, 5)
  }

  public findAll = async (req: Request, res: Response) => {
    try {
      console.log(req.body)
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
        .select([
          'rooms.id',
          'rooms.name',
          'rooms.bingos_amount',
          'rooms.lines_amount',
          'rooms.bingo_prize',
          'rooms.line_prize',
          'rooms.is_premium',
          'rooms.card_price',
          'rooms.frequency'
        ])
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

  public getUserCards = async (req: Request, res: Response) => {
    try {
      const { userId } = req.body
      const { roomId } = req.params
      const participations = await this.participationsRepository.find({
        where: {
          user: { id: userId },
          room: { id: Number(roomId) }
        },
        relations: ['cards']
      })
      const cards = participations.flatMap(participation => participation.cards)
      res.send(
        new ApiResponseDto(true, 'User cards fetched successfully!', {
          cards
        })
      )
    } catch (e) {
      res.send(
        new ApiResponseDto(
          false,
          'Error while fetching user cards!',
          getErrorMessage(e)
        )
      )
    }
  }

  public sellCards = async (req: Request, res: Response) => {
    try {
      const { userId } = req.body
      const { roomId } = req.params
      const { quantity } = req.body

      const room = await this.roomsRepository.findOneBy({ id: Number(roomId) })

      if (!room) {
        throw new Error(`Room with id ${roomId} not found`)
      }

      const totalPrice = room.card_price * quantity
      
      const user = await this.usersRepository.findOneBy({
        id: userId
      })

      if (!user) {
        throw new Error(`User with id ${userId} not found`)
      }

      if (user.credits < totalPrice) {
        throw new Error(
          `User does not have enough credits to buy ${quantity} cards`
        )
      }

      let participation = await this.participationsRepository.findOne({
        where: {
          user: { id: userId },
          room: { id: Number(roomId) }
        },
        relations: ['cards']
      })

      if (!participation) {
        participation = await this.participationsRepository.save({
          user: { id: userId },
          room: { id: Number(roomId) }
        })
      }

      await AppDataSource.transaction(async transactionManager => {
        const transaction = new Transaction()
        transaction.amount = totalPrice * -1
        transaction.user = user
        
        await transactionManager.save(user)
        await transactionManager.save(transaction)

        for (let i = 0; i < quantity; i++) {
          const card = new Card()
          card.participation = participation as Participation
          card.card = this.bingoController.generateCard()
          await transactionManager.save(card)
        }
      })

      res.send(new ApiResponseDto(true, 'Cards sold successfully!', null))
    } catch (e) {
      res.send(
        new ApiResponseDto(
          false,
          'Error while selling cards!',
          getErrorMessage(e)
        )
      )
    }
  }
}
