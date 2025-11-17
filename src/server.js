import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN;

// Middlewares
// CORS: aceita localhost e IPs da rede local (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    // Se CORS_ORIGIN estiver definido, usa ele
    if (CORS_ORIGIN) {
      const allowedOrigins = CORS_ORIGIN.split(',').map(o => o.trim());
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    // Permite localhost em qualquer porta
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // Permite IPs da rede local
    const localNetworkPatterns = [
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/,  // 192.168.x.x
      /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,    // 10.x.x.x
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:\d+$/, // 172.16-31.x.x
    ];
    
    if (localNetworkPatterns.some(pattern => pattern.test(origin))) {
      return callback(null, true);
    }
    
    // Em desenvolvimento, permite qualquer origem
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Middleware para logar todas as requisições
app.use((req, res, next) => {
  console.log(`[SERVER] ${req.method} ${req.path}`, {
    origin: req.headers.origin,
    ip: req.ip || req.connection.remoteAddress,
    body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined
  });
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'AeroCost API'
  });
});

// API Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✈️  AeroCost API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 API endpoints: http://localhost:${PORT}/api`);
  console.log(`🌐 Network access: http://192.168.3.247:${PORT}`);
});

export default app;

