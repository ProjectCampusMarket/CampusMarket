import { type NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  // For this public marketplace app, we don't need session management
  // Just pass through all requests
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
