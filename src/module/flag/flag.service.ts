import { BadRequestException, Injectable } from '@nestjs/common';
import { FlagRepository } from './flag.repository';

@Injectable()
export class FlagService {
  constructor(private repository: FlagRepository) {}

  async createFlag({
    purpose,
    name,
    term,
    numberOfPeople,
    content,
    materials,
    phoneNumber,
    isPermitted,
    email,
  }: {
    purpose: string;
    name: string;
    term: string;
    numberOfPeople: number;
    content: string;
    materials: string;
    isPermitted: string;
    phoneNumber: string;
    email: string;
  }) {
    const status = '신청완료';

    return await this.repository.insertFlag({
      purpose,
      name,
      term,
      numberOfPeople,
      content,
      materials,
      phoneNumber,
      isPermitted,
      email,
      status,
    });
  }

  async fetchFlag({ flagId }: { flagId: number }) {
    const flag = await this.repository.findFlag({ id: flagId });
    if (!flag) {
      throw new BadRequestException('신청한 깃발이 없습니다.');
    }

    return flag;
  }

  async fetchManyFlag({ page }: { page?: number }) {
    return await this.repository.findManyFlag({ page });
  }

  async modifyFlagStatus({
    flagId,
    status,
  }: {
    flagId: number;
    status: string;
  }) {
    await this.fetchFlag({ flagId });

    return await this.repository.updateFlag({
      where: { id: flagId },
      data: { status },
    });
  }
}
