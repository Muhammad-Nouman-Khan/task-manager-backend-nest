import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Task } from './task.entity';

export enum TaskIndividualStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
}

@Entity('task_assignments') // Entity is a TypeORM decorator that defines a database table.
@Index(['taskId', 'userId'], { unique: true }) // prevent duplicates
export class TaskAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  @Index()
  taskId: number;

  @Column({ type: 'int' })
  @Index()
  userId: number;

  // ManyToOne is a TypeORM decorator that defines a many-to-one relationship between two entities.
  // In this case, a TaskAssignment belongs to a Task.
  // The onDelete option is set to CASCADE, which means that when a Task is deleted, the TaskAssignments will also be deleted.
  @ManyToOne(() => Task, (t) => t.assignments, { onDelete: 'CASCADE' })
  task: Task;

  @Column({
    type: 'enum',
    enum: TaskIndividualStatus,
    default: TaskIndividualStatus.PENDING,
  })
  @Index()
  individualStatus: TaskIndividualStatus;

  @CreateDateColumn()
  assignedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt?: Date | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
