import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

async function atualizarCoordenadas() {
  console.log("Iniciando updater de coordenadas...\n");

  // Pull nas praias e dados
  const { data: praias, error } = await supabase
    .from('praia')
    .select('id, nome, cidade, estado');

  if (error) {
    console.error('Erro ao buscar praias:', error);
    return;
  }

  console.log(`Encontradas ${praias.length} praias. Buscando localizações exatas no mapa...\n`);

  for (const praia of praias) {
    try {
      // Builda a busca exata pra evitar pegar lugares com o mesmo nome em outros estados ou países (Arrumar dps)
      let queryBusca = praia.nome;
      if (praia.cidade && praia.cidade !== 'Desconhecida') queryBusca += `, ${praia.cidade}`;
      if (praia.estado && praia.estado !== 'Desconhecido') queryBusca += `, ${praia.estado}`;

      console.log(`Buscando coordenadas para: "${queryBusca}"`);
      
      // API (OpenStreetMap)
      const resposta = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryBusca)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'Shaka/0.1 (shaka_dev@projeto.com)' 
          }
        }
      );

      if (!resposta.ok) {
        throw new Error(`Erro na API (Status: ${resposta.status})`);
      }

      const resultados = await resposta.json();

      // API achou algo:
      if (resultados.length > 0) {
        const lat = parseFloat(resultados[0].lat);
        const lon = parseFloat(resultados[0].lon);

        // Update com overide
        const { error: updateError } = await supabase
          .from('praia')
          .update({ latitude: lat, longitude: lon })
          .eq('id', praia.id);

        if (updateError) {
          console.error(`Erro ao salvar no banco ${praia.nome}:`, updateError);
        } else {
          console.log(`Sucesso! ${praia.nome} atualizada -> Lat: ${lat}, Lng: ${lon}\n`);
        }
      } else {
        // Se nn achar:
        console.log(`API não encontrou localização exata para: ${praia.nome}\n`);
      }

      // Evita o ban, nn apague
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (err) {
      console.error(`Erro de conexão ao processar ${praia.nome}:`, err.message);
    }
  }
  console.log("Processo de correção de coordenadas finalizado!");
}

atualizarCoordenadas();