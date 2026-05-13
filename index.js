import Fastify from 'fastify';
import httpProxy from '@fastify/http-proxy';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: true });

const SUPABASE_URL = process.env.SUPABASE_URL;
console.log('SUPABASE_URL:', SUPABASE_URL);  // ← важно для отладки

if (!SUPABASE_URL) {
    console.error('❌ SUPABASE_URL environment variable is not set!');
    process.exit(1);
}

// Регистрируем прокси для всех методов, КРОМЕ OPTIONS
await fastify.register(httpProxy, {
  upstream: SUPABASE_URL,
  prefix: '/',
  undici: true,
  websocket: true,
  // Указываем, какие запросы проксировать. Исключаем OPTIONS.
  preHandler: (request, reply, next) => {
    if (request.method === 'OPTIONS') {
      reply.send(); // Просто завершаем OPTIONS-запрос, если он вдруг сюда попадёт
    } else {
      next();
    }
  }
});

const port = process.env.PORT || 8080;
fastify.listen({ port, host: '0.0.0.0' }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`✅ Proxy running on port ${port}`);
    console.log(`✅ Proxying to: ${SUPABASE_URL}`);
});
