import { Repository } from 'typeorm'
import { User } from '../../models/user.entity'
import { Request, Response } from 'express'
import { ApiResponseDto } from '../../utils/api_response_dto.util'

export class UserController {
  constructor(private userRepository: Repository<User>) {}

  public async getUserInfo(req: Request, res: Response) {
    try {
      const { userId } = req.body

      const user = await this.userRepository.findOneBy({ id: userId })

      res.send(new ApiResponseDto(true, 'User fetched successfully', user))
    } catch (error) {
      res
        .status(400)
        .send(new ApiResponseDto(false, 'Error getting user info', error))
    }
  }
}
