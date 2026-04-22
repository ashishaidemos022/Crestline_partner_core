export type Address = {
  street?: string
  street2?: string
  city?: string
  state?: string
  zip?: string
  postal_code?: string
} | null

export type Customer = {
  cid: string
  first_name: string
  last_name: string
  email: string
  phone: string
  mailing_address: Address
  source: string | null
  created_at: string | null
  updated_at: string | null
}

export type PolicyType = 'auto' | 'home' | 'umbrella'
export type PolicyStatus = 'active' | 'pending_renewal' | 'cancelled' | 'lapsed' | string

export type Policy = {
  id: string
  customer_id: string
  policy_number: string
  type: PolicyType
  status: PolicyStatus
  effective_date: string
  expiration_date: string
  premium_amount: number | null
  dwelling_address: Address
  created_at: string | null
  updated_at: string | null
}

export type Vehicle = {
  id: string
  policy_id: string
  vin: string | null
  year: number
  make: string
  model: string
  trim: string | null
  usage: string | null
  annual_mileage: number | null
  ownership: 'owned' | 'financed' | 'leased' | null
  lienholder_name: string | null
  lienholder_address: Address
  garaging_address: Address
  status: string
}

export type Driver = {
  id: string
  policy_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  license_number: string | null
  license_state: string | null
  relationship: 'self' | 'spouse' | 'child' | 'other' | null
  is_primary_named_insured: boolean | null
  primary_vehicle_id: string | null
  status: string
}

export type ClaimStatus =
  | 'reported'
  | 'assigned'
  | 'under_investigation'
  | 'estimate_pending'
  | 'closed'
  | 'denied'
  | string

export type LossType =
  | 'collision'
  | 'comprehensive'
  | 'glass'
  | 'water_damage'
  | 'fire'
  | 'theft'
  | 'liability'
  | string

export type Claim = {
  id: string
  customer_id: string
  policy_id: string
  claim_number: string
  loss_type: LossType
  loss_date: string
  loss_description: string | null
  loss_location: string | null
  status: ClaimStatus
  adjuster_name: string | null
  adjuster_phone: string | null
  adjuster_email: string | null
  police_report_number: string | null
  vehicle_id: string | null
  created_at: string | null
  updated_at: string | null
}

export type BillingStatus = 'current' | 'past_due' | 'payment_pending' | string

export type BillingAccount = {
  id: string
  customer_id: string
  balance: number
  due_date: string | null
  status: BillingStatus
  payment_frequency: 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | null
  autopay_enabled: boolean | null
  paperless_enabled: boolean | null
  billing_email: string | null
  created_at: string | null
  updated_at: string | null
}

export type PaymentMethod = {
  id: string
  customer_id: string
  type: string
  last_four: string
  brand: string | null
  is_default: boolean | null
  created_at: string | null
}

export type PaymentStatus = 'completed' | 'pending' | 'failed' | string

export type Payment = {
  id: string
  billing_account_id: string
  payment_method_id: string | null
  amount: number
  status: PaymentStatus
  confirmation_number: string
  created_at: string | null
}

export type Quote = {
  id: string
  reference_number: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  quote_data: Record<string, unknown>
  estimated_premium: number | null
  coverage_level: string | null
  status: string | null
  created_at: string | null
  expires_at: string | null
}

export type AuthEvent = {
  id: string
  customer_id: string | null
  event_type: string
  delivery_method: string | null
  result: 'success' | 'failure' | string
  ip_address: string | null
  created_at: string | null
}
