// src/modules/products/dto/list-admin-products-query.dto.ts

import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class ListAdminProductsQueryDto {
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
