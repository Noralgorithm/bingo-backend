import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToMany } from 'typeorm'
import { Participation } from './participation.entity'
import { Victory } from './victory.entity'

@Entity({ name: 'cards' })
export class Card {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'jsonb'
  })
  card: number[][]

  @ManyToOne(() => Participation, participation => participation.cards)
  participation: Participation

  @OneToMany(() => Victory, victory => victory.card)
  victories: Victory[]
}
