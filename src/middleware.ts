import { NextRequest, NextResponse } from 'next/server'
import { verifySession, SESSION_COOKIE } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value

  if (!token) return redirectToLogin(req)

  const agent = await verifySession(token)
  if (!agent) return redirectToLogin(req)

  if (agent.must_change_password && req.nextUrl.pathname !== '/change-password') {
    return NextResponse.redirect(new URL('/change-password', req.url))
  }

  return NextResponse.next()
}

function redirectToLogin(req: NextRequest) {
  return NextResponse.redirect(new URL('/login', req.url))
}

export const config = {
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp|css|js)).*)',
  ],
}
