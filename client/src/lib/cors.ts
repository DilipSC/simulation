import { NextRequest, NextResponse } from 'next/server'

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'

export const corsHeaders = {
  'Access-Control-Allow-Origin': CORS_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
}

export const handleCors = (request: NextRequest): NextResponse | null => {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    })
  }
  return null
}

export const addCorsHeaders = (response: NextResponse): NextResponse => {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
} 