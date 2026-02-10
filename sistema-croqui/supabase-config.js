// supabase-config.js
import { createClient } from '@supabase/supabase-js'

// Carrega do ambiente do Vercel
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

console.log('🔄 Inicializando Supabase...')
console.log('URL presente:', !!supabaseUrl)
console.log('Key presente:', !!supabaseKey)

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO CRÍTICO: Variáveis do Supabase não encontradas!')
  console.error('Verifique no Vercel Dashboard:')
  console.error('1. Settings > Environment Variables')
  console.error('2. Adicione SUPABASE_URL e SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: { persistSession: false }
})
