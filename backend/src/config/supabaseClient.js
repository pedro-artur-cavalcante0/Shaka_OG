// config/supabaseClient.js
// Cliente Supabase "admin": usa a service_role key, então ignora Row Level
// Security. Só o backend deve ter essa chave. Todo acesso ao banco passa
// por aqui — o front nunca mais deve importar @supabase/supabase-js
// diretamente nem ter a chave no bundle.

import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
