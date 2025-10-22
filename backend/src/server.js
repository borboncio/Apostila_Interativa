const express = require('express');
const cors = require('cors');

const config = require('./config/env');
const routes = require('./routes');
const supabase = require('./services/supabase');

const app = express();

if (!supabase.isConfigured()) {
  console.warn('⚠️  Variáveis do Supabase não configuradas. Funcionalidades de banco de dados ficarão indisponíveis.');
}

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo à API da Apostila Interativa!',
    environment: config.env
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Rota não encontrada'
  });
});

app.use((err, req, res, next) => {
  console.error('Erro inesperado:', err);
  res.status(500).json({
    message: 'Erro interno do servidor'
  });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`🚀 ${config.appName} rodando na porta ${config.port}`);
  });
}

module.exports = app;
