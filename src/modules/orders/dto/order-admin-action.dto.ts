import { IsOptional, IsString, MaxLength } from 'class-validator';

export class OrderAdminActionDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  trackingNumber?: string;
}
