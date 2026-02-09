import { supabase } from '../supabase-config.js'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb' // Limite de 10MB para PDFs
    }
  }
}

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
    const { filename, fileContent } = req.body

    if (!filename || !fileContent) {
      return res.status(400).json({ success: false, error: 'Nome do arquivo e conteúdo são obrigatórios' })
    }

    // Converter base64 para buffer
    const buffer = Buffer.from(fileContent, 'base64')
    
    // Fazer upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('pdfs-croqui')
      .upload(`comprovantes/${Date.now()}-${filename}`, buffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (error) {
      console.error('Erro no upload:', error)
      return res.status(500).json({ success: false, error: error.message })
    }

    // Obter URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
      .from('pdfs-croqui')
      .getPublicUrl(data.path)

    return res.status(200).json({
      success: true,
      arquivo: {
        nomeOriginal: filename,
        url: publicUrl,
        caminho: data.path
      }
    })
    
  } catch (error) {
    console.error('Erro interno:', error)
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' })
  }
}