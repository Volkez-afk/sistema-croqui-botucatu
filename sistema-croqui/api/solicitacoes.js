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

  // POST: Criar nova solicitação
  if (req.method === 'POST') {
    try {
      const { tipo, nome, cpf, iptu, endereco, numeroImovel, bairro, quadra, lote, comprovacaoUrl } = req.body
      
      // Gerar número da solicitação
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
        console.error('Erro Supabase:', error)
        return res.status(500).json({ success: false, error: error.message })
      }

      return res.status(200).json({ success: true, solicitacao: data[0] })
      
    } catch (error) {
      console.error('Erro interno:', error)
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' })
    }
  }

  // GET: Listar solicitações
  if (req.method === 'GET') {
    try {
      const { status } = req.query
      let query = supabase.from('solicitacoes').select('*').order('data_criacao', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        return res.status(500).json({ success: false, error: error.message })
      }

      return res.status(200).json({ success: true, total: data.length, dados: data })
      
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' })
    }
  }

  // PUT: Atualizar solicitação
  if (req.method === 'PUT') {
    try {
      const { id } = req.query
      const updates = req.body

      const { data, error } = await supabase
        .from('solicitacoes')
        .update({
          ...updates,
          data_atualizacao: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) {
        return res.status(500).json({ success: false, error: error.message })
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ success: false, error: 'Solicitação não encontrada' })
      }

      return res.status(200).json({ success: true, solicitacao: data[0] })
      
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ success: false, error: 'Método não permitido' })
}