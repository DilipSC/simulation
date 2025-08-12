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
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        )
      )
    }

    // Find manager
    const manager = await prisma.manager.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!manager) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, manager.password)
    if (!isValidPassword) {
      return addCorsHeaders(
        NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      )
    }

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
      })
    )
  } catch (error) {
    console.error('Login error:', error)
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