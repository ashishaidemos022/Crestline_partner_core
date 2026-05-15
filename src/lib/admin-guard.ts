import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifySession, SESSION_COOKIE } from './auth'
import type { SessionAgent } from './agent-types'

export async function requireAdmin(): Promise<
  { ok: true; agent: SessionAgent } | { ok: false; response: NextResponse }
> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  }
  const agent = await verifySession(token)
  if (!agent) {
    return { ok: false, response: NextResponse.json({ error: 'Session expired' }, { status: 401 }) }
  }
  if (agent.role !== 'admin') {
    return { ok: false, response: NextResponse.json({ error: 'Admin role required' }, { status: 403 }) }
  }
  return { ok: true, agent }
}
