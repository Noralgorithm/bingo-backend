import { In, Repository } from 'typeorm'
import { Participation } from '../../models/participation.entity'
import { Victory } from '../../models/victory.entity'
import { Card } from '../../models/card.entity'

export class ObtainParticipationsService {
  constructor(
    private participationsRepository: Repository<Participation>,
    private victoriesRepository: Repository<Victory>,
    private cardsRepository: Repository<Card>
  ) {}

  async execute(userId: number) {
    const participations = await this.participationsRepository.find({
      where: { user: { id: userId } },
      relations: ['game', 'game.room']
    })

    const cards = await this.cardsRepository.find({
      where: { participation: In(participations.map(p => p.id)) }
    })

    const victories = await this.victoriesRepository.find({
      where: { card: In(cards.map(c => c.id)) },
      relations: ['card']
    })

    const categorizedParticipations = participations.map(p => {
      return {
        ...p,
        isVictory: victories.some(v =>
          cards.some(c => {
            return c.id === v.card.id
          })
        )
      }
    })

    return categorizedParticipations
  }
}
