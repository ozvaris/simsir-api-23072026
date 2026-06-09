import { ArrayNotEmpty, IsArray, IsString, MaxLength } from 'class-validator';

export class AssignPermissionsToRoleDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  permissionCodes!: string[];
}
