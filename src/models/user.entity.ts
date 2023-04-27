import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

export type UserRoleType = 'client' | 'admin'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: '20' })
  name: string

  @Column({ type: 'varchar', length: '10', unique: true })
  nickname: string

  @Column({ type: 'varchar', length: '20', unique: true })
  email: string

  @Column({ type: 'varchar', length: '20' })
  password: string

  @Column({ type: 'enum', enum: ['client', 'admin'], default: 'client' })
  role: UserRoleType
}
