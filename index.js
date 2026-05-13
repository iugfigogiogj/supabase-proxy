import Fastify from 'fastify';
import httpProxy from '@fastify/http-proxy';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: true });

await fastify.register(httpProxy, {
  upstream: process.env.SUPABASE_URL,
  prefix: '/',
  undici: true,
  websocket: true
});

const port = process.env.PORT || 8080;
fastify.listen({ port, host: '0.0.0.0' });
