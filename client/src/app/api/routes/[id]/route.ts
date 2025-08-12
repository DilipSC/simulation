import { NextRequest, NextResponse } from "next/server"
import { withAuth, AuthenticatedRequest } from "@/lib/auth-middleware"
import { addCorsHeaders, handleCors } from "@/lib/cors"
import { prisma } from "@/lib/db"

// Wrapper functions to handle params
const getRouteHandler = async (request: AuthenticatedRequest, id: string) => {
  try {
    const route = await prisma.route.findUnique({
      where: { id },
    })

    if (!route) {
      return NextResponse.json(
        { error: "Route not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(route)
  } catch (error) {
    console.error("Error fetching route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

const updateRouteHandler = async (request: AuthenticatedRequest, id: string) => {
  try {
    const body = await request.json()
    const { name, startLocation, endLocation, distance, estimatedTime, fuelCost } = body

    // Validation
    if (!name || !startLocation || !endLocation) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (distance < 0) {
      return NextResponse.json(
        { error: "Distance cannot be negative" },
        { status: 400 }
      )
    }

    if (estimatedTime < 0) {
      return NextResponse.json(
        { error: "Estimated time cannot be negative" },
        { status: 400 }
      )
    }

    if (fuelCost < 0) {
      return NextResponse.json(
        { error: "Fuel cost cannot be negative" },
        { status: 400 }
      )
    }

    // Check if route exists
    const existingRoute = await prisma.route.findUnique({
      where: { id },
    })

    if (!existingRoute) {
      return NextResponse.json(
        { error: "Route not found" },
        { status: 404 }
      )
    }

    // Update route
    const updatedRoute = await prisma.route.update({
      where: { id },
      data: {
        name,
        startLocation,
        endLocation,
        distance,
        estimatedTime,
        fuelCost,
      },
    })

    return NextResponse.json(updatedRoute)
  } catch (error) {
    console.error("Error updating route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

const deleteRouteHandler = async (request: AuthenticatedRequest, id: string) => {
  try {
    // Check if route exists
    const existingRoute = await prisma.route.findUnique({
      where: { id },
    })

    if (!existingRoute) {
      return NextResponse.json(
        { error: "Route not found" },
        { status: 404 }
      )
    }

    // Check if route has associated orders
    const associatedOrders = await prisma.order.findFirst({
      where: { routeId: id },
    })

    if (associatedOrders) {
      return NextResponse.json(
        { error: "Cannot delete route with associated orders" },
        { status: 400 }
      )
    }

    // Delete route
    await prisma.route.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Route deleted successfully" })
  } catch (error) {
    console.error("Error deleting route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Route handlers
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const corsResult = handleCors(request)
  if (corsResult) return corsResult

  const authResult = await withAuth(async (req: AuthenticatedRequest) => {
    return getRouteHandler(req, params.id)
  })(request)

  return addCorsHeaders(authResult)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const corsResult = handleCors(request)
  if (corsResult) return corsResult

  const authResult = await withAuth(async (req: AuthenticatedRequest) => {
    return updateRouteHandler(req, params.id)
  })(request)

  return addCorsHeaders(authResult)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const corsResult = handleCors(request)
  if (corsResult) return corsResult

  const authResult = await withAuth(async (req: AuthenticatedRequest) => {
    return deleteRouteHandler(req, params.id)
  })(request)

  return addCorsHeaders(authResult)
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request)
} 