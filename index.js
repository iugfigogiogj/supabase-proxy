import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;
const SUPABASE_URL = process.env.SUPABASE_URL;

if (!SUPABASE_URL) {
  console.error('❌ FATAL ERROR: SUPABASE_URL environment variable is not set.');
  process.exit(1);
}

console.log(`🚀 Starting proxy server...`);
console.log(`➕ Proxying requests to: ${SUPABASE_URL}`);

// Настройка CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'apikey',
    'X-Client-Info',
    'X-Requested-With',
    'accept-profile',
    'x-retry-count',
    'content-profile',
    'prefer',
    'range'
  ]
}));

// Обрабатываем предварительные OPTIONS-запросы
app.options('*', cors());

// ===== HEALTHCHECK ДЛЯ БУДИЛЬНИКА =====
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Прокси для всех остальных запросов
app.use('/', createProxyMiddleware({
  target: SUPABASE_URL,
  changeOrigin: true,
  secure: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxying ${req.method} ${req.url} -> ${SUPABASE_URL}${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`❌ Proxy error: ${err.message}`);
    res.status(500).send('Proxy encountered an error.');
  }
}));

// Запускаем сервер
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Proxy server is running on port ${PORT}`);
  console.log(`✅ Proxying to Supabase project: ${SUPABASE_URL}`);
  console.log(`✅ Healthcheck available at /health`);
});
