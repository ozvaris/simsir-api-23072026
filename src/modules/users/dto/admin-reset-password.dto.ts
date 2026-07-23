import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}
