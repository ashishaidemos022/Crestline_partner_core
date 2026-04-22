import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mmcswqvakxkyrmqvwohn.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tY3N3cXZha3hreXJtcXZ3b2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NjI0OTksImV4cCI6MjA5MTIzODQ5OX0.bpi19XYBOFAP2bd9hooD98g-RnhGz0mtdqQDEn3ym30'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
})
