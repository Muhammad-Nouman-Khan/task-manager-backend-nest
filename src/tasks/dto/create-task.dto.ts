import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
  Min,
} from 'class-validator';
import { TaskOverallStatus, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsEnum(TaskOverallStatus)
  overallStatus?: TaskOverallStatus;

  @IsInt()
  @Min(1)
  createdByUserId: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
