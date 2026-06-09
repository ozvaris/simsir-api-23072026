import { ArrayNotEmpty, IsArray, IsString, MaxLength } from 'class-validator';

export class AssignRolesToUserDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  roleCodes!: string[];
}
