import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { generateToken } from '@/lib/jwt'
import { addCorsHeaders, handleCors } from '@/lib/cors'

export async function POST(request: NextRequest) {
  // Handle CORS
  const corsResult = handleCors(request)
  if (corsResult) return corsResult

  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Name, email, and password are required' },
          { status: 400 }
        )
      )
    }

    if (password.length < 6) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Password must be at least 6 characters long' },
          { status: 400 }
        )
      )
    }

    // Check if manager already exists
    const existingManager = await prisma.manager.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingManager) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Manager with this email already exists' },
          { status: 409 }
        )
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create manager
    const manager = await prisma.manager.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword
      }
    })

    // Generate token
    const token = generateToken({
      userId: manager.id,
      email: manager.email,
      role: 'manager'
    })

    return addCorsHeaders(
      NextResponse.json({
        token,
        user: {
          id: manager.id,
          email: manager.email,
          name: manager.name
        }
      }, { status: 201 })
    )
  } catch (error) {
    console.error('Signup error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request) || new NextResponse(null, { status: 200 })
} 