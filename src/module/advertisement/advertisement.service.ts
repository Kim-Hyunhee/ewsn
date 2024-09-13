import { BadRequestException, Injectable } from '@nestjs/common';
import { AdvertisementRepository } from './advertisement.repository';

@Injectable()
export class AdvertisementService {
  constructor(private repository: AdvertisementRepository) {}

  async fetchManyAdvertisement() {
    return await this.repository.findManyAdvertisement();
  }

  async fetchAdvertisement({ advertisementId }: { advertisementId: number }) {
    const ad = await this.repository.findAdvertisement({ id: advertisementId });
    if (!ad) {
      throw new BadRequestException('광고가 존재하지 않습니다.');
    }

    return ad;
  }

  async modifyAdvertisement({
    advertisementId,
    title,
    link,
    image,
  }: {
    advertisementId: number;
    title: string;
    link: string;
    image: string;
  }) {
    await this.fetchAdvertisement({ advertisementId });

    return await this.repository.updateAdvertisement({
      where: { id: advertisementId },
      data: { title, link, image },
    });
  }
}
