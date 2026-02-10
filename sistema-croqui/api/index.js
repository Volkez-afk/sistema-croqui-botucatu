export default function handler(req, res) {
  res.status(200).json({ 
    message: 'API funcionando!',
    endpoints: [
      '/api/login-servidor',
      '/api/servidores',
      '/api/solicitacoes',
      '/api/upload'
    ]
  });
}
