import { supabase } from '../supabase-config.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' })
  }

  try {
    const { ri, senha } = req.body

    if (!ri || !senha) {
      return res.status(400).json({ success: false, error: 'RI e senha são obrigatórios' })
    }

    // Buscar servidor no banco de dados
    const { data, error } = await supabase
      .from('servidores')
      .select('*')
      .eq('ri', ri)
      .eq('senha', senha)
      .single()

    if (error || !data) {
      return res.status(401).json({ success: false, error: 'RI ou senha incorretos' })
    }

    return res.status(200).json({
      success: true,
      usuario: {
        ri: data.ri,
        nome: data.nome,
        tipo: 'servidor'
      }
    })
    
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' })
  }
}