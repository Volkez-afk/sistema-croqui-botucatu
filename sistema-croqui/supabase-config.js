// Configuração do Supabase - NÃO coloque as chaves reais aqui!
// As chaves serão configuradas como variáveis de ambiente no Vercel
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.https://ybanzrltebhnmlcfnkah.supabase.co
const supabaseKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliYW56cmx0ZWJobm1sY2Zua2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NDE2NjgsImV4cCI6MjA4NjIxNzY2OH0.aXyRjsqkoXFarE9w8IfnFqsWGPu0mvVXL5TXfHrcBFg

export const supabase = createClient(supabaseUrl, supabaseKey)