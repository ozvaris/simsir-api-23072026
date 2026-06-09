import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { RbacStatus } from '../enums/rbac-status.enum';

export class ListPermissionsQueryDto {
  @IsOptional()
  @IsString()
  resource?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsEnum(RbacStatus)
  status?: RbacStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
