import { Repository } from 'typeorm'
import { User } from '../../models/user.entity'
import { Request, Response } from 'express'
import { ApiResponseDto } from '../../utils/api_response_dto.util'
import { Participation } from '../../models/participation.entity'
import { ObtainParticipationsService } from '../../services/participations/obtain-participations.service'
import { Victory } from '../../models/victory.entity'
import { Card } from '../../models/card.entity'

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

  public async getUserParticipations(req: Request, res: Response) {
    try {
      const { userId } = req.body

      const participationsRepository =
        this.userRepository.manager.getRepository(Participation)
      const victoriesRepository =
        this.userRepository.manager.getRepository(Victory)
      const cardsRepository = this.userRepository.manager.getRepository(Card)

      const participations = await new ObtainParticipationsService(
        participationsRepository,
        victoriesRepository,
        cardsRepository
      ).execute(userId)

      res.send(
        new ApiResponseDto(true, 'User fetched successfully', participations)
      )
    } catch (error) {
      console.log(error)
      res
        .status(400)
        .send(new ApiResponseDto(false, 'Error getting user info', error))
    }
  }
}
