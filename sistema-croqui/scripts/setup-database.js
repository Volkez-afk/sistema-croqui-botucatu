// setup-database.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configure SUPABASE_URL e SUPABASE_ANON_KEY no .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupDatabase() {
  console.log('🗄️  Configurando banco de dados...\n')
  
  // SQL para criar tabelas
  const sqlCommands = [
    `CREATE TABLE IF NOT EXISTS servidores (
      id SERIAL PRIMARY KEY,
      ri TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      senha TEXT NOT NULL,
      data_criacao TIMESTAMP DEFAULT NOW(),
      data_atualizacao TIMESTAMP DEFAULT NOW()
    );`,
    
    `CREATE TABLE IF NOT EXISTS solicitacoes (
      id SERIAL PRIMARY KEY,
      numero TEXT UNIQUE NOT NULL,
      tipo TEXT NOT NULL,
      nome TEXT NOT NULL,
      cpf TEXT,
      iptu TEXT NOT NULL,
      endereco TEXT,
      numero_imovel TEXT,
      bairro TEXT,
      quadra TEXT,
      lote TEXT,
      comprovacao_url TEXT,
      status TEXT DEFAULT 'pendente',
      servidor_responsavel INTEGER REFERENCES servidores(id),
      data_criacao TIMESTAMP DEFAULT NOW(),
      data_atualizacao TIMESTAMP DEFAULT NOW()
    );`,
    
    `CREATE INDEX IF NOT EXISTS idx_servidores_ri ON servidores(ri);`,
    `CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes(status);`,
    `CREATE INDEX IF NOT EXISTS idx_solicitacoes_numero ON solicitacoes(numero);`
  ]
  
  try {
    // Executar comandos SQL
    for (const sql of sqlCommands) {
      const { error } = await supabase.rpc('exec_sql', { query: sql })
      if (error) {
        console.log('⚠️  Nota:', error.message)
      } else {
        console.log('✅ Comando executado')
      }
    }
    
    // Criar servidor admin padrão
    const { error: insertError } = await supabase
      .from('servidores')
      .insert([
        {
          ri: 'admin',
          nome: 'Administrador',
          senha: 'admin123'
        }
      ])
      .onConflict('ri')
      .ignore()
    
    if (!insertError) {
      console.log('\n👑 Servidor admin criado:')
      console.log('   RI: admin')
      console.log('   Senha: admin123')
      console.log('   ⚠️  Altere esta senha imediatamente!')
    }
    
    console.log('\n🎉 Configuração do banco concluída!')
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error)
  }
}

setupDatabase()
