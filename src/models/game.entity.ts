import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "./room.entity";
import { Participation } from "./participation.entity";

@Entity({ name: 'games' })
export class Game {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'smallint', array: true, nullable: true })
  game_balls: number[]
  
  @Column({ type: 'timestamptz', nullable: true })
  played_date: Date

  @ManyToOne(() => Room, room => room.games)
  room: Room

  @OneToMany(() => Participation, participation => participation.game)
  participations: Participation[]
}
