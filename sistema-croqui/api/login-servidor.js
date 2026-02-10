// api/login-servidor.js - VERSÃO CORRIGIDA
import { supabase } from '../supabase-config.js'
import { corsMiddleware, parseJSONBody } from './_middleware.js'

async function loginHandler(req, res) {
  console.log('🔐 Login request:', req.method, new Date().toISOString())
  
  try {
    await parseJSONBody(req)
    
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        error: 'Método não permitido',
        allowed: ['POST']
      })
    }

    const { ri, senha } = req.body

    // Validação
    if (!ri || !senha) {
      return res.status(400).json({ 
        success: false, 
        error: 'RI e senha são obrigatórios',
        received: { ri: !!ri, senha: !!senha }
      })
    }

    console.log('🔄 Tentando login para RI:', ri)

    // Buscar servidor
    const { data, error } = await supabase
      .from('servidores')
      .select('*')
      .eq('ri', ri)
      .eq('senha', senha)
      .single()

    if (error) {
      console.error('❌ Erro no login:', error.message)
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciais inválidas'
      })
    }

    if (!data) {
      console.log('⚠️  Servidor não encontrado para RI:', ri)
      return res.status(404).json({ 
        success: false, 
        error: 'Servidor não encontrado'
      })
    }

    console.log('✅ Login bem-sucedido para:', data.nome)

    // NÃO envie a senha de volta!
    const usuario = {
      id: data.id,
      ri: data.ri,
      nome: data.nome,
      tipo: 'servidor',
      data_criacao: data.data_criacao
    }

    return res.status(200).json({
      success: true,
      usuario,
      token: Buffer.from(`${data.id}:${data.ri}`).toString('base64'), // Token simples
      message: 'Login realizado com sucesso'
    })

  } catch (error) {
    console.error('💥 Erro interno:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Aplicar middleware CORS
export default corsMiddleware(loginHandler)
