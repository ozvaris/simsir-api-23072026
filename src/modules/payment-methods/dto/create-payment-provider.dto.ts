import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { PaymentProviderType } from '../../../common/enums/payment-provider-type.enum';
import { RecordStatus } from '../../../common/enums/record-status.enum';

export class CreatePaymentProviderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string;

  @IsEnum(PaymentProviderType)
  providerType!: PaymentProviderType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  logoUrl?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsEnum(RecordStatus)
  status?: RecordStatus;
}
