import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample manager
  const hashedPassword = await bcrypt.hash('password123', 12)
  const manager = await prisma.manager.upsert({
    where: { email: 'admin@greencart.com' },
    update: {},
    create: {
      name: 'Admin Manager',
      email: 'admin@greencart.com',
      password: hashedPassword
    }
  })
  console.log('✅ Created manager:', manager.email)

  // Create sample drivers
  const drivers = await Promise.all([
    prisma.driver.upsert({
      where: { email: 'john.doe@greencart.com' },
      update: {},
      create: {
        name: 'John Doe',
        email: 'john.doe@greencart.com',
        phone: '+1-555-0101',
        licenseNumber: 'DL001234',
        vehicleType: 'Van',
        maxHoursPerDay: 8,
        hourlyRate: 25.0
      }
    }),
    prisma.driver.upsert({
      where: { email: 'jane.smith@greencart.com' },
      update: {},
      create: {
        name: 'Jane Smith',
        email: 'jane.smith@greencart.com',
        phone: '+1-555-0102',
        licenseNumber: 'DL001235',
        vehicleType: 'Truck',
        maxHoursPerDay: 10,
        hourlyRate: 28.0
      }
    }),
    prisma.driver.upsert({
      where: { email: 'mike.johnson@greencart.com' },
      update: {},
      create: {
        name: 'Mike Johnson',
        email: 'mike.johnson@greencart.com',
        phone: '+1-555-0103',
        licenseNumber: 'DL001236',
        vehicleType: 'Van',
        maxHoursPerDay: 8,
        hourlyRate: 24.0
      }
    }),
    prisma.driver.upsert({
      where: { email: 'sarah.wilson@greencart.com' },
      update: {},
      create: {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@greencart.com',
        phone: '+1-555-0104',
        licenseNumber: 'DL001237',
        vehicleType: 'Truck',
        maxHoursPerDay: 9,
        hourlyRate: 26.0
      }
    }),
    prisma.driver.upsert({
      where: { email: 'david.brown@greencart.com' },
      update: {},
      create: {
        name: 'David Brown',
        email: 'david.brown@greencart.com',
        phone: '+1-555-0105',
        licenseNumber: 'DL001238',
        vehicleType: 'Van',
        maxHoursPerDay: 8,
        hourlyRate: 25.0
      }
    })
  ])
  console.log('✅ Created drivers:', drivers.length)

  // Create sample routes
  const routes = await Promise.all([
    prisma.route.upsert({
      where: { name: 'Downtown Express' },
      update: {},
      create: {
        name: 'Downtown Express',
        startLocation: 'Warehouse A',
        endLocation: 'Downtown Business District',
        distance: 15.5,
        estimatedTime: 45,
        fuelCost: 0.12
      }
    }),
    prisma.route.upsert({
      where: { name: 'Suburban Route' },
      update: {},
      create: {
        name: 'Suburban Route',
        startLocation: 'Warehouse A',
        endLocation: 'Suburban Mall',
        distance: 28.3,
        estimatedTime: 65,
        fuelCost: 0.15
      }
    }),
    prisma.route.upsert({
      where: { name: 'Airport Express' },
      update: {},
      create: {
        name: 'Airport Express',
        startLocation: 'Warehouse B',
        endLocation: 'International Airport',
        distance: 42.1,
        estimatedTime: 90,
        fuelCost: 0.18
      }
    }),
    prisma.route.upsert({
      where: { name: 'Industrial Zone' },
      update: {},
      create: {
        name: 'Industrial Zone',
        startLocation: 'Warehouse B',
        endLocation: 'Industrial Park',
        distance: 18.7,
        estimatedTime: 50,
        fuelCost: 0.13
      }
    }),
    prisma.route.upsert({
      where: { name: 'University Campus' },
      update: {},
      create: {
        name: 'University Campus',
        startLocation: 'Warehouse A',
        endLocation: 'University Campus',
        distance: 22.4,
        estimatedTime: 55,
        fuelCost: 0.14
      }
    })
  ])
  console.log('✅ Created routes:', routes.length)

  // Create sample orders
  const orders = await Promise.all([
    prisma.order.upsert({
      where: { orderNumber: 'ORD-001' },
      update: {},
      create: {
        orderNumber: 'ORD-001',
        customerName: 'Tech Solutions Inc.',
        customerAddress: '123 Business Ave, Downtown',
        orderValue: 2500.00,
        priority: 'urgent',
        routeId: routes[0].id
      }
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-002' },
      update: {},
      create: {
        orderNumber: 'ORD-002',
        customerName: 'MegaMart Superstore',
        customerAddress: '456 Shopping Blvd, Suburban',
        orderValue: 1800.00,
        priority: 'high',
        routeId: routes[1].id
      }
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-003' },
      update: {},
      create: {
        orderNumber: 'ORD-003',
        customerName: 'Global Imports Ltd.',
        customerAddress: '789 Cargo Way, Airport',
        orderValue: 3200.00,
        priority: 'normal',
        routeId: routes[2].id
      }
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-004' },
      update: {},
      create: {
        orderNumber: 'ORD-004',
        customerName: 'Industrial Supplies Co.',
        customerAddress: '321 Factory St, Industrial Park',
        orderValue: 950.00,
        priority: 'normal',
        routeId: routes[3].id
      }
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-005' },
      update: {},
      create: {
        orderNumber: 'ORD-005',
        customerName: 'University Bookstore',
        customerAddress: '654 Campus Dr, University',
        orderValue: 1200.00,
        priority: 'high',
        routeId: routes[4].id
      }
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-006' },
      update: {},
      create: {
        orderNumber: 'ORD-006',
        customerName: 'Office Depot',
        customerAddress: '987 Work St, Downtown',
        orderValue: 750.00,
        priority: 'low',
        routeId: routes[0].id
      }
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-007' },
      update: {},
      create: {
        orderNumber: 'ORD-007',
        customerName: 'Home Improvement Store',
        customerAddress: '147 DIY Ave, Suburban',
        orderValue: 2100.00,
        priority: 'normal',
        routeId: routes[1].id
      }
    }),
    prisma.order.upsert({
      where: { orderNumber: 'ORD-008' },
      update: {},
      create: {
        orderNumber: 'ORD-008',
        customerName: 'Electronics Warehouse',
        customerAddress: '258 Tech Blvd, Industrial Park',
        orderValue: 4500.00,
        priority: 'urgent',
        routeId: routes[3].id
      }
    })
  ])
  console.log('✅ Created orders:', orders.length)

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