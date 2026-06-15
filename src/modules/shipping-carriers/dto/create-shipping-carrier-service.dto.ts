import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class CreateShippingCarrierServiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  estimatedDeliveryText?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;
}
