import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm'
import { Participation } from './participation.entity'

@Entity({ name: 'cards' })
export class Card {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'jsonb',
    transformer: {
      from: (value: string) => JSON.parse(value),
      to: (value: number[]) => JSON.stringify(value)
    }
  })  

  @ManyToOne(() => Participation, participation => participation.cards)
  participation: Participation
}
