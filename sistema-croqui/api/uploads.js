import { supabase } from '../supabase-config.js'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
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

    // Verificar se o bucket existe (supondo que seja 'pdfs-croqui')
    // ⚠️ Certifique-se de que o bucket 'pdfs-croqui' foi criado no Supabase Storage
    const buffer = Buffer.from(fileContent, 'base64')
    
    const caminhoArquivo = `comprovantes/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    const { data, error } = await supabase.storage
      .from('pdfs-croqui')
      .upload(caminhoArquivo, buffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (error) {
      console.error('Erro no upload para o Supabase Storage:', error)
      return res.status(500).json({ success: false, error: 'Falha no upload do arquivo: ' + error.message })
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('pdfs-croqui')
      .getPublicUrl(data.path)

    return res.status(200).json({
      success: true,
      arquivo: {
        nomeOriginal: filename,
        url: publicUrl,
        caminho: data.path,
        tamanho: buffer.length
      }
    })
    
  } catch (error) {
    console.error('Erro interno no upload:', error)
    return res.status(500).json({ success: false, error: 'Erro interno do servidor durante o upload' })
  }
}
