import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { RbacStatus } from '../enums/rbac-status.enum';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  resource!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  action!: string;

  @IsOptional()
  @IsEnum(RbacStatus)
  status?: RbacStatus;
}
