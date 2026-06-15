import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { PaymentMethodCode } from '../../../common/enums/payment-method-code.enum';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class CreateShippingCarrierServicePaymentCapabilityDto {
  @IsEnum(PaymentMethodCode)
  paymentMethod!: PaymentMethodCode;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fee?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxOrderAmount?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;
}
