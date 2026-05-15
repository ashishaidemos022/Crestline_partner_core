import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { createSyntheticCustomer } from '@/lib/synthetic-customer'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  let body: { first_name?: string; last_name?: string; email?: string; phone?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const result = await createSyntheticCustomer({
    first_name: body.first_name ?? '',
    last_name: body.last_name ?? '',
    email: body.email ?? '',
    phone: body.phone ?? '',
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  return NextResponse.json({ ok: true, summary: result.summary })
}
