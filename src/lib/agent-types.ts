export type AgentRole = 'csr' | 'supervisor' | 'admin'

export type Agent = {
  id: string
  email: string
  full_name: string
  role: AgentRole
  is_active: boolean
  must_change_password: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export type SessionAgent = {
  id: string
  email: string
  full_name: string
  role: AgentRole
  must_change_password: boolean
}
