// src/modules/payment-methods/dto/create-payment-method.dto.ts

import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class CreatePaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;
}
