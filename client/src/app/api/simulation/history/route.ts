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

    // Get simulation history - return simple array for now
    const simulations = await prisma.simulationResult.findMany({
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
        driverUtilization: true,
        hourlyPerformance: true,
        createdAt: true
      }
    })

    // Transform the data to match frontend expectations
    const transformedSimulations = simulations.map(sim => ({
      id: sim.id,
      timestamp: sim.createdAt.toISOString(),
      numDrivers: sim.numDrivers,
      startTime: sim.startTime,
      maxHoursPerDay: sim.maxHoursPerDay,
      totalProfit: sim.totalProfit,
      efficiencyScore: sim.efficiencyScore,
      onTimeDeliveries: sim.onTimeDeliveries,
      lateDeliveries: sim.lateDeliveries,
      totalFuelCost: sim.totalFuelCost,
      averageDeliveryTime: sim.averageDeliveryTime,
      driverUtilization: Array.isArray(sim.driverUtilization) ? 
        Math.round(sim.driverUtilization.reduce((acc: number, curr: any) => acc + (curr.utilization || 0), 0) / sim.driverUtilization.length) : 0,
      hourlyPerformance: Array.isArray(sim.hourlyPerformance) ? 
        Math.round(sim.hourlyPerformance.reduce((acc: number, curr: any) => acc + (curr.deliveries || 0), 0) / sim.hourlyPerformance.length) : 0
    }))

    return addCorsHeaders(NextResponse.json(transformedSimulations))
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