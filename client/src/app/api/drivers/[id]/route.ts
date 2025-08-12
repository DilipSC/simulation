import { NextRequest, NextResponse } from "next/server"
import { withAuth, AuthenticatedRequest } from "@/lib/auth-middleware"
import { addCorsHeaders, handleCors } from "@/lib/cors"
import { prisma } from "@/lib/db"

// Wrapper functions to handle params
const getDriverHandler = async (request: AuthenticatedRequest, id: string) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id },
    })

    if (!driver) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(driver)
  } catch (error) {
    console.error("Error fetching driver:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

const updateDriverHandler = async (request: AuthenticatedRequest, id: string) => {
  try {
    const body = await request.json()
    const { name, email, phone, licenseNumber, vehicleType, maxHoursPerDay, hourlyRate, isActive } = body

    // Validation
    if (!name || !email || !phone || !licenseNumber || !vehicleType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (maxHoursPerDay < 1 || maxHoursPerDay > 24) {
      return NextResponse.json(
        { error: "Max hours per day must be between 1 and 24" },
        { status: 400 }
      )
    }

    if (hourlyRate < 0) {
      return NextResponse.json(
        { error: "Hourly rate cannot be negative" },
        { status: 400 }
      )
    }

    // Check if driver exists
    const existingDriver = await prisma.driver.findUnique({
      where: { id },
    })

    if (!existingDriver) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      )
    }

    // Check for email conflict (if email is being changed)
    if (email !== existingDriver.email) {
      const emailConflict = await prisma.driver.findUnique({
        where: { email },
      })

      if (emailConflict) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        )
      }
    }

    // Check for license number conflict (if license is being changed)
    if (licenseNumber !== existingDriver.licenseNumber) {
      const licenseConflict = await prisma.driver.findUnique({
        where: { licenseNumber },
      })

      if (licenseConflict) {
        return NextResponse.json(
          { error: "License number already exists" },
          { status: 409 }
        )
      }
    }

    // Update driver
    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        licenseNumber,
        vehicleType,
        maxHoursPerDay,
        hourlyRate,
        isActive,
      },
    })

    return NextResponse.json(updatedDriver)
  } catch (error) {
    console.error("Error updating driver:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

const deleteDriverHandler = async (request: AuthenticatedRequest, id: string) => {
  try {
    // Check if driver exists
    const existingDriver = await prisma.driver.findUnique({
      where: { id },
    })

    if (!existingDriver) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      )
    }

    // Check if driver has associated orders
    const associatedOrders = await prisma.order.findFirst({
      where: { driverId: id },
    })

    if (associatedOrders) {
      return NextResponse.json(
        { error: "Cannot delete driver with associated orders" },
        { status: 400 }
      )
    }

    // Delete driver
    await prisma.driver.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Driver deleted successfully" })
  } catch (error) {
    console.error("Error deleting driver:", error)
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
    return getDriverHandler(req, params.id)
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
    return updateDriverHandler(req, params.id)
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
    return deleteDriverHandler(req, params.id)
  })(request)

  return addCorsHeaders(authResult)
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
} 