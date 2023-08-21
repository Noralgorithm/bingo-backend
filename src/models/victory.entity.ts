import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Card } from './card.entity'

export type victory = 'no' | 'bingo' | 'row' | 'column' | 'diagonal'

@Entity({ name: 'victories' })
export class Victory {
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

  @ManyToOne(() => Card, (card: Card) => card.victories)
  card: Card
}
