import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { addCorsHeaders, handleCors } from '@/lib/cors'
import { prisma } from '@/lib/db'

async function getSimulationHistory(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Limit must be between 1 and 100' },
          { status: 400 }
        )
      )
    }

    if (offset < 0) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Offset must be non-negative' },
          { status: 400 }
        )
      )
    }

    // Get simulation history with pagination
    const [simulations, totalCount] = await Promise.all([
      prisma.simulationResult.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          numDrivers: true,
          startTime: true,
          maxHoursPerDay: true,
          totalProfit: true,
          efficiencyScore: true,
          onTimeDeliveries: true,
          lateDeliveries: true,
          totalFuelCost: true,
          averageDeliveryTime: true,
          createdAt: true
        }
      }),
      prisma.simulationResult.count()
    ])

    return addCorsHeaders(NextResponse.json({
      simulations,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    }))
  } catch (error) {
    console.error('Get simulation history error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

export const GET = withAuth(getSimulationHistory)

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
} 