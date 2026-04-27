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

const VALID_ROLES = new Set(['csr', 'supervisor', 'admin'])
const [, , emailArg, nameArg, roleArg, passwordArg] = process.argv

function usage(message?: string): never {
  if (message) console.error(`✗  ${message}\n`)
  console.error('Usage: npm run admin:create-agent <email> "<full name>" <role> <password>')
  console.error('       role must be one of: csr, supervisor, admin')
  console.error('       wrap full name in quotes if it contains spaces')
  console.error('\nExample:')
  console.error('  npm run admin:create-agent john.doe@acme.com "John Doe" csr \'TempPass123!\'')
  process.exit(1)
}

if (!emailArg || !nameArg || !roleArg || !passwordArg) usage()
if (!VALID_ROLES.has(roleArg)) usage(`Invalid role: ${roleArg}`)
if (!emailArg.includes('@')) usage(`Invalid email: ${emailArg}`)
if (passwordArg.length < 8) usage('Password must be at least 8 characters')

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

async function main() {
  const email = emailArg.toLowerCase()

  const { data: existing } = await supabase
    .from('agents')
    .select('id, email')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    console.error(`✗  Agent already exists: ${email}`)
    console.error('   To rotate their password, run: npm run admin:set-password ' + email + ' <new>')
    process.exit(1)
  }

  const rounds = parseInt(process.env.BCRYPT_ROUNDS ?? '10', 10)
  const password_hash = await bcrypt.hash(passwordArg, rounds)

  const { data, error } = await supabase
    .from('agents')
    .insert({ email, full_name: nameArg, role: roleArg, password_hash })
    .select('id, email, full_name, role')
    .single()

  if (error) {
    console.error(`✗  ${error.message}`)
    process.exit(1)
  }

  console.log(`✓  Created agent: ${data.full_name} <${data.email}> (${data.role})`)
  console.log(`   Share the password with them through a secure channel.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
