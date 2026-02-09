const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== CONFIGURAÇÃO ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));
// Servir uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar Multer para upload de PDFs
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos PDF são permitidos.'));
        }
    }
});

// ==================== "BANCO DE DADOS" EM MEMÓRIA ====================
let solicitacoes = [];
let servidores = [
    { id: '1', ri: '12345', senha: 'senha123', nome: 'Carlos Silva' },
    { id: '2', ri: '67890', senha: 'senha456', nome: 'Ana Santos' }
];
let administradores = [
    { usuario: 'admin', senha: 'admin123' },
    { usuario: 'vinicius.megetto', senha: 'PMbtu2023' }
];

// ==================== ROTAS DA API ====================

// 1. STATUS DA API
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        sistema: 'Prefeitura de Botucatu - Sistema de Croqui',
        data: new Date().toISOString()
    });
});

// 2. UPLOAD DE PDF
app.post('/api/upload', upload.single('pdf'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Nenhum arquivo enviado.' });
        }

        const fileData = {
            id: uuidv4(),
            nomeOriginal: req.file.originalname,
            nomeArquivo: req.file.filename,
            caminho: `/uploads/${req.file.filename}`,
            tamanho: req.file.size,
            dataUpload: new Date().toISOString()
        };

        res.json({
            success: true,
            mensagem: 'PDF enviado com sucesso!',
            arquivo: fileData
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro no servidor ao fazer upload.' });
    }
});

// 3. CRIAR SOLICITAÇÃO
app.post('/api/solicitacoes', (req, res) => {
    try {
        const novaSolicitacao = {
            id: uuidv4(),
            ...req.body,
            numero: `SOL-${Date.now().toString().slice(-6)}`,
            dataCriacao: new Date().toISOString(),
            status: 'pendente',
            servidorResponsavel: null,
            resultado: null,
            arquivoAnexo: req.body.arquivoAnexo || null
        };

        solicitacoes.push(novaSolicitacao);
        res.json({ success: true, solicitacao: novaSolicitacao });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao criar solicitação.' });
    }
});

// 4. LISTAR SOLICITAÇÕES
app.get('/api/solicitacoes', (req, res) => {
    const { status, tipo } = req.query;
    let filtradas = [...solicitacoes];

    if (status) {
        filtradas = filtradas.filter(s => s.status === status);
    }
    if (tipo) {
        filtradas = filtradas.filter(s => s.tipo === tipo);
    }

    filtradas.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));
    res.json({ success: true, total: filtradas.length, dados: filtradas });
});

// 5. ATUALIZAR SOLICITAÇÃO
app.put('/api/solicitacoes/:id', (req, res) => {
    const { id } = req.params;
    const index = solicitacoes.findIndex(s => s.id === id);

    if (index === -1) {
        return res.status(404).json({ success: false, error: 'Solicitação não encontrada.' });
    }

    solicitacoes[index] = { ...solicitacoes[index], ...req.body };
    res.json({ success: true, solicitacao: solicitacoes[index] });
});

// 6. LOGIN DO SERVIDOR
app.post('/api/login/servidor', (req, res) => {
    const { ri, senha } = req.body;
    const servidor = servidores.find(s => s.ri === ri && s.senha === senha);

    if (servidor) {
        res.json({
            success: true,
            usuario: {
                ri: servidor.ri,
                nome: servidor.nome,
                tipo: 'servidor'
            }
        });
    } else {
        res.status(401).json({ success: false, error: 'RI ou senha incorretos.' });
    }
});

// 7. LOGIN DO ADMINISTRADOR
app.post('/api/login/admin', (req, res) => {
    const { usuario, senha } = req.body;
    const admin = administradores.find(a => a.usuario === usuario && a.senha === senha);

    if (admin) {
        res.json({
            success: true,
            usuario: {
                nome: admin.usuario,
                tipo: 'administrador'
            }
        });
    } else {
        res.status(401).json({ success: false, error: 'Credenciais inválidas.' });
    }
});

// 8. GERENCIAMENTO DE SERVIDORES (APENAS ADMIN)
app.get('/api/admin/servidores', (req, res) => {
    res.json({ success: true, dados: servidores });
});

app.post('/api/admin/servidores', (req, res) => {
    const novoServidor = {
        id: uuidv4(),
        ...req.body,
        dataCadastro: new Date().toISOString()
    };
    servidores.push(novoServidor);
    res.json({ success: true, servidor: novoServidor });
});

// ==================== ROTAS PARA PÁGINAS FRONTEND ====================
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, error: 'Endpoint da API não encontrado.' });
    }
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════════════════╗
    ║        🏛️  SISTEMA DE CROQUI - PREFEITURA BOTUCATU      ║
    ╠══════════════════════════════════════════════════════════╣
    ║ ✅ Backend API: http://localhost:${PORT}/api/status       ║
    ║ 🌐 Frontend:    http://localhost:${PORT}                 ║
    ╠══════════════════════════════════════════════════════════╣
    ║ 📁 Uploads:     http://localhost:${PORT}/uploads/        ║
    ╚══════════════════════════════════════════════════════════╝
    `);
});