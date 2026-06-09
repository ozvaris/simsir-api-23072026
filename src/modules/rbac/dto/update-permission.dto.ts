import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RbacStatus } from '../enums/rbac-status.enum';

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  resource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  action?: string;

  @IsOptional()
  @IsEnum(RbacStatus)
  status?: RbacStatus;
}
