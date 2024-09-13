import { BadRequestException, Injectable } from '@nestjs/common';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
  constructor(private repository: CategoryRepository) {}

  async fetchManyCategory({ isAdmin }: { isAdmin: boolean }) {
    const onlyAdmin = !isAdmin ? false : undefined;

    return await this.repository.findManyCategory({ onlyAdmin });
  }

  async fetchCategory({
    categoryId,
    isAdmin,
  }: {
    categoryId: number;
    isAdmin: boolean;
  }) {
    const onlyAdmin = !isAdmin ? false : undefined;

    const category = await this.repository.findCategory({
      id: categoryId,
      onlyAdmin,
    });
    if (!category) {
      throw new BadRequestException('작성할 수 없는 게시판입니다.');
    }

    return category;
  }
}
