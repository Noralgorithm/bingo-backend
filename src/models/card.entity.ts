import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm'
import { Participation } from './participation.entity'

@Entity({ name: 'cards' })
export class Card {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'jsonb',
  })
  card: number[][]

  @ManyToOne(() => Participation, participation => participation.cards)
  participation: Participation
}
