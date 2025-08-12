import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { addCorsHeaders, handleCors } from '@/lib/cors'

// GET /api/drivers - Get all drivers
async function getDrivers(request: AuthenticatedRequest) {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return addCorsHeaders(NextResponse.json(drivers))
  } catch (error) {
    console.error('Get drivers error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

// POST /api/drivers - Create a new driver
async function createDriver(request: AuthenticatedRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, licenseNumber, vehicleType, maxHoursPerDay, hourlyRate } = body

    // Validation
    if (!name || !email || !phone || !licenseNumber || !vehicleType) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Name, email, phone, license number, and vehicle type are required' },
          { status: 400 }
        )
      )
    }

    // Check if driver with email or license already exists
    const existingDriver = await prisma.driver.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { licenseNumber }
        ]
      }
    })

    if (existingDriver) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Driver with this email or license number already exists' },
          { status: 409 }
        )
      )
    }

    const driver = await prisma.driver.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        licenseNumber,
        vehicleType,
        maxHoursPerDay: maxHoursPerDay || 8,
        hourlyRate: hourlyRate || 25.0
      }
    })

    return addCorsHeaders(NextResponse.json(driver, { status: 201 }))
  } catch (error) {
    console.error('Create driver error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

export const GET = withAuth(getDrivers)
export const POST = withAuth(createDriver)

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
} 