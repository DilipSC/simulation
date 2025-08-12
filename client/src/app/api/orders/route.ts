import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware'
import { addCorsHeaders, handleCors } from '@/lib/cors'

// GET /api/orders - Get all orders
async function getOrders(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority

    const orders = await prisma.order.findMany({
      where,
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return addCorsHeaders(NextResponse.json(orders))
  } catch (error) {
    console.error('Get orders error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

// POST /api/orders - Create a new order
async function createOrder(request: AuthenticatedRequest) {
  try {
    const body = await request.json()
    const { orderNumber, customerName, customerAddress, orderValue, priority, driverId, routeId } = body

    // Validation
    if (!orderNumber || !customerName || !customerAddress || !orderValue) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Order number, customer name, customer address, and order value are required' },
          { status: 400 }
        )
      )
    }

    // Validate order value
    if (orderValue <= 0) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Order value must be a positive number' },
          { status: 400 }
        )
      )
    }

    // Check if order number already exists
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber }
    })

    if (existingOrder) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Order with this number already exists' },
          { status: 409 }
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

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerAddress,
        orderValue: parseFloat(orderValue),
        priority: priority || 'normal',
        driverId: driverId || null,
        routeId: routeId || null
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

    return addCorsHeaders(NextResponse.json(order, { status: 201 }))
  } catch (error) {
    console.error('Create order error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

export const GET = withAuth(getOrders)
export const POST = withAuth(createOrder)

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
} 