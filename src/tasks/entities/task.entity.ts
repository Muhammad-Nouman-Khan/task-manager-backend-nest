import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { TaskAssignment } from './task-assignment.entity';

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskOverallStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  @Index()
  priority: TaskPriority;

  @Column({
    type: 'enum',
    enum: TaskOverallStatus,
    default: TaskOverallStatus.PENDING,
  })
  @Index()
  overallStatus: TaskOverallStatus;

  @Column({ type: 'int' })
  @Index()
  createdByUserId: number;

  @Column({ type: 'datetime', nullable: true })
  dueDate?: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // OneToMany is a TypeORM decorator that defines a one-to-many relationship between two entities.
  // In this case, a Task can have multiple TaskAssignments.
  // The cascade option is set to false, which means that when a Task is deleted, the TaskAssignments will not be deleted.
  @OneToMany(() => TaskAssignment, (a) => a.task, { cascade: false })
  assignments: TaskAssignment[];
}
