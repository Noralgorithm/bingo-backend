import { Request, Response } from 'express'
import { Brackets, IsNull, Repository } from 'typeorm'
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
import { Game } from '../../models/game.entity'
import { Victory } from '../../models/victory.entity'

export class RoomsController {
  private roomsRepository: Repository<Room>
  private participationsRepository: Repository<Participation>
  private usersRepository: Repository<User>
  private gamesRepository: Repository<Game>
  private cardsRepository: Repository<Card>
  private bingoController: BingoController
  constructor() {
    this.cardsRepository = AppDataSource.getRepository(Card)
    this.gamesRepository = AppDataSource.getRepository(Game)
    this.roomsRepository = AppDataSource.getRepository(Room)
    this.participationsRepository = AppDataSource.getRepository(Participation)
    this.usersRepository = AppDataSource.getRepository(User)
    this.bingoController = new BingoController(5, 5)
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

  public findOne = async (req: Request, res: Response) => {
    try {
      const roomId = req.params.roomId

      const room = await this.roomsRepository
        .createQueryBuilder('rooms')
        .where('rooms.id = :id', { id: roomId })
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
        .getOne()

      if (!room) {
        return res.send(new ApiResponseDto(false, 'Room not found!', null))
      }

      res.send(
        new ApiResponseDto(true, 'Room fetched successfully!', {
          room
        })
      )
    } catch (e) {
      res.send(
        new ApiResponseDto(
          false,
          'Error while fetching room!',
          getErrorMessage(e)
        )
      )
    }
  }

  public getUserCards = async (req: Request, res: Response) => {
    try {
      const { userId } = req.body
      const { roomId } = req.params

      const game = await this.gamesRepository.findOne({
        where: {
          room: { id: Number(roomId) },
          played_date: IsNull()
        }
      })

      const participation = await this.participationsRepository.findOne({
        where: {
          user: { id: userId },
          game: { id: game?.id }
        },
        relations: ['cards']
      })

      const cards = participation?.cards || []
      res.send({
        success: true,
        message: 'User cards fetched successfully!',
        data: cards
      })
    } catch (error) {
      console.log(error)
      res.status(500).send({
        success: false,
        message: 'Error while fetching user cards!',
        error
      })
    }
  }

  public generateCards = async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params
      const { quantity } = req.body

      if (!quantity)
        return res
          .status(400)
          .send(new ApiResponseDto(false, 'Bad request.', req.body))

      const room = await this.roomsRepository.findOneBy({ id: Number(roomId) })

      if (!room) {
        throw new Error(`Room with id ${roomId} not found`)
      }

      const game = await this.gamesRepository.findOne({
        where: {
          room: { id: Number(roomId) },
          played_date: IsNull()
        }
      })

      if (!game) throw new Error('Error getting room game')

      const soldCards:
        | { totalCards: number; lineVictories: number; bingoVictories: number }
        | undefined = await this.roomsRepository
        .createQueryBuilder()
        .select('COUNT(DISTINCT cards.id)', 'totalCards')
        .addSelect(
          'COUNT(DISTINCT CASE WHEN victories.victoryType = :line THEN cards.id END)',
          'lineVictories'
        )
        .addSelect(
          'COUNT(DISTINCT CASE WHEN victories.victoryType = :bingo THEN cards.id END)',
          'bingoVictories'
        )
        .from(Room, 'room')
        .leftJoin('room.games', 'games')
        .leftJoin('games.participations', 'participations')
        .leftJoin('participations.cards', 'cards')
        .leftJoin('cards.victories', 'victories')
        .where('room.id = :roomId', { roomId })
        .setParameter('line', 'line')
        .setParameter('bingo', 'bingo')
        .getRawOne()

      console.log(soldCards)

      const cards: Card[] = []

      let formattedVictories: Victory[] = []

      await AppDataSource.transaction(async transactionManager => {
        for (let i = 0; i < quantity; i++) {
          const card = new Card()
          card.card = this.bingoController.generateCard()
          cards[i] = card
          const victories = this.bingoController.checkVictory(
            card.card,
            game?.game_balls
          )

          if (victories.length) {
            formattedVictories = victories.map(victory => {
              const newVictory = new Victory()
              newVictory.victoryTurn = victory.lastIndex
              newVictory.victoryType =
                victory.type !== 'bingo' && victory.type !== 'not'
                  ? 'line'
                  : victory.type
              return newVictory
            })
          }
          card.victories = formattedVictories
          await transactionManager.save(card)
        }
      })

      res.send(
        new ApiResponseDto(
          true,
          'Succesfully generated cards!',
          cards.map(card => ({ id: card.id, card: card.card }))
        )
      )
    } catch (error) {
      console.log(error)
      res.send(new ApiResponseDto(false, 'Error generating cards!', null))
    }
  }

  public buyCards = async (req: Request, res: Response) => {
    try {
      const { userId } = req.body
      const { roomId } = req.params
      const { cardsIds } = req.body as { cardsIds: number[] }

      if (
        !(
          Array.isArray(cardsIds) &&
          cardsIds.every(element => typeof element === 'number')
        )
      )
        return res
          .status(400)
          .send(new ApiResponseDto(false, 'Invalid cards argument.', null))

      const room = await this.roomsRepository.findOneBy({ id: Number(roomId) })

      if (!room) {
        throw new Error(`Room with id ${roomId} not found`)
      }

      const quantity = cardsIds.length

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

      const game = await this.gamesRepository.findOne({
        where: {
          room: { id: Number(roomId) },
          played_date: IsNull()
        }
      })

      const cards = await this.cardsRepository
        .createQueryBuilder('card')
        .where('card.id IN (:...ids)', { ids: cardsIds })
        .getMany()

      if (!cards) throw new Error('Error getting cards.')

      let participation = await this.participationsRepository.findOne({
        where: {
          user: { id: userId },
          game: { id: game?.id }
        }
      })

      if (!participation) {
        participation = await this.participationsRepository.save({
          user: { id: userId },
          game: { id: game?.id }
        })
      }

      await AppDataSource.transaction(async transactionManager => {
        const transaction = new Transaction()
        transaction.amount = totalPrice * -1
        transaction.user = user

        await transactionManager.save(user)
        await transactionManager.save(transaction)

        for (let i = 0; i < quantity; i++) {
          const card = cards[i]
          card.participation = participation as Participation
          if (game?.game_balls)
            this.bingoController.checkVictory(card.card, game?.game_balls)

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
