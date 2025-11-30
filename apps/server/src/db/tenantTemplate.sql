CREATE TYPE "role" AS ENUM('ADMIN', 'DOCTOR', 'NURSE', 'STAFF', 'RECEPTIONIST', 'PHARMACIST');
CREATE TYPE "user_status" AS ENUM('ACTIVE', 'INACTIVE');
CREATE TYPE "patient_type" AS ENUM('OPD', 'IPD');
CREATE TYPE "gender" AS ENUM('Male', 'Female', 'Other');
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
	"patient_id" varchar(50) NOT NULL UNIQUE,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"dob" timestamp,
	"gender" "gender",
	"blood_group" varchar(10),
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"address" text,
	"emergency_contact_name" varchar(100) NOT NULL,
	"emergency_contact_phone" varchar(20) NOT NULL,
	"patient_type" "patient_type" NOT NULL,
	"photo_url" varchar(500),
	"history" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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

CREATE TABLE "prescriptions" (
    "id" serial PRIMARY KEY NOT NULL,
    "prescription_id" varchar(50) NOT NULL UNIQUE,
    "doctor_id" integer NOT NULL,
    "patient_id" integer NOT NULL,
    "notes" text,
    "created_at" timestamp DEFAULT now()
);

CREATE TABLE "prescription_items" (
    "id" serial PRIMARY KEY NOT NULL,
    "prescription_id" integer NOT NULL,
    "medicine_name" varchar(255) NOT NULL,
    "dosage" varchar(100) NOT NULL,
    "frequency" varchar(100) NOT NULL,
    "duration" varchar(100) NOT NULL,
    "instructions" text
);

-- Indexes for patients table
CREATE INDEX IF NOT EXISTS "patient_id_idx" ON "patients"("patient_id");
CREATE INDEX IF NOT EXISTS "phone_idx" ON "patients"("phone");
CREATE INDEX IF NOT EXISTS "email_idx" ON "patients"("email");
CREATE INDEX IF NOT EXISTS "patient_type_idx" ON "patients"("patient_type");

ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_users_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE no action;
