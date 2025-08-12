import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { addCorsHeaders, handleCors } from '@/lib/cors'
import { SimulationEngine, SimulationParams } from '@/lib/simulation-engine'

async function runSimulation(request: AuthenticatedRequest) {
  try {
    const body = await request.json()
    const { numDrivers, startTime, maxHours } = body

    // Validation
    if (!numDrivers || !startTime || !maxHours) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'numDrivers, startTime, and maxHours are required' },
          { status: 400 }
        )
      )
    }

    if (numDrivers <= 0 || numDrivers > 20) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'numDrivers must be between 1 and 20' },
          { status: 400 }
        )
      )
    }

    if (maxHours < 4 || maxHours > 12) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'maxHours must be between 4 and 12' },
          { status: 400 }
        )
      )
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime)) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'startTime must be in HH:MM format' },
          { status: 400 }
        )
      )
    }

    // Run simulation
    const engine = new SimulationEngine()
    const params: SimulationParams = {
      numDrivers,
      startTime,
      maxHoursPerDay: maxHours
    }

    const result = await engine.runSimulation(params)

    return addCorsHeaders(NextResponse.json(result))
  } catch (error) {
    console.error('Simulation error:', error)
    
    if (error instanceof Error) {
      return addCorsHeaders(
        NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      )
    }

    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

export const POST = withAuth(runSimulation)

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
} 