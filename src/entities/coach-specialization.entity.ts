import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Coach } from './coach.entity';

@Entity('coach_specializations')
export class CoachSpecialization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'coach_id' })
  coachId: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Coach, coach => coach.specializations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coach_id' })
  coach: Coach;
}
