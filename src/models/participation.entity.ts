import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm'
import { User } from './user.entity'
import { Card } from './card.entity'
import { Game } from './game.entity'

@Entity({ name: 'participations' })
export class Participation {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, user => user.participations)
  user: User

  @ManyToOne(() => Game, game => game.participations)
  game: Game

  @OneToMany(() => Card, card => card.participation)
  cards: Card[]
}
