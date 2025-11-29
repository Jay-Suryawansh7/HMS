const { pgTable, serial, varchar, timestamp, text, integer, pgEnum, unique, index } = require('drizzle-orm/pg-core');

// Enums (Tenant Schema)
// Note: These will be created in the tenant schema
const roleEnum = pgEnum('role', ['ADMIN', 'DOCTOR', 'NURSE', 'STAFF', 'RECEPTIONIST', 'PHARMACIST']);
const userStatusEnum = pgEnum('user_status', ['ACTIVE', 'INACTIVE']); // Renamed to avoid conflict if needed, but schema isolation handles it.
const patientTypeEnum = pgEnum('patient_type', ['OPD', 'IPD']);
const genderEnum = pgEnum('gender', ['Male', 'Female', 'Other']);
const appointmentStatusEnum = pgEnum('appointment_status', ['SCHEDULED', 'COMPLETED', 'CANCELLED']);
const taskStatusEnum = pgEnum('task_status', ['PENDING', 'IN_PROGRESS', 'COMPLETED']);

// --- Tenant Schema Tables ---

const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    role: roleEnum('role').notNull(),
    name: varchar('name', { length: 255 }),
    status: userStatusEnum('status').default('ACTIVE'),
    forcePasswordChange: varchar('force_password_change', { length: 10 }).default('false'),
    passwordLastChanged: timestamp('password_last_changed'),
    createdAt: timestamp('created_at').defaultNow(),
});

const patients = pgTable('patients', {
    id: serial('id').primaryKey(),
    patientId: varchar('patient_id', { length: 50 }).notNull().unique(), // Custom ID: {tenantId}-P-{sequential}
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    dob: timestamp('dob'),
    gender: genderEnum('gender'),
    bloodGroup: varchar('blood_group', { length: 10 }),
    phone: varchar('phone', { length: 20 }).notNull(),
    email: varchar('email', { length: 255 }),
    address: text('address'),
    emergencyContactName: varchar('emergency_contact_name', { length: 100 }),
    emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),
    patientType: patientTypeEnum('patient_type').notNull(), // Renamed from 'type' for clarity
    photoUrl: varchar('photo_url', { length: 500 }),
    history: text('history'), // Medical history (keeping for backward compatibility)
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
    patientIdIdx: index('patient_id_idx').on(table.patientId),
    phoneIdx: index('phone_idx').on(table.phone),
    emailIdx: index('email_idx').on(table.email),
    patientTypeIdx: index('patient_type_idx').on(table.patientType),
}));

const appointments = pgTable('appointments', {
    id: serial('id').primaryKey(),
    doctorId: integer('doctor_id').references(() => users.id),
    patientId: integer('patient_id').references(() => patients.id),
    time: timestamp('time'),
    status: appointmentStatusEnum('status').default('SCHEDULED'),
});

const tasks = pgTable('tasks', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    assignedTo: integer('assigned_to').references(() => users.id),
    assignedBy: integer('assigned_by').references(() => users.id),
    status: taskStatusEnum('status').default('PENDING'),
    createdAt: timestamp('created_at').defaultNow(),
});

const prescriptions = pgTable('prescriptions', {
    id: serial('id').primaryKey(),
    prescriptionId: varchar('prescription_id', { length: 50 }).notNull().unique(), // Custom ID: {tenantId}-RX-{sequential}
    doctorId: integer('doctor_id').references(() => users.id).notNull(),
    patientId: integer('patient_id').references(() => patients.id).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    prescriptionIdIdx: index('prescription_id_idx').on(table.prescriptionId),
    doctorIdIdx: index('prescription_doctor_id_idx').on(table.doctorId),
    patientIdIdx: index('prescription_patient_id_idx').on(table.patientId),
}));

const prescriptionItems = pgTable('prescription_items', {
    id: serial('id').primaryKey(),
    prescriptionId: integer('prescription_id').references(() => prescriptions.id).notNull(),
    medicineName: varchar('medicine_name', { length: 255 }).notNull(),
    dosage: varchar('dosage', { length: 100 }).notNull(),
    frequency: varchar('frequency', { length: 100 }).notNull(),
    duration: varchar('duration', { length: 100 }).notNull(),
    instructions: text('instructions'),
}, (table) => ({
    prescriptionIdIdx: index('prescription_item_prescription_id_idx').on(table.prescriptionId),
}));

const passwordResetTokens = pgTable('password_reset_tokens', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    used: varchar('used', { length: 10 }).default('false'),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    tokenIdx: index('password_reset_token_idx').on(table.token),
    userIdIdx: index('password_reset_user_id_idx').on(table.userId),
}));

const passwordHistory = pgTable('password_history', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    userIdIdx: index('password_history_user_id_idx').on(table.userId),
}));

module.exports = {
    users,
    patients,
    appointments,
    tasks,
    prescriptions,
    prescriptionItems,
    passwordResetTokens,
    passwordHistory,
    roleEnum,
    userStatusEnum,
    patientTypeEnum,
    genderEnum,
    appointmentStatusEnum,
    taskStatusEnum
};
