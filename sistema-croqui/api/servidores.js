import { supabase } from '../supabase-config.js'

export default async function handler(req, res) {
  // 🔧 ADICIONADO: Log para debug
  console.log(`📦 API Servidores - ${req.method} ${req.url} - ${new Date().toISOString()}`);
  
  // Configurar CORS (igual aos outros arquivos API)
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // 🔧 EXTRAIR ID DA URL (Suporte a /api/servidores/123)
  const urlParts = req.url.split('/')
  let idFromPath = null
  if (urlParts.length >= 4 && urlParts[3] !== '') {
    idFromPath = urlParts[3]
  }

  // GET: Listar todos os servidores ou um específico
  if (req.method === 'GET') {
    try {
      console.log('🔄 Buscando servidores...');
      
      // Se tem ID na URL, buscar servidor específico
      if (idFromPath) {
        const { data, error } = await supabase
          .from('servidores')
          .select('id, ri, nome, data_criacao')
          .eq('id', idFromPath)
          .single()

        if (error || !data) {
          console.error('❌ Servidor não encontrado:', error);
          return res.status(404).json({ 
            success: false, 
            error: 'Servidor não encontrado' 
          })
        }

        console.log('✅ Servidor encontrado:', data.id);
        return res.status(200).json({ 
          success: true, 
          dados: data 
        })
      }

      // Listar todos os servidores (sem senha por segurança)
      const { data, error } = await supabase
        .from('servidores')
        .select('id, ri, nome, data_criacao')
        .order('nome', { ascending: true })

      if (error) {
        console.error('❌ Erro ao buscar servidores:', error);
        return res.status(500).json({ 
          success: false, 
          error: error.message 
        })
      }

      console.log(`✅ ${data.length} servidores encontrados`);
      return res.status(200).json({ 
        success: true, 
        total: data.length,
        dados: data 
      })

    } catch (error) {
      console.error('💥 Erro interno no GET:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      })
    }
  }

  // POST: Criar novo servidor
  if (req.method === 'POST') {
    try {
      const { ri, nome, senha } = req.body
      
      console.log('🔄 Criando novo servidor:', { ri, nome });

      // Validações básicas
      if (!ri || !nome || !senha) {
        return res.status(400).json({ 
          success: false, 
          error: 'RI, nome e senha são obrigatórios' 
        })
      }

      if (senha.length < 4) {
        return res.status(400).json({ 
          success: false, 
          error: 'Senha deve ter pelo menos 4 caracteres' 
        })
      }

      // Verificar se RI já existe
      const { data: existing } = await supabase
        .from('servidores')
        .select('ri')
        .eq('ri', ri)
        .single()

      if (existing) {
        console.log('⚠️ RI já cadastrado:', ri);
        return res.status(409).json({ 
          success: false, 
          error: 'RI já está cadastrado' 
        })
      }

      // ⚠️ ALERTA DE SEGURANÇA CRÍTICA:
      // Senhas NÃO devem ser armazenadas em texto puro!
      // Em produção, substitua por: senha_hash = await bcrypt.hash(senha, 10)
      const { data, error } = await supabase
        .from('servidores')
        .insert([
          {
            ri,
            nome,
            senha, // ← TEXTO PURO (PERIGOSO! Corrija para produção)
            data_criacao: new Date().toISOString()
          }
        ])
        .select('id, ri, nome, data_criacao')

      if (error) {
        console.error('❌ Erro ao criar servidor:', error);
        return res.status(500).json({ 
          success: false, 
          error: error.message 
        })
      }

      console.log('✅ Servidor criado:', data[0].id);
      return res.status(201).json({ 
        success: true, 
        servidor: data[0],
        mensagem: 'Servidor cadastrado com sucesso' 
      })

    } catch (error) {
      console.error('💥 Erro interno no POST:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      })
    }
  }

  // PUT: Atualizar servidor
  if (req.method === 'PUT') {
    try {
      const servidorId = idFromPath || req.query.id
      
      if (!servidorId) {
        return res.status(400).json({ 
          success: false, 
          error: 'ID do servidor é obrigatório' 
        })
      }

      console.log('🔄 Atualizando servidor:', servidorId);

      const { ri, nome, senha } = req.body
      const updates = {}

      // Apenas atualizar campos que foram fornecidos
      if (ri !== undefined) updates.ri = ri
      if (nome !== undefined) updates.nome = nome
      if (senha !== undefined) {
        if (senha.length < 4) {
          return res.status(400).json({ 
            success: false, 
            error: 'Senha deve ter pelo menos 4 caracteres' 
          })
        }
        updates.senha = senha // ← TEXTO PURO (Corrija para produção)
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Nenhum dado para atualizar' 
        })
      }

      // Se RI está sendo alterado, verificar se novo RI já existe
      if (updates.ri) {
        const { data: existing } = await supabase
          .from('servidores')
          .select('id')
          .eq('ri', updates.ri)
          .neq('id', servidorId)
          .single()

        if (existing) {
          console.log('⚠️ Novo RI já em uso:', updates.ri);
          return res.status(409).json({ 
            success: false, 
            error: 'Novo RI já está em uso por outro servidor' 
          })
        }
      }

      updates.data_atualizacao = new Date().toISOString()

      const { data, error } = await supabase
        .from('servidores')
        .update(updates)
        .eq('id', servidorId)
        .select('id, ri, nome, data_criacao')

      if (error) {
        console.error('❌ Erro ao atualizar servidor:', error);
        return res.status(500).json({ 
          success: false, 
          error: error.message 
        })
      }

      if (!data || data.length === 0) {
        console.error('❌ Servidor não encontrado para atualizar:', servidorId);
        return res.status(404).json({ 
          success: false, 
          error: 'Servidor não encontrado' 
        })
      }

      console.log('✅ Servidor atualizado:', servidorId);
      return res.status(200).json({ 
        success: true, 
        servidor: data[0],
        mensagem: 'Servidor atualizado com sucesso' 
      })

    } catch (error) {
      console.error('💥 Erro interno no PUT:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      })
    }
  }

  // DELETE: Remover servidor
  if (req.method === 'DELETE') {
    try {
      const servidorId = idFromPath || req.query.id
      
      if (!servidorId) {
        return res.status(400).json({ 
          success: false, 
          error: 'ID do servidor é obrigatório' 
        })
      }

      console.log('🔄 Excluindo servidor:', servidorId);

      // Primeiro verificar se existe
      const { data: existing } = await supabase
        .from('servidores')
        .select('id')
        .eq('id', servidorId)
        .single()

      if (!existing) {
        console.error('❌ Servidor não encontrado para exclusão:', servidorId);
        return res.status(404).json({ 
          success: false, 
          error: 'Servidor não encontrado' 
        })
      }

      // Verificar se o servidor tem solicitações atribuídas (opcional)
      const { data: solicitacoes } = await supabase
        .from('solicitacoes')
        .select('id')
        .eq('servidor_responsavel', servidorId)
        .limit(1)

      if (solicitacoes && solicitacoes.length > 0) {
        console.log('⚠️ Servidor tem solicitações:', servidorId);
        return res.status(400).json({ 
          success: false, 
          error: 'Não é possível excluir servidor com solicitações atribuídas' 
        })
      }

      const { error } = await supabase
        .from('servidores')
        .delete()
        .eq('id', servidorId)

      if (error) {
        console.error('❌ Erro ao excluir servidor:', error);
        return res.status(500).json({ 
          success: false, 
          error: error.message 
        })
      }

      console.log('✅ Servidor excluído:', servidorId);
      return res.status(200).json({ 
        success: true,
        mensagem: 'Servidor excluído com sucesso' 
      })

    } catch (error) {
      console.error('💥 Erro interno no DELETE:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      })
    }
  }

  // Método não suportado
  console.warn('⚠️ Método não permitido:', req.method);
  return res.status(405).json({ 
    success: false, 
    error: 'Método não permitido' 
  })
}
