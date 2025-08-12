# GreenCart Logistics - Delivery Simulation & KPI Dashboard

A comprehensive logistics management system with delivery simulation capabilities and real-time KPI tracking.

## Features

### Backend (Next.js 14+ API Routes)
- **Authentication**: JWT-based auth with bcrypt password hashing
- **Database**: PostgreSQL with Prisma ORM
- **CRUD Operations**: Full CRUD for drivers, routes, and orders
- **Simulation Engine**: Advanced delivery simulation with company rules
- **CORS**: Secure API access configuration
- **Validation**: Comprehensive input validation and error handling

### Frontend (React + Next.js)
- **Dashboard**: Real-time KPI monitoring
- **Simulation**: Interactive delivery simulation interface
- **Management**: Driver, route, and order management
- **Charts**: Visual data representation with Recharts
- **Responsive**: Mobile-first design with Tailwind CSS

### Simulation Rules
- **Late Delivery Penalty**: 10% penalty for deliveries exceeding 2 hours
- **Driver Fatigue Rule**: Maximum hours per driver per day enforcement
- **High-Value Bonus**: 5% bonus for orders over $1000
- **Priority Bonuses**: Urgent (3%), High (2%) priority bonuses
- **Fuel Cost Calculation**: Per-kilometer fuel cost tracking
- **Efficiency Scoring**: Multi-factor efficiency calculation

## Tech Stack

- **Frontend**: Next.js 14+, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Authentication**: JWT, bcrypt
- **Database**: PostgreSQL (Neon DB recommended)
- **Testing**: Jest, ts-jest
- **Charts**: Recharts

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd client
npm install
```

### 2. Environment Configuration

Create a `.env` file in the client directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/greencart_logistics"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"

# CORS
CORS_ORIGIN="http://localhost:3000"

# App
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Default Login Credentials

- **Email**: admin@greencart.com
- **Password**: password123

## API Endpoints

### Authentication
- `POST /api/auth/login` - Manager login
- `POST /api/auth/signup` - Manager registration

### Drivers
- `GET /api/drivers` - List all drivers
- `POST /api/drivers` - Create driver
- `GET /api/drivers/[id]` - Get driver details
- `PUT /api/drivers/[id]` - Update driver
- `DELETE /api/drivers/[id]` - Delete driver

### Routes
- `GET /api/routes` - List all routes
- `POST /api/routes` - Create route
- `GET /api/routes/[id]` - Get route details
- `PUT /api/routes/[id]` - Update route
- `DELETE /api/routes/[id]` - Delete route

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order details
- `PUT /api/orders/[id]` - Update order
- `DELETE /api/orders/[id]` - Delete order

### Simulation
- `POST /api/simulation/run` - Run delivery simulation
- `GET /api/simulation/history` - Get simulation history

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Database Schema

### Models
- **Manager**: Authentication and user management
- **Driver**: Driver information and capabilities
- **Route**: Delivery routes with distance and fuel costs
- **Order**: Customer orders with priority and status
- **SimulationResult**: Simulation outcomes and metrics

### Key Relationships
- Orders can be assigned to drivers and routes
- Simulation results track performance metrics
- All models include timestamps and audit fields

## Simulation Engine

The simulation engine implements sophisticated delivery optimization:

1. **Order Prioritization**: Orders are sorted by priority and value
2. **Driver Assignment**: Optimal driver assignment considering workload
3. **Fatigue Management**: Respects maximum hours per driver
4. **Profit Calculation**: Applies bonuses and penalties based on rules
5. **Efficiency Scoring**: Multi-factor performance evaluation

## Deployment

### Production Considerations
- Use strong JWT secrets
- Configure proper CORS origins
- Set up database connection pooling
- Enable HTTPS
- Configure environment variables securely

### Database Migration
```bash
# Generate migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in the repository.
