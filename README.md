# 🚚 GreenCart Logistics - Delivery Simulation & KPI Dashboard

## 📋 Project Overview & Purpose

GreenCart Logistics is a comprehensive logistics management system designed to optimize delivery operations through advanced simulation capabilities and real-time KPI tracking. The platform enables logistics managers to:

- **Simulate Delivery Scenarios**: Run realistic delivery simulations with various parameters
- **Optimize Operations**: Analyze driver utilization, route efficiency, and profit margins
- **Manage Resources**: Handle drivers, routes, and orders through intuitive interfaces
- **Track Performance**: Monitor KPIs with interactive dashboards and charts
- **Make Data-Driven Decisions**: Use simulation results to improve operational efficiency

### Key Business Value
- Reduce operational costs through optimized route planning
- Improve customer satisfaction with better delivery time predictions
- Maximize driver utilization and minimize fatigue
- Increase profitability through intelligent resource allocation

## 🛠 Tech Stack Used

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Radix UI + shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Validation**: Zod (implicit through Prisma)

### DevOps & Tools
- **Package Manager**: npm
- **Testing**: Jest + ts-jest
- **Linting**: ESLint + Prettier
- **Build Tool**: Next.js built-in bundler
- **Database Hosting**: Neon DB (recommended)

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon DB account)
- npm or yarn package manager

### 1. Clone Repository
```bash
git clone <repository-url>
cd greencart-logistics/client
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the client directory (see Environment Variables section below)

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 5. Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 6. Default Login Credentials
- **Email**: `admin@greencart.com`
- **Password**: `password123`

## 🔐 Environment Variables

Create a `.env` file in the client directory with the following variables:

```env
# Database Configuration
DATABASE_URL="your-postgresql-connection-string"

# JWT Configuration  
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"

# Application Configuration
NODE_ENV="development"
```

### Environment Variable Descriptions
- `DATABASE_URL`: PostgreSQL connection string (required)
- `JWT_SECRET`: Secret key for JWT token signing (required, use strong random string)
- `JWT_EXPIRES_IN`: JWT token expiration time (default: 24h)
- `CORS_ORIGIN`: Allowed origin for CORS requests (update for production)
- `NODE_ENV`: Application environment (development/production)

## 🌐 Deployment Instructions

### Vercel (Recommended)
1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add all environment variables in Vercel dashboard
3. **Database**: Ensure your PostgreSQL database is accessible from Vercel
4. **Deploy**: Vercel will automatically build and deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Other Platforms (Netlify, Railway, Render)
1. **Build Command**: `npm run build`
2. **Start Command**: `npm start`
3. **Node Version**: 18+
4. **Environment Variables**: Configure in platform dashboard
5. **Database**: Ensure database connectivity

### Production Checklist
- [ ] Update `CORS_ORIGIN` to production domain
- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Configure database connection pooling
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for database

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

### API Endpoints

#### 🔐 Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@greencart.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cm123456789",
    "email": "admin@greencart.com",
    "name": "Admin User"
  }
}
```

#### 👥 Drivers Management
```http
# Get all drivers
GET /api/drivers
Authorization: Bearer <token>

Response:
[
  {
    "id": "cm123456789",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "licenseNumber": "DL123456",
    "vehicleType": "Van",
    "maxHoursPerDay": 8,
    "hourlyRate": 25.0,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

```http
# Create new driver
POST /api/drivers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567891",
  "licenseNumber": "DL123457",
  "vehicleType": "Truck",
  "maxHoursPerDay": 8,
  "hourlyRate": 30.0,
  "isActive": true
}
```

```http
# Update driver
PUT /api/drivers/{id}
Authorization: Bearer <token>
Content-Type: application/json

# Delete driver
DELETE /api/drivers/{id}
Authorization: Bearer <token>
```

#### 🛣 Routes Management
```http
# Get all routes
GET /api/routes
Authorization: Bearer <token>

Response:
[
  {
    "id": "cm123456789",
    "name": "Downtown Route",
    "startLocation": "Warehouse A",
    "endLocation": "Downtown District",
    "distance": 15.5,
    "estimatedTime": 45,
    "fuelCost": 0.15,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

```http
# Create new route
POST /api/routes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Suburban Route",
  "startLocation": "Warehouse B",
  "endLocation": "Suburban Area",
  "distance": 25.0,
  "estimatedTime": 60,
  "fuelCost": 0.18
}
```

#### 📦 Orders Management
```http
# Get all orders
GET /api/orders
Authorization: Bearer <token>

Response:
[
  {
    "id": "cm123456789",
    "orderNumber": "ORD-001",
    "customerName": "ABC Company",
    "customerAddress": "123 Business St",
    "orderValue": 1500.00,
    "priority": "high",
    "status": "pending",
    "driverId": null,
    "routeId": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

```http
# Create new order
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderNumber": "ORD-002",
  "customerName": "XYZ Corp",
  "customerAddress": "456 Commerce Ave",
  "orderValue": 2000.00,
  "priority": "urgent",
  "status": "pending",
  "driverId": "cm123456789",
  "routeId": "cm987654321"
}
```

#### 🎯 Simulation Engine
```http
# Run delivery simulation
POST /api/simulation/run
Authorization: Bearer <token>
Content-Type: application/json

{
  "numDrivers": 3,
  "startTime": "08:00",
  "maxHours": 8
}

Response:
{
  "totalProfit": 15750.25,
  "efficiencyScore": 87.5,
  "onTimeDeliveries": 12,
  "lateDeliveries": 2,
  "totalFuelCost": 245.80,
  "averageDeliveryTime": 65.5,
  "driverUtilization": [
    {
      "driver": "John Doe",
      "utilization": 85
    }
  ],
  "hourlyPerformance": [
    {
      "hour": "08:00",
      "deliveries": 3,
      "efficiency": 92
    }
  ]
}
```

```http
# Get simulation history
GET /api/simulation/history
Authorization: Bearer <token>

Response:
[
  {
    "id": "cm123456789",
    "timestamp": "2024-01-01T08:00:00.000Z",
    "numDrivers": 3,
    "startTime": "08:00",
    "maxHoursPerDay": 8,
    "totalProfit": 15750.25,
    "efficiencyScore": 87.5,
    "onTimeDeliveries": 12,
    "lateDeliveries": 2,
    "totalFuelCost": 245.80,
    "averageDeliveryTime": 65.5,
    "driverUtilization": 85,
    "hourlyPerformance": 12
  }
]
```

### Error Responses
```http
# Authentication Error
401 Unauthorized
{
  "error": "Access token required"
}

# Validation Error
400 Bad Request
{
  "error": "Missing required fields: name, email"
}

# Not Found Error
404 Not Found
{
  "error": "Driver not found"
}

# Server Error
500 Internal Server Error
{
  "error": "Internal server error"
}
```

### Postman Collection
A complete Postman collection with all endpoints and example requests is available at:
`/docs/GreenCart-Logistics-API.postman_collection.json`

Import this collection into Postman for easy API testing and development.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions, issues, or support:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs` folder