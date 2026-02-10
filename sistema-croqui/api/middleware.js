// api/_middleware.js
export function corsMiddleware(handler) {
  return async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    )

    // Resposta para OPTIONS
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }

    // Executar handler original
    return handler(req, res)
  }
}

// Função helper para parse de JSON
export function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    if (req.method === 'POST' || req.method === 'PUT') {
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      req.on('end', () => {
        try {
          req.body = body ? JSON.parse(body) : {}
          resolve()
        } catch (err) {
          reject(new Error('JSON inválido'))
        }
      })
    } else {
      req.body = {}
      resolve()
    }
  })
}
