CREATE TYPE "role" AS ENUM('ADMIN', 'DOCTOR', 'NURSE', 'STAFF', 'RECEPTIONIST', 'PHARMACIST');
CREATE TYPE "user_status" AS ENUM('ACTIVE', 'INACTIVE');
CREATE TYPE "patient_type" AS ENUM('OPD', 'IPD');
CREATE TYPE "appointment_status" AS ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "task_status" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED');

CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "role" NOT NULL,
	"name" varchar(255),
	"status" "user_status" DEFAULT 'ACTIVE',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"dob" timestamp,
	"history" text,
	"type" "patient_type" NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer,
	"patient_id" integer,
	"time" timestamp,
	"status" "appointment_status" DEFAULT 'SCHEDULED'
);

CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"assigned_to" integer,
	"assigned_by" integer,
	"status" "task_status" DEFAULT 'PENDING',
	"created_at" timestamp DEFAULT now()
);

ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
