import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { addCorsHeaders, handleCors } from '@/lib/cors'

// GET /api/routes/[id] - Get a specific route
async function getRoute(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const route = await prisma.route.findUnique({
      where: { id: params.id }
    })

    if (!route) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Route not found' },
          { status: 404 }
        )
      )
    }

    return addCorsHeaders(NextResponse.json(route))
  } catch (error) {
    console.error('Get route error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

// PUT /api/routes/[id] - Update a route
async function updateRoute(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, startLocation, endLocation, distance, estimatedTime, fuelCost } = body

    // Check if route exists
    const existingRoute = await prisma.route.findUnique({
      where: { id: params.id }
    })

    if (!existingRoute) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Route not found' },
          { status: 404 }
        )
      )
    }

    // Validate numeric values if provided
    if (distance !== undefined && distance <= 0) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Distance must be a positive value' },
          { status: 400 }
        )
      )
    }

    if (estimatedTime !== undefined && estimatedTime <= 0) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Estimated time must be a positive value' },
          { status: 400 }
        )
      )
    }

    if (fuelCost !== undefined && fuelCost < 0) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Fuel cost must be a non-negative value' },
          { status: 400 }
        )
      )
    }

    const updatedRoute = await prisma.route.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(startLocation && { startLocation }),
        ...(endLocation && { endLocation }),
        ...(distance !== undefined && { distance: parseFloat(distance) }),
        ...(estimatedTime !== undefined && { estimatedTime: parseInt(estimatedTime) }),
        ...(fuelCost !== undefined && { fuelCost: parseFloat(fuelCost) })
      }
    })

    return addCorsHeaders(NextResponse.json(updatedRoute))
  } catch (error) {
    console.error('Update route error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

// DELETE /api/routes/[id] - Delete a route
async function deleteRoute(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    // Check if route exists
    const existingRoute = await prisma.route.findUnique({
      where: { id: params.id }
    })

    if (!existingRoute) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Route not found' },
          { status: 404 }
        )
      )
    }

    // Check if route has associated orders
    const associatedOrders = await prisma.order.findFirst({
      where: { routeId: params.id }
    })

    if (associatedOrders) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Cannot delete route with associated orders' },
          { status: 400 }
        )
      )
    }

    await prisma.route.delete({
      where: { id: params.id }
    })

    return addCorsHeaders(NextResponse.json({ message: 'Route deleted successfully' }))
  } catch (error) {
    console.error('Delete route error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

export const GET = withAuth(getRoute)
export const PUT = withAuth(updateRoute)
export const DELETE = withAuth(deleteRoute)

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
} 