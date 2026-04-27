import { NextRequest, NextResponse } from 'next/server'
import { verifySession, SESSION_COOKIE } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value

  if (!token) return redirectToLogin(req)

  const agent = await verifySession(token)
  if (!agent) return redirectToLogin(req)

  return NextResponse.next()
}

function redirectToLogin(req: NextRequest) {
  const url = new URL('/login', req.url)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp|css|js)).*)',
  ],
}
