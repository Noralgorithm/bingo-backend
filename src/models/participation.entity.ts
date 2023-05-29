import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm'
import { User } from './user.entity'
import { Room } from './room.entity'
import { Card } from './card.entity'

@Entity({ name: 'participations' })
export class Participation {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, user => user.participations)
  user: User

  @ManyToOne(() => Room, room => room.participations)
  room: Room

  @OneToMany(() => Card, card => card.participation)
  cards: Card[]
}
