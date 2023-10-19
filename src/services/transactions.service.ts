import { User } from '../models/user.entity'
import { Transaction } from '../models/transaction.entity'
import { Repository } from 'typeorm'

export class TransactionService {
  constructor(
    private usersRepository: Repository<User>,
    private transactionsRepository: Repository<Transaction>
  ) {}

  public async createTransaction(userId: number, amount: number) {
    const user = await this.usersRepository.findOneBy({
      id: userId
    })

    if (!user) {
      throw new Error(`User with id ${userId} does not exist`)
    }

    const transaction = new Transaction()
    transaction.amount = amount
    transaction.user = user
    console.log('Transaction created')
    return this.transactionsRepository.save(transaction)
  }
}
