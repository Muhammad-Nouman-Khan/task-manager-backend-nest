import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { AssignUserDto } from './dto/assign-user.dto';
import { UpdateAssignmentStatusDto } from './dto/update-assignment-status.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Task } from './entities/task.entity';
import { TaskAssignment } from './entities/task-assignment.entity';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Tasks

  @Post()
  createTask(@Body() dto: CreateTaskDto): Promise<Task> {
    return this.tasksService.createTask(dto);
  }

  @Get()
  findAll(@Query() query: QueryTasksDto) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOneWithAssignments(id);
  }

  @Patch(':id')
  updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(id, dto);
  }

  @Delete(':id')
  removeTask(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.removeTask(id);
  }

  // Assignments

  @Get(':id/assignments')
  listAssignments(
    @Param('id', ParseIntPipe) taskId: number,
  ): Promise<TaskAssignment[]> {
    return this.tasksService.listAssignments(taskId);
  }

  @Post(':id/assignments')
  assignUser(
    @Param('id', ParseIntPipe) taskId: number,
    @Body() dto: AssignUserDto,
  ) {
    return this.tasksService.assignUser(taskId, dto.userId, dto.notes);
  }

  @Delete(':id/assignments/:userId')
  unassignUser(
    @Param('id', ParseIntPipe) taskId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.tasksService.unassignUser(taskId, userId);
  }

  @Patch(':id/assignments/:userId/status')
  updateAssignmentStatus(
    @Param('id', ParseIntPipe) taskId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateAssignmentStatusDto,
  ) {
    return this.tasksService.updateAssignmentStatus(
      taskId,
      userId,
      dto.status,
      dto.notes,
    );
  }

  @Patch(':id/assignments/:userId')
  updateAssignment(
    @Param('id', ParseIntPipe) taskId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.tasksService.updateAssignment(taskId, userId, {
      notes: dto.notes,
    });
  }
}
