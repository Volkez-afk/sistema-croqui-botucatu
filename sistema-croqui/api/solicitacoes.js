import { supabase } from '../supabase-config.js'

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // 🔧 EXTRAIR ID DA URL (Suporte a /api/solicitacoes/123)
  const urlParts = req.url.split('/')
  let idFromPath = null
  // A URL será algo como '/api/solicitacoes' ou '/api/solicitacoes/123'
  if (urlParts.length >= 4 && urlParts[3] !== '') {
    idFromPath = urlParts[3]
  }

  // POST: Criar nova solicitação
  if (req.method === 'POST') {
    try {
      const { tipo, nome, cpf, iptu, endereco, numeroImovel, bairro, quadra, lote, comprovacaoUrl } = req.body
      
      if (!tipo || !nome || !iptu) {
        return res.status(400).json({ success: false, error: 'Campos obrigatórios faltando' })
      }
      
      const numero = `SOL-${Date.now().toString().slice(-6)}`
      
      const { data, error } = await supabase
        .from('solicitacoes')
        .insert([
          {
            numero,
            tipo,
            nome,
            cpf,
            iptu,
            endereco,
            numero_imovel: numeroImovel,
            bairro,
            quadra,
            lote,
            comprovacao_url: comprovacaoUrl,
            status: 'pendente'
          }
        ])
        .select()

      if (error) {
        console.error('Erro ao criar solicitação:', error)
        return res.status(500).json({ success: false, error: error.message })
      }

      return res.status(200).json({ success: true, solicitacao: data[0] })
      
    } catch (error) {
      console.error('Erro interno:', error)
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' })
    }
  }

  // GET: Listar solicitações (todas ou por status)
  if (req.method === 'GET') {
    try {
      const { status } = req.query
      let query = supabase.from('solicitacoes').select('*').order('data_criacao', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar solicitações:', error)
        return res.status(500).json({ success: false, error: error.message })
      }

      return res.status(200).json({ success: true, total: data.length, dados: data })
      
    } catch (error) {
      console.error('Erro interno:', error)
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' })
    }
  }

  // PUT: Atualizar solicitação (usa ID do caminho ou da query)
  if (req.method === 'PUT') {
    try {
      const solicitacaoId = idFromPath || req.query.id
      
      if (!solicitacaoId) {
        return res.status(400).json({ success: false, error: 'ID da solicitação é obrigatório' })
      }

      const updates = req.body

      const { data, error } = await supabase
        .from('solicitacoes')
        .update({
          ...updates,
          data_atualizacao: new Date().toISOString()
        })
        .eq('id', solicitacaoId)
        .select()

      if (error) {
        console.error('Erro ao atualizar solicitação:', error)
        return res.status(500).json({ success: false, error: error.message })
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ success: false, error: 'Solicitação não encontrada' })
      }

      return res.status(200).json({ success: true, solicitacao: data[0] })
      
    } catch (error) {
      console.error('Erro interno:', error)
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ success: false, error: 'Método não permitido' })
}
