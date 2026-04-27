import { loadEnvConfig } from '@next/env'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

loadEnvConfig(process.cwd())

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const [, , emailArg, passwordArg] = process.argv

if (!emailArg || !passwordArg) {
  console.error('Usage: npm run admin:set-password <email> <new-password>')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

async function main() {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS ?? '10', 10)
  const password_hash = await bcrypt.hash(passwordArg, rounds)

  const { data, error } = await supabase
    .from('agents')
    .update({ password_hash })
    .eq('email', emailArg.toLowerCase())
    .select('id, email, full_name')
    .maybeSingle()

  if (error) {
    console.error(`✗  ${error.message}`)
    process.exit(1)
  }
  if (!data) {
    console.error(`✗  No agent found with email: ${emailArg}`)
    process.exit(1)
  }

  console.log(`✓  Password updated for ${data.full_name} <${data.email}>`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
