const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env');

let client;

function isConfigured() {
  return Boolean(config.supabase.url && config.supabase.serviceRoleKey);
}

function ensureConfiguration() {
  if (!isConfigured()) {
    const missing = [];
    if (!config.supabase.url) missing.push('SUPABASE_URL');
    if (!config.supabase.serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    const message = `Configuração do Supabase incompleta. Variáveis ausentes: ${missing.join(', ')}`;
    throw new Error(message);
  }
}

function getClient() {
  if (!client) {
    ensureConfiguration();
    client = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return client;
}

async function checkConnection() {
  const supabase = getClient();

  const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

  if (error) {
    throw new Error(`Não foi possível validar o Supabase: ${error.message}`);
  }

  return true;
}

module.exports = {
  getClient,
  checkConnection,
  isConfigured
};
