import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { TaskOverallStatus, TaskPriority } from '../entities/task.entity';

export class QueryTasksDto {
  @IsOptional()
  @IsEnum(TaskOverallStatus)
  overallStatus?: TaskOverallStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsInt()
  @Min(1)
  assignedToUserId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  createdByUserId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  take?: number;
}
