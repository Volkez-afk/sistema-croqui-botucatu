// Configuração do Supabase
// As chaves são carregadas SEGURAMENTE das variáveis de ambiente do Vercel
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

// Verificação para ajudar no debug
if (!supabaseUrl || !supabaseKey) {
    console.error('Erro: SUPABASE_URL ou SUPABASE_ANON_KEY não estão definidas.');
}

export const supabase = createClient(supabaseUrl, supabaseKey)
