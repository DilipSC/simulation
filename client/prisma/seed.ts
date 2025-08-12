import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create a manager
  const manager = await prisma.manager.upsert({
    where: { email: 'admin@greencart.com' },
    update: {},
    create: {
      email: 'admin@greencart.com',
      password: '$2b$10$rQZ8KzQ8KzQ8KzQ8KzQ8K.8KzQ8KzQ8KzQ8KzQ8KzQ8KzQ8KzQ8K', // password123
      name: 'Admin Manager',
    },
  })
  console.log('✅ Manager created:', manager.email)

  // Create drivers
  const drivers = await Promise.all([
    prisma.driver.upsert({
      where: { email: 'john.smith@greencart.com' },
      update: {},
      create: {
        name: 'John Smith',
        email: 'john.smith@greencart.com',
        phone: '+1-555-0101',
        licenseNumber: 'DL123456789',
        vehicleType: 'Van',
        maxHoursPerDay: 8,
        hourlyRate: 25.0,
        isActive: true,
      },
    }),
    prisma.driver.upsert({
      where: { email: 'sarah.johnson@greencart.com' },
      update: {},
      create: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@greencart.com',
        phone: '+1-555-0102',
        licenseNumber: 'DL987654321',
        vehicleType: 'Truck',
        maxHoursPerDay: 10,
        hourlyRate: 28.0,
        isActive: true,
      },
    }),
    prisma.driver.upsert({
      where: { email: 'mike.davis@greencart.com' },
      update: {},
      create: {
        name: 'Mike Davis',
        email: 'mike.davis@greencart.com',
        phone: '+1-555-0103',
        licenseNumber: 'DL456789123',
        vehicleType: 'Car',
        maxHoursPerDay: 6,
        hourlyRate: 22.0,
        isActive: false,
      },
    }),
    prisma.driver.upsert({
      where: { email: 'lisa.wang@greencart.com' },
      update: {},
      create: {
        name: 'Lisa Wang',
        email: 'lisa.wang@greencart.com',
        phone: '+1-555-0104',
        licenseNumber: 'DL789123456',
        vehicleType: 'Van',
        maxHoursPerDay: 8,
        hourlyRate: 26.0,
        isActive: true,
      },
    }),
    prisma.driver.upsert({
      where: { email: 'david.brown@greencart.com' },
      update: {},
      create: {
        name: 'David Brown',
        email: 'david.brown@greencart.com',
        phone: '+1-555-0105',
        licenseNumber: 'DL321654987',
        vehicleType: 'Truck',
        maxHoursPerDay: 12,
        hourlyRate: 30.0,
        isActive: true,
      },
    }),
  ])
  console.log('✅ Drivers created:', drivers.length)

  // Create routes
  const routes = await Promise.all([
    prisma.route.upsert({
      where: { id: 'route-downtown-express' },
      update: {},
      create: {
        id: 'route-downtown-express',
        name: 'Downtown Express',
        startLocation: 'Warehouse A',
        endLocation: 'Downtown District',
        distance: 15.2,
        estimatedTime: 45,
        fuelCost: 12.50,
      },
    }),
    prisma.route.upsert({
      where: { id: 'route-suburban-loop' },
      update: {},
      create: {
        id: 'route-suburban-loop',
        name: 'Suburban Route',
        startLocation: 'Warehouse B',
        endLocation: 'Suburban Area',
        distance: 28.7,
        estimatedTime: 75,
        fuelCost: 22.80,
      },
    }),
    prisma.route.upsert({
      where: { id: 'route-airport-express' },
      update: {},
      create: {
        id: 'route-airport-express',
        name: 'Airport Express',
        startLocation: 'Warehouse A',
        endLocation: 'Airport Terminal',
        distance: 35.1,
        estimatedTime: 90,
        fuelCost: 28.50,
      },
    }),
    prisma.route.upsert({
      where: { id: 'route-industrial-zone' },
      update: {},
      create: {
        id: 'route-industrial-zone',
        name: 'Industrial Zone',
        startLocation: 'Warehouse C',
        endLocation: 'Industrial Park',
        distance: 42.3,
        estimatedTime: 120,
        fuelCost: 35.20,
      },
    }),
    prisma.route.upsert({
      where: { id: 'route-university-campus' },
      update: {},
      create: {
        id: 'route-university-campus',
        name: 'University Campus',
        startLocation: 'Warehouse B',
        endLocation: 'University District',
        distance: 18.9,
        estimatedTime: 55,
        fuelCost: 15.80,
      },
    }),
  ])
  console.log('✅ Routes created:', routes.length)

  // Create orders
  const orders = await Promise.all([
    prisma.order.upsert({
      where: { orderNumber: 'ORD-2024-001' },
      update: {},
      create: {
        orderNumber: 'ORD-2024-001',
        customerName: 'Alice Johnson',
        customerAddress: '123 Main St, Downtown',
        orderValue: 245.99,
        priority: 'high',
        status: 'pending',
        driverId: drivers[0].id,
        routeId: routes[0].id,
      },
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-2024-002' },
      update: {},
      create: {
        orderNumber: 'ORD-2024-002',
        customerName: 'Bob Smith',
        customerAddress: '456 Oak Ave, Suburbs',
        orderValue: 89.50,
        priority: 'medium',
        status: 'assigned',
        driverId: drivers[1].id,
        routeId: routes[1].id,
      },
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-2024-003' },
      update: {},
      create: {
        orderNumber: 'ORD-2024-003',
        customerName: 'Carol Davis',
        customerAddress: '789 Pine Rd, Uptown',
        orderValue: 599.99,
        priority: 'low',
        status: 'pending',
      },
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-2024-004' },
      update: {},
      create: {
        orderNumber: 'ORD-2024-004',
        customerName: 'David Wilson',
        customerAddress: '321 Elm St, Airport Area',
        orderValue: 1250.00,
        priority: 'high',
        status: 'in-transit',
        driverId: drivers[3].id,
        routeId: routes[2].id,
      },
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-2024-005' },
      update: {},
      create: {
        orderNumber: 'ORD-2024-005',
        customerName: 'Emma Thompson',
        customerAddress: '654 Maple Dr, Industrial Area',
        orderValue: 450.75,
        priority: 'medium',
        status: 'assigned',
        driverId: drivers[4].id,
        routeId: routes[3].id,
      },
    }),
  ])
  console.log('✅ Orders created:', orders.length)

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 