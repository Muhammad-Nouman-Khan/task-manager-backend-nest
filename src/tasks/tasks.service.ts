import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task, TaskOverallStatus, TaskPriority } from './entities/task.entity';
import { Repository } from 'typeorm';
import {
  TaskAssignment,
  TaskIndividualStatus,
} from './entities/task-assignment.entity';
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

  // Assignments

  async listAssignments(taskId: number): Promise<TaskAssignment[]> {
    await this.ensureTaskExists(taskId);
    return this.assignmentRepo.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
  }

  async assignUser(
    taskId: number,
    userId: number,
    notes?: string,
  ): Promise<TaskAssignment> {
    await this.ensureTaskExists(taskId);

    const existing = await this.assignmentRepo.findOne({
      where: { taskId, userId },
    });
    if (existing)
      throw new ConflictException('User already assigned to this task');

    const assignment = this.assignmentRepo.create({
      taskId,
      userId,
      individualStatus: TaskIndividualStatus.PENDING,
      assignedAt: new Date(),
      notes: notes ?? null,
    });
    return this.assignmentRepo.save(assignment);
  }

  async unassignUser(taskId: number, userId: number): Promise<void> {
    const result = await this.assignmentRepo.delete({ taskId, userId });
    if (!result.affected) throw new NotFoundException('Assignment not found');
  }

  async updateAssignmentStatus(
    taskId: number,
    userId: number,
    status: TaskIndividualStatus,
    notes?: string,
  ) {
    const a = await this.assignmentRepo.findOne({ where: { taskId, userId } });
    if (!a) throw new NotFoundException('Assignment not found');

    a.individualStatus = status;
    if (notes !== undefined) a.notes = notes;

    if (status === TaskIndividualStatus.COMPLETED) {
      a.completedAt = a.completedAt ?? new Date();
    } else {
      a.completedAt = null;
    }

    const saved = await this.assignmentRepo.save(a);

    // Optional rollup: if all assignments are completed, set overallStatus to COMPLETED; if any in progress, set IN_PROGRESS
    await this.rollupOverallStatus(taskId);

    return saved;
  }

  async updateAssignment(
    taskId: number,
    userId: number,
    attrs: { notes?: string },
  ) {
    const a = await this.assignmentRepo.findOne({ where: { taskId, userId } });
    if (!a) throw new NotFoundException('Assignment not found');

    if (attrs.notes !== undefined) a.notes = attrs.notes;
    return this.assignmentRepo.save(a);
  }

  private async ensureTaskExists(taskId: number): Promise<void> {
    const exists = await this.taskRepo.exist({ where: { id: taskId } });
    if (!exists) throw new NotFoundException('Task not found');
  }

  private async rollupOverallStatus(taskId: number) {
    const assignments = await this.assignmentRepo.find({ where: { taskId } });
    if (assignments.length === 0) return;

    const allCompleted = assignments.every(
      (a) => a.individualStatus === TaskIndividualStatus.COMPLETED,
    );
    const anyInProgress = assignments.some(
      (a) => a.individualStatus === TaskIndividualStatus.IN_PROGRESS,
    );

    const task = await this.findOne(taskId);
    if (allCompleted) {
      if (task.overallStatus !== TaskOverallStatus.COMPLETED) {
        task.overallStatus = TaskOverallStatus.COMPLETED;
        await this.taskRepo.save(task);
      }
    } else if (anyInProgress) {
      if (task.overallStatus !== TaskOverallStatus.IN_PROGRESS) {
        task.overallStatus = TaskOverallStatus.IN_PROGRESS;
        await this.taskRepo.save(task);
      }
    }
  }
}
