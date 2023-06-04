import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm'
import { Participation } from './participation.entity'

export type victory = 'no' | 'bingo' | 'line'
@Entity({ name: 'cards' })
export class Card {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'enum',
    enum: ['not', 'bingo', 'line'],
    default: 'not'
  })
  victoryType: victory

  @Column({ nullable: true })
  victoryTurn: number

  @Column({
    type: 'jsonb'
  })
  card: number[][]

  @ManyToOne(() => Participation, participation => participation.cards)
  participation: Participation
}
