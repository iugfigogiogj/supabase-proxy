import Fastify from 'fastify';
import httpProxy from '@fastify/http-proxy';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });

// Регистрируем плагин CORS. Он сам корректно обработает все OPTIONS-запросы (preflight).
await fastify.register(cors, { 
  origin: true,    // Разрешаем запросы с любых источников (ваш сайт на GitHub Pages)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Разрешаем все нужные методы
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey'] // Разрешаем нужные заголовки
});

// Получаем URL базы данных из переменной окружения
const SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) {
  console.error('FATAL ERROR: SUPABASE_URL environment variable is not set.');
  process.exit(1);
}
console.log(`Proxying requests to: ${SUPABASE_URL}`);

// Регистрируем прокси для ВСЕХ остальных запросов (не OPTIONS, так как их обработал CORS).
// Важно: убираем параметры, которые могут вызвать конфликт, такие как `prefix`.
await fastify.register(httpProxy, {
  upstream: SUPABASE_URL,
  // Проксируем всё: и /rest/v1/..., и любые другие пути.
  // Можно явно указать префикс, но пусть проксирует всё, что приходит.
  // undici и websocket включать обязательно для совместимости.
  undici: true,
  websocket: true
});

const port = process.env.PORT || 8080;
fastify.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`✅ Proxy server is running on port ${port}`);
  console.log(`✅ Proxying to Supabase project: ${SUPABASE_URL}`);
});
