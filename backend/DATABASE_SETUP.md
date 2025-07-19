# CodeCollab Database Setup

This document provides instructions for setting up the PostgreSQL database for CodeCollab.

## Prerequisites

1. PostgreSQL installed locally or access to a PostgreSQL instance
2. Database user with CREATE privileges

## Database Setup

### 1. Create Database

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE codecollab;
CREATE USER codecollab_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE codecollab TO codecollab_user;
```

### 2. Environment Configuration

Update your `.env` file with the correct database connection string:

```env
DATABASE_URL="postgresql://codecollab_user:your_secure_password@localhost:5432/codecollab?schema=public"
```

### 3. Run Migrations

```bash
# Generate Prisma client
npm run db:generate

# Apply database migrations
npm run db:migrate

# Seed database with initial data
npm run db:seed
```

### 4. Development Tools

```bash
# View and edit data in Prisma Studio
npm run db:studio

# Reset database (caution: deletes all data)
npx prisma migrate reset

# Push schema changes without creating migration files
npm run db:push
```

## Database Schema Overview

### Tables Created:

- **users**: User accounts and profiles
- **snippets**: Code snippets shared by users
- **reviews**: Reviews and ratings for snippets
- **badges**: Available achievement badges
- **user_badges**: Junction table for user-earned badges
- **point_transactions**: History of point earnings/spending

### Key Features:

- User authentication ready (password hashing)
- Point and badge system for gamification
- Code snippet sharing and reviewing
- Proper indexing for performance
- Cascade delete for data integrity
