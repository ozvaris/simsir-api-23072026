import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class ListCategoriesQueryDto {
  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;

  @IsOptional()
  @IsString()
  search?: string;

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
