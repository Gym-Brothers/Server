import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EmergencyContactRelation } from '../models/enums';
import { User } from './user.entity';

@Entity('emergency_contacts')
export class EmergencyContact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  name: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: EmergencyContactRelation,
  })
  relation: EmergencyContactRelation;

  @Column({ nullable: true })
  address: string;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @ManyToOne(() => User, user => user.emergencyContacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
