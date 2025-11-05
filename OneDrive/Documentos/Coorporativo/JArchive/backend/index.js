import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import photoRoutes from './routes/photo.routes.js';
import syncRoutes from './routes/sync.routes.js';
import testRoutes from './routes/test.routes.js';
import folderRoutes from './routes/folder.routes.js';
import statsRoutes from './routes/stats.routes.js';
import devRoutes from './routes/dev.routes.js';
import geocodingRoutes from './routes/geocoding.routes.js';
import debugRoutes from './routes/debug.routes.js';
import analysisRoutes from './routes/analysis.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env da raiz do projeto
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

// Validação básica de configuração
if (!process.env.GOOGLE_CLIENT_ID || !process.env.SUPABASE_URL) {
  console.error('❌ ERRO: Credenciais obrigatórias faltando no .env');
  process.exit(1);
}

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Content-Length']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'photofinder-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Rotas
app.use('/api/test', testRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/geocoding', geocodingRoutes);
app.use('/api/analysis', analysisRoutes);

// Rotas de desenvolvimento (apenas em dev)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/dev', devRoutes);
  app.use('/api/debug', debugRoutes);
  console.log('🔧 Rotas de desenvolvimento habilitadas');
}

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'PhotoFinder Backend'
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Handler de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 PhotoFinder Backend → http://localhost:${PORT}`);
});
