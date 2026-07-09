import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class UpdateStorefrontCollectionItemDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;
}
