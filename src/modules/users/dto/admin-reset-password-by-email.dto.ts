import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminResetPasswordByEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string;
}
