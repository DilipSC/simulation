import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { addCorsHeaders, handleCors } from '@/lib/cors'

// GET /api/orders/[id] - Get a specific order
async function getOrder(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        route: {
          select: {
            id: true,
            name: true,
            startLocation: true,
            endLocation: true
          }
        }
      }
    })

    if (!order) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      )
    }

    return addCorsHeaders(NextResponse.json(order))
  } catch (error) {
    console.error('Get order error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

// PUT /api/orders/[id] - Update an order
async function updateOrder(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { customerName, customerAddress, orderValue, priority, status, driverId, routeId } = body

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id }
    })

    if (!existingOrder) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      )
    }

    // Validate order value if provided
    if (orderValue !== undefined && orderValue <= 0) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Order value must be a positive number' },
          { status: 400 }
        )
      )
    }

    // Validate driver if provided
    if (driverId) {
      const driver = await prisma.driver.findUnique({
        where: { id: driverId }
      })
      if (!driver) {
        return addCorsHeaders(
          NextResponse.json(
            { error: 'Driver not found' },
            { status: 404 }
          )
        )
      }
    }

    // Validate route if provided
    if (routeId) {
      const route = await prisma.route.findUnique({
        where: { id: routeId }
      })
      if (!route) {
        return addCorsHeaders(
          NextResponse.json(
            { error: 'Route not found' },
            { status: 404 }
          )
        )
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...(customerName && { customerName }),
        ...(customerAddress && { customerAddress }),
        ...(orderValue !== undefined && { orderValue: parseFloat(orderValue) }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(driverId !== undefined && { driverId: driverId || null }),
        ...(routeId !== undefined && { routeId: routeId || null })
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        route: {
          select: {
            id: true,
            name: true,
            startLocation: true,
            endLocation: true
          }
        }
      }
    })

    return addCorsHeaders(NextResponse.json(updatedOrder))
  } catch (error) {
    console.error('Update order error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

// DELETE /api/orders/[id] - Delete an order
async function deleteOrder(request: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id }
    })

    if (!existingOrder) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      )
    }

    // Check if order is in progress
    if (existingOrder.status === 'in_transit' || existingOrder.status === 'assigned') {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Cannot delete order that is in progress' },
          { status: 400 }
        )
      )
    }

    await prisma.order.delete({
      where: { id: params.id }
    })

    return addCorsHeaders(NextResponse.json({ message: 'Order deleted successfully' }))
  } catch (error) {
    console.error('Delete order error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

export const GET = withAuth(getOrder)
export const PUT = withAuth(updateOrder)
export const DELETE = withAuth(deleteOrder)

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
} 