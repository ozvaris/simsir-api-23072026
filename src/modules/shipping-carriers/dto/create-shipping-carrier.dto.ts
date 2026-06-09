// src/modules/shipping-carriers/dto/create-shipping-carrier.dto.ts

import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class CreateShippingCarrierDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string;

  @IsNumber()
  @Min(0)
  fee!: number;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;
}
