export interface CreateUserRequest {
  name: string
  nickname: string
  email: string
  password: string
  role: 'client' | 'admin' | 'super'
}
