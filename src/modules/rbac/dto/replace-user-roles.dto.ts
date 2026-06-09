import { IsArray, IsString, MaxLength } from 'class-validator';

export class ReplaceUserRolesDto {
  @IsArray()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  roleCodes!: string[];
}
