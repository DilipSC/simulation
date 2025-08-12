import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { addCorsHeaders, handleCors } from '@/lib/cors'

// GET /api/routes - Get all routes
async function getRoutes(request: AuthenticatedRequest) {
  try {
    const routes = await prisma.route.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return addCorsHeaders(NextResponse.json(routes))
  } catch (error) {
    console.error('Get routes error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

// POST /api/routes - Create a new route
async function createRoute(request: AuthenticatedRequest) {
  try {
    const body = await request.json()
    const { name, startLocation, endLocation, distance, estimatedTime, fuelCost } = body

    // Validation
    if (!name || !startLocation || !endLocation || !distance || !estimatedTime || !fuelCost) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'All fields are required: name, startLocation, endLocation, distance, estimatedTime, fuelCost' },
          { status: 400 }
        )
      )
    }

    // Validate numeric values
    if (distance <= 0 || estimatedTime <= 0 || fuelCost < 0) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Distance, estimated time, and fuel cost must be positive values' },
          { status: 400 }
        )
      )
    }

    const route = await prisma.route.create({
      data: {
        name,
        startLocation,
        endLocation,
        distance: parseFloat(distance),
        estimatedTime: parseInt(estimatedTime),
        fuelCost: parseFloat(fuelCost)
      }
    })

    return addCorsHeaders(NextResponse.json(route, { status: 201 }))
  } catch (error) {
    console.error('Create route error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

export const GET = withAuth(getRoutes)
export const POST = withAuth(createRoute)

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
} 