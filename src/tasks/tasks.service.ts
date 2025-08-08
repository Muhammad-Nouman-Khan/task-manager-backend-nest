import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task, TaskOverallStatus, TaskPriority } from './entities/task.entity';
import { Repository } from 'typeorm';
import { TaskAssignment } from './entities/task-assignment.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskAssignment)
    private readonly assignmentRepo: Repository<TaskAssignment>,
  ) {}

  async createTask(dto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepo.create({
      title: dto.title,
      description: dto.description ?? null,
      priority: dto.priority ?? TaskPriority.MEDIUM,
      overallStatus: dto.overallStatus ?? TaskOverallStatus.PENDING,
      createdByUserId: dto.createdByUserId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
    });
    return this.taskRepo.save(task);
  }

  async updateTask(id: number, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    // Merges the existing entity with the new DTO data
    const updatedTask = this.taskRepo.merge(task, dto);
    return this.taskRepo.save(updatedTask);
  }

  async removeTask(id: number): Promise<void> {
    const result = await this.taskRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Task not found');
  }

  async findAll(
    query: QueryTasksDto,
  ): Promise<{ data: Task[]; total: number }> {
    const qb = this.taskRepo.createQueryBuilder('t');

    if (query.overallStatus)
      qb.andWhere('t.overallStatus = :overallStatus', {
        overallStatus: query.overallStatus,
      });
    if (query.priority)
      qb.andWhere('t.priority = :priority', { priority: query.priority });
    if (query.createdByUserId)
      qb.andWhere('t.createdByUserId = :createdByUserId', {
        createdByUserId: query.createdByUserId,
      });

    if (query.assignedToUserId) {
      qb.innerJoin(
        'task_assignments',
        'a',
        'a.taskId = t.id AND a.userId = :uid',
        { uid: query.assignedToUserId },
      );
    }

    qb.orderBy('t.createdAt', 'DESC');

    const take = query.take ?? 20;
    const skip = query.skip ?? 0;

    qb.take(take).skip(skip);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async findOneWithAssignments(
    id: number,
  ): Promise<Task & { assignments: TaskAssignment[] }> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: { assignments: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }
}
