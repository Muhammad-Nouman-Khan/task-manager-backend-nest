import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { TaskOverallStatus, TaskPriority } from '../entities/task.entity';
import { Type } from 'class-transformer';

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
  @Type(() => Number)
  createdByUserId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  skip?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  take?: number;
}
