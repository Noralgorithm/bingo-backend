import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'rooms' })
export class Room {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'text', unique: true })
  name: string

  @Column({ type: 'smallint' })
  bingos_amount: number

  @Column({ type: 'smallint' })
  lines_amount: number

  @Column({ type: 'smallint' })
  bingo_prize: number

  @Column({ type: 'smallint' })
  line_prize: number

  @Column({ type: 'boolean' })
  is_premium: boolean

  @Column({ type: 'smallint' })
  card_price: number

  @Column({ type: 'text' })
  frequency: string
}