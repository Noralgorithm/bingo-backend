import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

export type UserRoleType = 'client' | 'admin' | 'super'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: '30' })
  name: string

  @Column({ type: 'varchar', length: '15', unique: true })
  nickname: string

  @Column({ type: 'varchar', length: '30', unique: true })
  email: string

  @Column({ type: 'char', length: '60' })
  password: string

  @Column({ type: 'enum', enum: ['client', 'admin', 'super'], default: 'client' })
  role: UserRoleType
}
