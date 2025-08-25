import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1692975600000 implements MigrationInterface {
    name = 'CreateInitialTables1692975600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create ENUM types
        await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."users_activity_level_enum" AS ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')`);
        await queryRunner.query(`CREATE TYPE "public"."emergency_contacts_relation_enum" AS ENUM('spouse', 'parent', 'sibling', 'child', 'friend', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."medical_history_blood_type_enum" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')`);
        await queryRunner.query(`CREATE TYPE "public"."fitness_goals_goal_type_enum" AS ENUM('weight_loss', 'weight_gain', 'muscle_building', 'strength_training', 'endurance', 'general_fitness', 'rehabilitation', 'sports_performance')`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_type_enum" AS ENUM('basic', 'premium', 'vip', 'personal_training')`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_status_enum" AS ENUM('active', 'inactive', 'pending', 'expired', 'cancelled')`);

        // Create users table
        await queryRunner.query(`CREATE TABLE "users" (
            "id" SERIAL NOT NULL,
            "username" character varying NOT NULL,
            "email" character varying NOT NULL,
            "password" character varying NOT NULL,
            "first_name" character varying NOT NULL,
            "last_name" character varying NOT NULL,
            "date_of_birth" date NOT NULL,
            "gender" "public"."users_gender_enum" NOT NULL,
            "phone_number" character varying NOT NULL,
            "profile_picture" character varying,
            "activity_level" "public"."users_activity_level_enum" NOT NULL,
            "is_active" boolean NOT NULL DEFAULT true,
            "email_verified" boolean NOT NULL DEFAULT false,
            "phone_verified" boolean NOT NULL DEFAULT false,
            "last_login_at" TIMESTAMP,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "UQ_users_username" UNIQUE ("username"),
            CONSTRAINT "UQ_users_email" UNIQUE ("email"),
            CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
        )`);

        // Create addresses table
        await queryRunner.query(`CREATE TABLE "addresses" (
            "id" SERIAL NOT NULL,
            "user_id" integer NOT NULL,
            "street" character varying NOT NULL,
            "city" character varying NOT NULL,
            "state" character varying NOT NULL,
            "zip_code" character varying NOT NULL,
            "country" character varying NOT NULL,
            "is_default" boolean NOT NULL DEFAULT false,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_addresses_id" PRIMARY KEY ("id")
        )`);

        // Create emergency_contacts table
        await queryRunner.query(`CREATE TABLE "emergency_contacts" (
            "id" SERIAL NOT NULL,
            "user_id" integer NOT NULL,
            "name" character varying NOT NULL,
            "phone_number" character varying NOT NULL,
            "email" character varying,
            "relation" "public"."emergency_contacts_relation_enum" NOT NULL,
            "address" character varying,
            "is_default" boolean NOT NULL DEFAULT false,
            CONSTRAINT "PK_emergency_contacts_id" PRIMARY KEY ("id")
        )`);

        // Create health_metrics table
        await queryRunner.query(`CREATE TABLE "health_metrics" (
            "id" SERIAL NOT NULL,
            "user_id" integer NOT NULL,
            "height" numeric(5,2) NOT NULL,
            "weight" numeric(5,2) NOT NULL,
            "body_fat_percentage" numeric(5,2),
            "muscle_mass" numeric(5,2),
            "bmi" numeric(5,2) NOT NULL,
            "blood_pressure_systolic" integer,
            "blood_pressure_diastolic" integer,
            "resting_heart_rate" integer,
            "max_heart_rate" integer,
            "notes" text,
            "recorded_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_health_metrics_id" PRIMARY KEY ("id")
        )`);

        // Create medical_history table
        await queryRunner.query(`CREATE TABLE "medical_history" (
            "id" SERIAL NOT NULL,
            "user_id" integer NOT NULL,
            "blood_type" "public"."medical_history_blood_type_enum",
            "allergies" text array NOT NULL DEFAULT '{}',
            "medications" text array NOT NULL DEFAULT '{}',
            "chronic_conditions" text array NOT NULL DEFAULT '{}',
            "past_surgeries" text array NOT NULL DEFAULT '{}',
            "injuries" text array NOT NULL DEFAULT '{}',
            "physician_name" character varying,
            "physician_contact" character varying,
            "last_checkup_date" date,
            "notes" text,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "UQ_medical_history_user_id" UNIQUE ("user_id"),
            CONSTRAINT "PK_medical_history_id" PRIMARY KEY ("id")
        )`);

        // Create fitness_goals table
        await queryRunner.query(`CREATE TABLE "fitness_goals" (
            "id" SERIAL NOT NULL,
            "user_id" integer NOT NULL,
            "goal_type" "public"."fitness_goals_goal_type_enum" NOT NULL,
            "target_weight" numeric(5,2),
            "target_body_fat" numeric(5,2),
            "target_date" date,
            "description" text NOT NULL,
            "is_active" boolean NOT NULL DEFAULT true,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_fitness_goals_id" PRIMARY KEY ("id")
        )`);

        // Create coaches table
        await queryRunner.query(`CREATE TABLE "coaches" (
            "id" SERIAL NOT NULL,
            "user_id" integer NOT NULL,
            "bio" text NOT NULL,
            "years_of_experience" integer NOT NULL,
            "hourly_rate" numeric(8,2) NOT NULL,
            "currency" character varying NOT NULL DEFAULT 'USD',
            "average_rating" numeric(3,2) NOT NULL DEFAULT '0',
            "total_reviews" integer NOT NULL DEFAULT '0',
            "max_clients" integer NOT NULL,
            "current_client_count" integer NOT NULL DEFAULT '0',
            "is_available" boolean NOT NULL DEFAULT true,
            "is_verified" boolean NOT NULL DEFAULT false,
            "verification_date" TIMESTAMP,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "UQ_coaches_user_id" UNIQUE ("user_id"),
            CONSTRAINT "PK_coaches_id" PRIMARY KEY ("id")
        )`);

        // Create coach_certifications table
        await queryRunner.query(`CREATE TABLE "coach_certifications" (
            "id" SERIAL NOT NULL,
            "coach_id" integer NOT NULL,
            "name" character varying NOT NULL,
            "issuing_organization" character varying NOT NULL,
            "issue_date" date NOT NULL,
            "expiry_date" date,
            "certificate_number" character varying,
            "is_verified" boolean NOT NULL DEFAULT false,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_coach_certifications_id" PRIMARY KEY ("id")
        )`);

        // Create coach_specializations table
        await queryRunner.query(`CREATE TABLE "coach_specializations" (
            "id" SERIAL NOT NULL,
            "coach_id" integer NOT NULL,
            "name" character varying NOT NULL,
            "description" text,
            CONSTRAINT "PK_coach_specializations_id" PRIMARY KEY ("id")
        )`);

        // Create subscriptions table
        await queryRunner.query(`CREATE TABLE "subscriptions" (
            "id" SERIAL NOT NULL,
            "user_id" integer NOT NULL,
            "coach_id" integer NOT NULL,
            "type" "public"."subscriptions_type_enum" NOT NULL,
            "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'pending',
            "start_date" date NOT NULL,
            "end_date" date NOT NULL,
            "monthly_price" numeric(8,2) NOT NULL,
            "total_price" numeric(10,2) NOT NULL,
            "currency" character varying NOT NULL DEFAULT 'USD',
            "personal_training_sessions" integer NOT NULL,
            "group_sessions" integer NOT NULL,
            "nutrition_planning" boolean NOT NULL DEFAULT false,
            "progress_tracking" boolean NOT NULL DEFAULT true,
            "custom_workouts" boolean NOT NULL DEFAULT false,
            "payment_method" character varying,
            "last_payment_date" TIMESTAMP,
            "next_payment_date" TIMESTAMP,
            "cancelled_at" TIMESTAMP,
            "cancellation_reason" text,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_subscriptions_id" PRIMARY KEY ("id")
        )`);

        // Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "addresses" ADD CONSTRAINT "FK_addresses_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "emergency_contacts" ADD CONSTRAINT "FK_emergency_contacts_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "health_metrics" ADD CONSTRAINT "FK_health_metrics_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_history" ADD CONSTRAINT "FK_medical_history_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fitness_goals" ADD CONSTRAINT "FK_fitness_goals_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coaches" ADD CONSTRAINT "FK_coaches_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coach_certifications" ADD CONSTRAINT "FK_coach_certifications_coach_id" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coach_specializations" ADD CONSTRAINT "FK_coach_specializations_coach_id" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_subscriptions_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_subscriptions_coach_id" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_username" ON "users" ("username")`);
        await queryRunner.query(`CREATE INDEX "IDX_addresses_user_id" ON "addresses" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_health_metrics_user_id" ON "health_metrics" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_health_metrics_recorded_at" ON "health_metrics" ("recorded_at")`);
        await queryRunner.query(`CREATE INDEX "IDX_subscriptions_user_id" ON "subscriptions" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_subscriptions_coach_id" ON "subscriptions" ("coach_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_subscriptions_status" ON "subscriptions" ("status")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_subscriptions_coach_id"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_subscriptions_user_id"`);
        await queryRunner.query(`ALTER TABLE "coach_specializations" DROP CONSTRAINT "FK_coach_specializations_coach_id"`);
        await queryRunner.query(`ALTER TABLE "coach_certifications" DROP CONSTRAINT "FK_coach_certifications_coach_id"`);
        await queryRunner.query(`ALTER TABLE "coaches" DROP CONSTRAINT "FK_coaches_user_id"`);
        await queryRunner.query(`ALTER TABLE "fitness_goals" DROP CONSTRAINT "FK_fitness_goals_user_id"`);
        await queryRunner.query(`ALTER TABLE "medical_history" DROP CONSTRAINT "FK_medical_history_user_id"`);
        await queryRunner.query(`ALTER TABLE "health_metrics" DROP CONSTRAINT "FK_health_metrics_user_id"`);
        await queryRunner.query(`ALTER TABLE "emergency_contacts" DROP CONSTRAINT "FK_emergency_contacts_user_id"`);
        await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_addresses_user_id"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TABLE "coach_specializations"`);
        await queryRunner.query(`DROP TABLE "coach_certifications"`);
        await queryRunner.query(`DROP TABLE "coaches"`);
        await queryRunner.query(`DROP TABLE "fitness_goals"`);
        await queryRunner.query(`DROP TABLE "medical_history"`);
        await queryRunner.query(`DROP TABLE "health_metrics"`);
        await queryRunner.query(`DROP TABLE "emergency_contacts"`);
        await queryRunner.query(`DROP TABLE "addresses"`);
        await queryRunner.query(`DROP TABLE "users"`);

        // Drop ENUM types
        await queryRunner.query(`DROP TYPE "public"."subscriptions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."fitness_goals_goal_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."medical_history_blood_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."emergency_contacts_relation_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_activity_level_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
    }
}
