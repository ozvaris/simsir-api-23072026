import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { RbacStatus } from '../enums/rbac-status.enum';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @IsOptional()
  @IsEnum(RbacStatus)
  status?: RbacStatus;
}
