# Setup Guide

## Environment Configuration

Create a `.env` file in the client directory with the following content:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/greencart_logistics"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"

# Application Configuration
NODE_ENV="development"
```

## Database Setup

1. **Install PostgreSQL** and create a database named `greencart_logistics`
2. **Update DATABASE_URL** in your `.env` file with your database credentials
3. **Run the following commands**:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

## Default Login

After seeding the database, you can login with:
- **Email**: admin@greencart.com
- **Password**: password123

## Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000` 