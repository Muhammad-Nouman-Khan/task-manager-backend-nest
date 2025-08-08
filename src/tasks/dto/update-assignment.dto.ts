import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAssignmentDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
