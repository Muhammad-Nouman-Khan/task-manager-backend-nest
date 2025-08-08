import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { OmitType } from '@nestjs/mapped-types';

// Do not allow changing createdByUserId through update
export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['createdByUserId'] as const),
) {}
