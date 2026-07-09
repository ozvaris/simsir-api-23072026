import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { RecordStatus } from '../../../common/enums/record-status.enum';
import { StorefrontCollectionType } from '../enums/storefront-collection-type.enum';

export class CreateStorefrontCollectionDto {
  @IsEnum(StorefrontCollectionType)
  type!: StorefrontCollectionType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  viewAllHref?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;
}
