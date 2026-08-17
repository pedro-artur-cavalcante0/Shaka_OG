import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function atualizarPraias() {
  console.log("Buscando praias sem cidade cadastrada...");

  // Check Praia sem cidade
  const { data: praias, error } = await supabase
    .from('praia')
    .select('id, nome, latitude, longitude')
    .is('cidade', null);

    if (error) {
      console.error('Erro ao buscar praias sem cidade:', error);
      return;
    }

  if (praias.length === 0) {
    console.log("Nenhuma praia sem cidade encontrada.");
    return;
  }

  console.log(`Encontradas ${praias.length} praias sem cidade. Atualizando... \n`);

  // Loop pra cada praia
  for (const praia of praias) {
    try {
      console.log(`Processando: ${praia.nome} (Lat: ${praia.latitude}, Lng: ${praia.longitude})`);
      
      // API (OpenStreetMap)
    const resposta = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${praia.latitude}&lon=${praia.longitude}&format=json`,
        {
          headers: {
            'User-Agent': 'Shaka/0.1 (shaka_dev@projeto.com)' 
          }
        }
      );
    if (!resposta.ok) {
        throw new Error(`Erro na API (Status: ${resposta.status})`);
      }

      const local = await resposta.json();

      const address = local.address || {};
      const cidade = address.city || address.town || address.village || address.municipality || 'Desconhecida';
      const estado = address.state || 'Desconhecido';
      const pais = address.country || 'Desconhecido';

      // Update praia com dados
      const { error: updateError } = await supabase
        .from('praia')
        .update({ cidade: cidade, estado: estado, pais: pais })
        .eq('id', praia.id);

      if (updateError) {
        console.error(`Erro ao salvar ${praia.nome}:`, updateError);
      } else {
        console.log(`Sucesso. ${praia.nome} atualizada -> ${cidade}, ${estado}, ${pais}\n`);
      }

      // NN apagar, se não leva ban da API por requisições em excesso
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (err) {
      console.error(`Erro de conexão na praia ${praia.nome}:`, err.message);
    }
  }
  console.log("Processo finalizado!");
}

atualizarPraias();