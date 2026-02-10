// supabase-config.js - VERSÃO SIMPLIFICADA E ATUALIZADA
import { createClient } from '@supabase/supabase-js'

// Obter variáveis de ambiente do Vercel
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

// Criar cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})

// Log apenas para debug em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  console.log('✅ Supabase configurado. URL presente:', !!supabaseUrl)
}
