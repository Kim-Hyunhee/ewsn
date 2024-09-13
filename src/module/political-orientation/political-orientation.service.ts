import { Injectable, BadRequestException } from '@nestjs/common';
import { PoliticalOrientationRepository } from './political-orientation.repository';

@Injectable()
export class PoliticalOrientationService {
  constructor(private repository: PoliticalOrientationRepository) {}

  async fetchPoliticalOrientation({
    politicalOrientationId,
  }: {
    politicalOrientationId: number;
  }) {
    const politicalOrientation = await this.repository.findPoliticalOrientation(
      {
        id: politicalOrientationId,
      },
    );
    if (!politicalOrientation) {
      throw new BadRequestException('선택한 정치 성향이 존재하지 않습니다.');
    }

    return politicalOrientation;
  }

  async fetchManyPoliticalOrientation() {
    return await this.repository.findManyPoliticalOrientation();
  }
}
