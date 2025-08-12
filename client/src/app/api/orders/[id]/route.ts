import { NextRequest, NextResponse } from "next/server"
import { withAuth, AuthenticatedRequest } from "@/lib/auth-middleware"
import { addCorsHeaders, handleCors } from "@/lib/cors"
import { prisma } from "@/lib/db"

// Wrapper functions to handle params
const getOrderHandler = async (request: AuthenticatedRequest, id: string) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        driver: true,
        route: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

const updateOrderHandler = async (request: AuthenticatedRequest, id: string) => {
  try {
    const body = await request.json()
    const { orderNumber, customerName, customerAddress, orderValue, priority, status, driverId, routeId } = body

    // Validation
    if (!orderNumber || !customerName || !customerAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (orderValue < 0) {
      return NextResponse.json(
        { error: "Order value cannot be negative" },
        { status: 400 }
      )
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Check for order number conflict (if order number is being changed)
    if (orderNumber !== existingOrder.orderNumber) {
      const orderNumberConflict = await prisma.order.findUnique({
        where: { orderNumber },
      })

      if (orderNumberConflict) {
        return NextResponse.json(
          { error: "Order number already exists" },
          { status: 409 }
        )
      }
    }

    // Check if driver exists (if driverId is provided)
    if (driverId) {
      const driver = await prisma.driver.findUnique({
        where: { id: driverId },
      })

      if (!driver) {
        return NextResponse.json(
          { error: "Driver not found" },
          { status: 400 }
        )
      }
    }

    // Check if route exists (if routeId is provided)
    if (routeId) {
      const route = await prisma.route.findUnique({
        where: { id: routeId },
      })

      if (!route) {
        return NextResponse.json(
          { error: "Route not found" },
          { status: 400 }
        )
      }
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        orderNumber,
        customerName,
        customerAddress,
        orderValue,
        priority,
        status,
        driverId: driverId || null,
        routeId: routeId || null,
      },
      include: {
        driver: true,
        route: true,
      },
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

const deleteOrderHandler = async (request: AuthenticatedRequest, id: string) => {
  try {
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Check if order is in progress (cannot delete in-progress orders)
    if (existingOrder.status === 'in-transit' || existingOrder.status === 'assigned') {
      return NextResponse.json(
        { error: "Cannot delete order that is in progress" },
        { status: 400 }
      )
    }

    // Delete order
    await prisma.order.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Order deleted successfully" })
  } catch (error) {
    console.error("Error deleting order:", error)
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
    return getOrderHandler(req, params.id)
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
    return updateOrderHandler(req, params.id)
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
    return deleteOrderHandler(req, params.id)
  })(request)

  return addCorsHeaders(authResult)
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request)
} 