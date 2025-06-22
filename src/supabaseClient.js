import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lzgsqcqganwtybnioiwg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6Z3NxY3FnYW53dHlibmlvaXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzgxNTAsImV4cCI6MjA2NTkxNDE1MH0.JlkaGT5MD9X2FLxYuzWTVkAgVGx9mnbsipMZapgOnWY'

export const supabase = createClient(supabaseUrl, supabaseKey)
