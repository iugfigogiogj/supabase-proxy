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

// 1. Включаем CORS для всех входящих запросов (с вашего GitHub Pages)
// Это самый простой и надёжный способ.
app.use(cors({
  origin: true, // Разрешить запросы с любых источников
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey', 'X-Client-Info', 'X-Requested-With']
}));

// 2. Настраиваем прокси для всех запросов, которые приходят на сервер.
// Этот middleware перехватывает любой запрос и перенаправляет его на Supabase.
app.use('/', createProxyMiddleware({
  target: SUPABASE_URL,
  changeOrigin: true, // Менять Origin заголовок на целевой хост (важно для Supabase)
  secure: true,      // Проверять SSL-сертификаты
  logLevel: 'debug', // Полезно для отладки, в логах Render будет видно, куда идёт запрос
  onProxyReq: (proxyReq, req, res) => {
    // Опционально: можно логировать каждый запрос
    console.log(`🔄 Proxying ${req.method} ${req.url} -> ${SUPABASE_URL}${req.url}`);
  },
  onError: (err, req, res) => {
    console.error(`❌ Proxy error: ${err.message}`);
    res.status(500).send('Proxy encountered an error.');
  }
}));

// 3. Запускаем сервер
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Proxy server is running on port ${PORT}`);
  console.log(`✅ Proxying to Supabase project: ${SUPABASE_URL}`);
  console.log(`✅ Ready to accept requests from your frontend.`);
});
