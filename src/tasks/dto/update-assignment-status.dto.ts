import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaskIndividualStatus } from '../entities/task-assignment.entity';

export class UpdateAssignmentStatusDto {
  @IsEnum(TaskIndividualStatus)
  status: TaskIndividualStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
