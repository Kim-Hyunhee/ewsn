import { Controller, Get, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentUser,
  CurrentUserPoliticalType,
} from 'src/decorators/currentUser.decorator';

@ApiTags('category')
@ApiBearerAuth('access-token')
@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  async getManyCategory() {
    return await this.categoryService.fetchManyCategory({ isAdmin: true });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/write')
  async getManyCategoryByWrite(@CurrentUser() user: CurrentUserPoliticalType) {
    return await this.categoryService.fetchManyCategory({
      isAdmin: user.isAdmin,
    });
  }
}
