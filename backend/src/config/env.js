

import 'dotenv/config';

const obrigatorias = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];

for (const chave of obrigatorias) {
  if (!process.env[chave]) {
    throw new Error(
      `Variável de ambiente ${chave} não definida. Copie backend/.env.example para backend/.env e preencha os valores.`
    );
  }
}

export const env = {
  port: process.env.PORT || 4000,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
