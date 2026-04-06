import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('permissions')
@Unique(['resourceType', 'resourceId', 'userId'])
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'resource_type' })
  resourceType: 'file' | 'folder';

  @Column({ name: 'resource_id' })
  resourceId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'granted_by_id' })
  grantedById: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'granted_by_id' })
  grantedBy: User;

  @Column()
  permission: 'editor' | 'viewer';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
