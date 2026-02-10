// supabase-config.js - VERSÃO CORRIGIDA
import { createClient } from '@supabase/supabase-js'

// DEBUG: Verificar ambiente
console.log('🔄 Ambiente:', process.env.NODE_ENV)
console.log('📡 Vercel URL:', process.env.VERCEL_URL)

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

// Validação mais robusta
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis do Supabase não encontradas!')
  console.error('URL:', supabaseUrl ? 'OK' : 'FALTANDO')
  console.error('KEY:', supabaseKey ? 'OK' : 'FALTANDO')
  
  // Para desenvolvimento local
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Modo desenvolvimento - usando valores padrão')
    // Adicione seus valores de teste aqui temporariamente
  }
}

// Criar cliente com configurações otimizadas
export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'x-application-name': 'sistema-croqui'
      }
    }
  }
)

// Teste de conexão
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('servidores')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Falha na conexão com Supabase:', error.message)
      return false
    }
    
    console.log('✅ Conexão com Supabase estabelecida')
    return true
  } catch (err) {
    console.error('❌ Erro no teste de conexão:', err)
    return false
  }
}
