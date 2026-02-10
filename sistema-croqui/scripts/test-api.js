// test-api.js
import fetch from 'node-fetch'

const API_URL = 'http://localhost:3000/api' // ou seu URL do Vercel

async function testAPI() {
  console.log('🧪 Testando API...\n')
  
  // Teste 1: Status da API
  try {
    const res = await fetch(`${API_URL}`)
    const data = await res.json()
    console.log('✅ Status API:', data.status)
  } catch (err) {
    console.error('❌ Falha no teste de status:', err.message)
  }
  
  // Teste 2: Login
  try {
    const res = await fetch(`${API_URL}/login-servidor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ri: 'teste',
        senha: 'teste123'
      })
    })
    const data = await res.json()
    console.log('\n🔐 Teste Login:', data.success ? '✅' : '❌')
    console.log('Resposta:', data)
  } catch (err) {
    console.error('❌ Falha no teste de login:', err.message)
  }
  
  // Teste 3: Listar servidores
  try {
    const res = await fetch(`${API_URL}/servidores`)
    const data = await res.json()
    console.log('\n👥 Teste Servidores:', data.success ? '✅' : '❌')
    console.log('Total:', data.total || 0)
  } catch (err) {
    console.error('❌ Falha no teste de servidores:', err.message)
  }
}

testAPI()
