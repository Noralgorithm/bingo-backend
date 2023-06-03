import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  AfterLoad
} from 'typeorm'
import { Participation } from './participation.entity'
import { Transaction } from './transaction.entity'
import AppDataSource from '../database/connection'

export type UserRoleType = 'client' | 'admin' | 'super'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: '30' })
  name: string

  @Column({ type: 'varchar', length: '15', unique: true })
  nickname: string

  @Column({ type: 'varchar', length: '30', unique: true })
  email: string

  @Column({ type: 'char', length: '60' })
  password: string

  @Column({
    type: 'enum',
    enum: ['client', 'admin', 'super'],
    default: 'client'
  })
  role: UserRoleType

  @OneToMany(() => Participation, participation => participation.user)
  participations: Participation[]

  @OneToMany(() => Transaction, transaction => transaction.user, { eager: true })
  transactions: Transaction[]

  @Column({ default: 0 })
  credits: number

  @AfterLoad()
  async computeTotalTransactions() {
    const transactionsRepository = AppDataSource.getRepository(Transaction)
    const sum = await transactionsRepository.createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'sum')
      .where('transaction.user = :userId', { userId: this.id })
      .getRawOne();

    this.credits = Number(sum.sum) || 0;
  }
}
