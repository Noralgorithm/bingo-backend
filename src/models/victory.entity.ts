import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Card } from './card.entity'

export type victory = 'no' | 'bingo' | 'line'

@Entity()
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

  @ManyToOne(() => Card, card => card.victories)
  card: Card
}
