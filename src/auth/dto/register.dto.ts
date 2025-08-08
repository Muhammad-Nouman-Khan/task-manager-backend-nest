import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../user/enums/role.enum';

export class RegisterDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  password: string;

  @IsOptional()
  @IsEnum(Role, { 
    message: `Role must be one of: ${Object.values(Role).join(', ')}` 
  })
  role?: Role = Role.USER; // Default role is USER
}