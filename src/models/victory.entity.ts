import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Card } from './card.entity'

export type victory = 'not' | 'bingo' | 'row' | 'column' | 'diagonal'
export type DBvictory = 'not' | 'bingo' | 'line'

@Entity({ name: 'victories' })
export class Victory {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'enum',
    enum: ['not', 'bingo', 'line'],
    default: 'not'
  })
  victoryType: DBvictory

  @Column({ nullable: true })
  victoryTurn: number

  @ManyToOne(() => Card, (card: Card) => card.victories)
  card: Card
}
