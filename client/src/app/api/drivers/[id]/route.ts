import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { addCorsHeaders, handleCors } from '@/lib/cors'

// GET /api/drivers/[id] - Get a specific driver
async function getDriver(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: params.id }
    })

    if (!driver) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Driver not found' },
          { status: 404 }
        )
      )
    }

    return addCorsHeaders(NextResponse.json(driver))
  } catch (error) {
    console.error('Get driver error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

// PUT /api/drivers/[id] - Update a driver
async function updateDriver(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, email, phone, licenseNumber, vehicleType, maxHoursPerDay, hourlyRate, isActive } = body

    // Check if driver exists
    const existingDriver = await prisma.driver.findUnique({
      where: { id: params.id }
    })

    if (!existingDriver) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Driver not found' },
          { status: 404 }
        )
      )
    }

    // Check for conflicts if email or license is being updated
    if (email || licenseNumber) {
      const conflictDriver = await prisma.driver.findFirst({
        where: {
          AND: [
            { id: { not: params.id } },
            {
              OR: [
                ...(email ? [{ email: email.toLowerCase() }] : []),
                ...(licenseNumber ? [{ licenseNumber }] : [])
              ]
            }
          ]
        }
      })

      if (conflictDriver) {
        return addCorsHeaders(
          NextResponse.json(
            { error: 'Driver with this email or license number already exists' },
            { status: 409 }
          )
        )
      }
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        ...(phone && { phone }),
        ...(licenseNumber && { licenseNumber }),
        ...(vehicleType && { vehicleType }),
        ...(maxHoursPerDay !== undefined && { maxHoursPerDay }),
        ...(hourlyRate !== undefined && { hourlyRate }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return addCorsHeaders(NextResponse.json(updatedDriver))
  } catch (error) {
    console.error('Update driver error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

// DELETE /api/drivers/[id] - Delete a driver
async function deleteDriver(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    // Check if driver exists
    const existingDriver = await prisma.driver.findUnique({
      where: { id: params.id }
    })

    if (!existingDriver) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Driver not found' },
          { status: 404 }
        )
      )
    }

    // Check if driver has associated orders
    const associatedOrders = await prisma.order.findFirst({
      where: { driverId: params.id }
    })

    if (associatedOrders) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Cannot delete driver with associated orders' },
          { status: 400 }
        )
      )
    }

    await prisma.driver.delete({
      where: { id: params.id }
    })

    return addCorsHeaders(NextResponse.json({ message: 'Driver deleted successfully' }))
  } catch (error) {
    console.error('Delete driver error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

export const GET = withAuth(getDriver)
export const PUT = withAuth(updateDriver)
export const DELETE = withAuth(deleteDriver)

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
} 