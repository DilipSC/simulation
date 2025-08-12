import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './jwt'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    role: string
  }
}

export const authenticateToken = async (request: NextRequest): Promise<NextResponse | null> => {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    ;(request as AuthenticatedRequest).user = payload
    return null
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
}

export const withAuth = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return async (request: NextRequest) => {
    const authResult = await authenticateToken(request)
    if (authResult) return authResult

    return handler(request as AuthenticatedRequest)
  }
} 