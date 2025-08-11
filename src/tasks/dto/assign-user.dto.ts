import { IsInt, Min, IsOptional, IsString, MaxLength } from 'class-validator';

export class AssignUserDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
