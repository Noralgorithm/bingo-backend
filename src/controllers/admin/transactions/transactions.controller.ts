import { Request, Response } from 'express'
import { TransactionService } from '../../../services/transactions.service'
import AppDataSource from '../../../database/connection'
import { User } from '../../../models/user.entity'
import { Transaction } from '../../../models/transaction.entity'
import { ApiResponseDto } from '../../../utils/api_response_dto.util'

export class TransactionsController {
  private usersRepository = AppDataSource.getRepository(User)
  private transactionsRepository = AppDataSource.getRepository(Transaction)

  private transactionService = new TransactionService(
    this.usersRepository,
    this.transactionsRepository
  )

  public createTransaction = async (req: Request, res: Response) => {
    try {
      const { targetUserId, amount } = req.body
      await this.transactionService.createTransaction(targetUserId, amount)

      return res.send(
        new ApiResponseDto(true, 'Succesfully created transaction!', null)
      )
    } catch (e) {
      return res.send(
        new ApiResponseDto(false, 'Error creating transaction!', null)
      )
    }
  }
}
