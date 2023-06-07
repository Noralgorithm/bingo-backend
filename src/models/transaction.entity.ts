import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { User } from './user.entity'

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  amount: number

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ManyToOne(() => User, user => user.transactions)
  user: User
}
