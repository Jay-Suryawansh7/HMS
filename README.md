# Hospital Management System (HMS)

A Multi-Tenant SaaS Hospital Management System built with Node.js, React, MySQL, and Redis.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express.js
- **Database**: MySQL (Database-per-Tenant), Redis (Caching/Session)
- **Architecture**: Multi-Tenant SaaS

## Prerequisites

- Node.js (v18+)
- MySQL (Running on localhost:3306)
- Redis (Cloud or Local)

## Setup Instructions

### 1. Backend Setup

```bash
cd apps/server
npm install
# Ensure .env is configured (see .env.example or ask admin)
# Initialize Common Database
node scripts/initDb.js
# Start Server
npm start
```

### 2. Frontend Setup

```bash
cd apps/client
npm install
npm run dev
```

### 3. Tenant Creation (Test)

To create a test tenant (e.g., City Hospital):

```bash
cd apps/server
node scripts/createTenantTest.js
```

### 4. Seed User (Test)

To seed an admin user for City Hospital:

```bash
cd apps/server
node scripts/seedUser.js
```

## Features

- **Multi-Tenancy**: Isolated databases for each hospital.
- **Authentication**: JWT-based auth with Redis integration.
- **Patient Management**: Add and view patients.
- **Doctor Dashboard**: View appointments.
- **Admin Dashboard**: Register staff.

## Default Credentials (Test)

- **Email**: `admin@cityhospital.com`
- **Password**: `password123`
- **Hospital ID**: `cityhospital`
