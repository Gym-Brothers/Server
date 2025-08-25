import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum WearableType {
  APPLE_WATCH = 'apple_watch',
  FITBIT = 'fitbit',
  GARMIN = 'garmin',
  SAMSUNG_GALAXY = 'samsung_galaxy',
  POLAR = 'polar',
  WHOOP = 'whoop',
  OURA_RING = 'oura_ring'
}

@Entity('wearable_integrations')
export class WearableIntegration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: WearableType
  })
  type: WearableType;

  @Column({ name: 'device_id' })
  deviceId: string;

  @Column({ name: 'access_token' })
  accessToken: string;

  @Column({ name: 'refresh_token', nullable: true })
  refreshToken: string;

  @Column({ type: 'timestamp', name: 'token_expires_at' })
  tokenExpiresAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', name: 'last_sync_at', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'json', name: 'sync_settings' })
  syncSettings: {
    syncHeartRate: boolean;
    syncSteps: boolean;
    syncSleep: boolean;
    syncWorkouts: boolean;
    syncCalories: boolean;
    syncBodyMetrics: boolean;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.wearableIntegrations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
