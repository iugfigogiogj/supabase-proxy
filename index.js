const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Ответ для проверки работоспособности
app.get('/', (req, res) => {
  res.send('AI Proxy Server is Running!');
});

// Прокси для OpenAI / ChatGPT
app.use('/openai', createProxyMiddleware({
  target: 'https://api.openai.com',
  changeOrigin: true,
  pathRewrite: { '^/openai': '' },
}));

// Прокси для Anthropic / Claude
app.use('/anthropic', createProxyMiddleware({
  target: 'https://api.anthropic.com',
  changeOrigin: true,
  pathRewrite: { '^/anthropic': '' },
}));

// Прокси для Google Gemini
app.use('/gemini', createProxyMiddleware({
  target: 'https://generativelanguage.googleapis.com',
  changeOrigin: true,
  pathRewrite: { '^/gemini': '' },
}));

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
