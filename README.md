# 🏙️ City Complaint & Service Request Platform

A modern REST API for managing **city complaints and paid public service requests**. Citizens can submit complaints, departments can assign and resolve them, and administrators can manage the entire platform with secure role-based access.



## 🔗 Links

* 🚀 **Live API:** `https://city-complaint-backend-seven.vercel.app/`
* 📡 **API Base URL:** `https://<your-vercel-domain>.vercel.app/api/v1`
* 📚 **Postman Collection:** `postman/city-complaint-backend.postman_collection.json`

---

## ✨ Features

* 🔐 JWT Authentication with Access & Refresh Tokens
* 👥 Role-Based Access Control
* 🏢 Department-based complaint routing
* 📋 Complaint assignment & workflow management
* 🔄 State-machine based status transitions
* ⏱️ SLA tracking with automatic `dueAt`
* 💳 bKash payment integration
* 📝 Complaint status history
* 📊 Admin dashboard & statistics
* 🔎 Search, filtering, sorting & pagination
* 🛡️ Zod validation & centralized error handling
* 📜 Audit logging for critical actions
* 🗑️ Soft delete support
* ⚡ Database transactions & optimized Prisma queries
* 🚦 API & authentication rate limiting
* 🔒 Helmet & configurable CORS

---

## 🛠️ Tech Stack

| Category       | Technology               |
| -------------- | ------------------------ |
| Runtime        | Node.js                  |
| Language       | TypeScript               |
| Framework      | Express.js 5             |
| Database       | PostgreSQL               |
| ORM            | Prisma 7                 |
| Authentication | JWT + bcryptjs           |
| Validation     | Zod                      |
| Payment        | bKash Tokenized Checkout |
| Security       | Helmet, CORS, Rate Limit |
| Build          | tsup                     |
| Deployment     | Vercel                   |
| API Testing    | Postman                  |

---

## 👤 User Roles

### 🧑 Citizen

* Create and manage complaints
* View complaint status
* Cancel complaints
* Make payments for paid services
* Close or reopen resolved complaints

### 👨‍💼 Staff

* View department complaints
* Assign complaints to technicians
* Update assigned complaint status

### 👑 Admin

* Manage users and roles
* Manage categories
* View all complaints
* View dashboard statistics
* View audit logs

---

## 🔄 Complaint Workflow

```text
PENDING
   ↓
ASSIGNED
   ↓
IN_PROGRESS
   ↓
RESOLVED
   ↓
CLOSED
```

Paid service requests:

```text
PENDING_PAYMENT
       ↓
     PENDING
       ↓
    ASSIGNED
```

Invalid status transitions are rejected by the workflow system.

---

## 💳 Payment Flow

For paid services such as **New Water Connection**:

```text
Create Request
      ↓
PENDING_PAYMENT
      ↓
bKash Payment
      ↓
Payment Verification
      ↓
Payment Confirmed
      ↓
PENDING
```

The server verifies the payment directly with bKash before confirming the request.

---

## 📡 API Overview

Base URL:

```text
/api/v1
```

### Authentication

| Method | Endpoint              |
| ------ | --------------------- |
| POST   | `/auth/register`      |
| POST   | `/auth/login`         |
| POST   | `/auth/refresh-token` |
| POST   | `/auth/logout`        |

### Complaints

| Method | Endpoint                  |
| ------ | ------------------------- |
| POST   | `/complaints`             |
| GET    | `/complaints`             |
| GET    | `/complaints/:id`         |
| GET    | `/complaints/my-assigned` |
| PATCH  | `/complaints/:id`         |
| DELETE | `/complaints/:id`         |
| POST   | `/complaints/:id/assign`  |
| PATCH  | `/complaints/:id/status`  |
| POST   | `/complaints/:id/cancel`  |

### Payments

| Method | Endpoint             |
| ------ | -------------------- |
| POST   | `/payments/initiate` |
| GET    | `/payments/callback` |
| GET    | `/payments/:id`      |

### Admin

| Method | Endpoint                 |
| ------ | ------------------------ |
| GET    | `/admin/users`           |
| PATCH  | `/admin/users/:id/role`  |
| GET    | `/admin/dashboard-stats` |
| GET    | `/admin/audit-logs`      |

---

## 🚀 Getting Started

### Prerequisites

* Node.js 20+
* PostgreSQL
* bKash Sandbox Credentials

### Installation

```bash
git clone https://github.com/safikolislam/city-complaint-backend

cd city-complaint-backend

npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development



DATABASE_URL=postgresql://user:password@localhost:5432/city_complaint

BCRYPT_SALT_ROUNDS=10

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_USERNAME=
BKASH_PASSWORD=
BKASH_APP_KEY=
BKASH_APP_SECRET=

SEED_ADMIN_NAME=
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

### Database Setup

```bash
npx prisma migrate deploy
npx prisma generate
npm run seed
```

### Run Development Server

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

---

## 🧪 Testing

The project includes a Postman collection for testing the complete API.

**Postman Collection**

```text
postman/city-complaint-backend.postman_collection.json
```

Recommended test flow:

```text
Register
   ↓
Login
   ↓
Create Complaint
   ↓
Assign Technician
   ↓
Update Status
   ↓
Resolve Complaint
   ↓
Close Complaint
```

---

## 🗄️ Database Models

Core models include:

```text
User
RefreshToken
Department
Category
Complaint
ComplaintStatusHistory
Attachment
Payment
Feedback
Notification
AuditLog
```

The project uses Prisma with PostgreSQL and database transactions for critical operations.

---

## 🔐 Security

* JWT authentication
* Role-based authorization
* Password hashing with bcrypt
* Zod request validation
* Helmet security headers
* CORS protection
* Rate limiting
* Soft deletes
* Database transactions
* Centralized error handling
* Audit logging

---

## ☁️ Deployment

The API is designed for deployment on **Vercel**.

Production setup:

```text
PostgreSQL
     ↓
Prisma
     ↓
Express API
     ↓
Vercel
     ↓
REST API
```

Set all required environment variables in:

```text
Vercel → Settings → Environment Variables
```

---

## 📁 Project Structure

```text
src/
├── app.ts
├── server.ts
├── config/
├── lib/
│   └── prisma.ts
├── middlewares/
│   ├── auth/
│   ├── globalErrorHandler.ts
│   └── validateRequest.ts
├── modules/
│   ├── auth/
│   ├── user/
│   ├── category/
│   ├── complaint/
│   ├── payment/
│   └── admin/
└── utils/

prisma/
├── schema/
├── migrations/
└── seed.ts
```

---

## 👨‍💻 Author

**Md. Safikol Islam**

Backend Developer | Node.js | TypeScript | PostgreSQL | Prisma

---



⭐ **If you find this project useful, consider giving it a star!**


