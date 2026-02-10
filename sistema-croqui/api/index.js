// api/index.js
// Este arquivo é ESSENCIAL para o Vercel reconhecer a API

export default function handler(req, res) {
  res.status(200).json({ 
    status: 'API online',
    message: 'Sistema de Croqui Botucatu',
    timestamp: new Date().toISOString(),
    endpoints: {
      login: '/api/login-servidor [POST]',
      servidores: '/api/servidores [GET,POST,PUT,DELETE]',
      solicitacoes: '/api/solicitacoes [GET,POST,PUT]',
      upload: '/api/upload [POST]'
    }
  });
}
