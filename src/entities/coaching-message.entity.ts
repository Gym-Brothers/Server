import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Coach } from './coach.entity';

export enum MessageType {
  TEXT = 'text',
  VOICE = 'voice',
  IMAGE = 'image',
  VIDEO = 'video',
  FORM_CHECK = 'form_check',
  PROGRESS_UPDATE = 'progress_update',
  WORKOUT_FEEDBACK = 'workout_feedback',
  NUTRITION_ADVICE = 'nutrition_advice'
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read'
}

@Entity('coaching_messages')
export class CoachingMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sender_id' })
  senderId: number;

  @Column({ name: 'receiver_id' })
  receiverId: number;

  @Column({ name: 'coach_id' })
  coachId: number;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT
  })
  type: MessageType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true, name: 'media_attachments' })
  mediaAttachments: {
    url: string;
    type: string;
    fileName: string;
    fileSize: number;
  }[];

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT
  })
  status: MessageStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'read_at' })
  readAt: Date;

  @Column({ name: 'is_ai_assisted', default: false })
  isAiAssisted: boolean;

  @Column({ type: 'json', nullable: true, name: 'ai_analysis' })
  aiAnalysis: {
    sentiment: string;
    urgency: number;
    suggestedResponse?: string;
  };

  @Column({ name: 'reply_to_message_id', nullable: true })
  replyToMessageId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.sentMessages)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, user => user.receivedMessages)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @ManyToOne(() => Coach, coach => coach.coachingMessages)
  @JoinColumn({ name: 'coach_id' })
  coach: Coach;
}
