import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type {
  Customer,
  Policy,
  Vehicle,
  Driver,
  Claim,
  BillingAccount,
  Payment,
  PaymentMethod,
  AuthEvent,
  Quote,
} from '../lib/types'

export type Customer360 = {
  customer: Customer | null
  policies: (Policy & { vehicles: Vehicle[]; drivers: Driver[] })[]
  claims: Claim[]
  billingAccount: (BillingAccount & { payments: Payment[] }) | null
  paymentMethods: PaymentMethod[]
  authEvents: AuthEvent[]
  quotes: Quote[]
  loading: boolean
}

export function useCustomer360(id: string | undefined): Customer360 {
  const [state, setState] = useState<Customer360>({
    customer: null,
    policies: [],
    claims: [],
    billingAccount: null,
    paymentMethods: [],
    authEvents: [],
    quotes: [],
    loading: true,
  })

  useEffect(() => {
    if (!id) return
    let ignore = false
    setState((s) => ({ ...s, loading: true }))

    Promise.all([
      supabase.from('customers').select('*').eq('cid', id).maybeSingle(),
      supabase
        .from('policies')
        .select('*, vehicles(*), drivers(*)')
        .eq('customer_id', id)
        // Vehicles/drivers are soft-deleted by the AI Agent (status -> 'inactive'),
        // never hard-deleted. Filter the embedded rows so removed ones don't render.
        // Parent policy rows are preserved even when no active children match.
        .eq('vehicles.status', 'active')
        .eq('drivers.status', 'active'),
      supabase
        .from('claims')
        .select('*')
        .eq('customer_id', id)
        .order('loss_date', { ascending: false }),
      supabase
        .from('billing_accounts')
        .select('*, payments(*)')
        .eq('customer_id', id)
        .maybeSingle(),
      supabase
        .from('payment_methods')
        .select('*')
        .eq('customer_id', id)
        .order('is_default', { ascending: false }),
      supabase
        .from('auth_events')
        .select('*')
        .eq('customer_id', id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]).then(async ([c, p, cl, b, pm, ae]) => {
      if (ignore) return
      const customer = (c.data as Customer) ?? null
      const quotesRes = customer?.email
        ? await supabase.from('quotes').select('*').eq('contact_email', customer.email)
        : { data: [] }

      if (ignore) return
      const billingAccount = b.data as (BillingAccount & { payments: Payment[] }) | null
      if (billingAccount?.payments) {
        billingAccount.payments = [...billingAccount.payments].sort(
          (a, z) => (z.created_at ?? '').localeCompare(a.created_at ?? ''),
        )
      }
      setState({
        customer,
        policies: (p.data as Customer360['policies']) ?? [],
        claims: (cl.data as Claim[]) ?? [],
        billingAccount,
        paymentMethods: (pm.data as PaymentMethod[]) ?? [],
        authEvents: (ae.data as AuthEvent[]) ?? [],
        quotes: (quotesRes.data as Quote[]) ?? [],
        loading: false,
      })
    })

    return () => {
      ignore = true
    }
  }, [id])

  return state
}
