import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class CreateCategoryDto {
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  slug!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imgUrl?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;
}
