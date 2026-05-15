import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkEmailAvailable, validatePatchInput } from '@/lib/synthetic-customer'

type Patch = {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ cid: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { cid } = await params

  let raw: Patch
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const patch: Patch = {}
  if (typeof raw.first_name === 'string') patch.first_name = raw.first_name.trim()
  if (typeof raw.last_name === 'string') patch.last_name = raw.last_name.trim()
  if (typeof raw.email === 'string') patch.email = raw.email.trim()
  if (typeof raw.phone === 'string') patch.phone = raw.phone.trim()

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 })
  }

  const validationError = validatePatchInput(patch)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  if (patch.email) {
    const emailError = await checkEmailAvailable(patch.email, cid)
    if (emailError) return NextResponse.json({ error: emailError }, { status: 409 })
  }

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from('customers')
    .update(patch)
    .eq('cid', cid)
    .select('cid, first_name, last_name, email, phone')
    .single()

  if (updateErr || !updated) {
    const msg = updateErr?.message ?? 'Customer not found'
    const isDup = msg.toLowerCase().includes('phone') && msg.toLowerCase().includes('unique')
    return NextResponse.json({ error: isDup ? 'Phone number already in use' : msg }, { status: 409 })
  }

  // Sync the name on the customer's "self / primary named insured" driver rows so the policy display matches.
  if (patch.first_name !== undefined || patch.last_name !== undefined) {
    const policyIds = await supabaseAdmin
      .from('policies')
      .select('id')
      .eq('customer_id', cid)
    const ids = (policyIds.data ?? []).map((r) => r.id as string)
    if (ids.length > 0) {
      const driverPatch: Record<string, string> = {}
      if (patch.first_name !== undefined) driverPatch.first_name = patch.first_name
      if (patch.last_name !== undefined) driverPatch.last_name = patch.last_name
      await supabaseAdmin
        .from('drivers')
        .update(driverPatch)
        .in('policy_id', ids)
        .eq('relationship', 'self')
        .eq('is_primary_named_insured', true)
    }
  }

  return NextResponse.json({ ok: true, customer: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ cid: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { cid } = await params

  const [policyIdsRes, billingIdsRes] = await Promise.all([
    supabaseAdmin.from('policies').select('id').eq('customer_id', cid),
    supabaseAdmin.from('billing_accounts').select('id').eq('customer_id', cid),
  ])
  const policyIds = (policyIdsRes.data ?? []).map((r) => r.id as string)
  const billingIds = (billingIdsRes.data ?? []).map((r) => r.id as string)

  const [vehicles, drivers, payments, methods, claims] = await Promise.all([
    policyIds.length
      ? supabaseAdmin.from('vehicles').select('id', { count: 'exact', head: true }).in('policy_id', policyIds)
      : Promise.resolve({ count: 0 } as { count: number | null }),
    policyIds.length
      ? supabaseAdmin.from('drivers').select('id', { count: 'exact', head: true }).in('policy_id', policyIds)
      : Promise.resolve({ count: 0 } as { count: number | null }),
    billingIds.length
      ? supabaseAdmin.from('payments').select('id', { count: 'exact', head: true }).in('billing_account_id', billingIds)
      : Promise.resolve({ count: 0 } as { count: number | null }),
    supabaseAdmin.from('payment_methods').select('id', { count: 'exact', head: true }).eq('customer_id', cid),
    supabaseAdmin.from('claims').select('id', { count: 'exact', head: true }).eq('customer_id', cid),
  ])
  const { error } = await supabaseAdmin.from('customers').delete().eq('cid', cid)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    cascaded: {
      policies: policyIds.length,
      vehicles: vehicles.count ?? 0,
      drivers: drivers.count ?? 0,
      billing_accounts: billingIds.length,
      payments: payments.count ?? 0,
      payment_methods: methods.count ?? 0,
      claims: claims.count ?? 0,
    },
  })
}
