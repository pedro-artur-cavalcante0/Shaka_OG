import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const DELAY_API = 1500; // Delay para não tomar ban do Nominatim

async function pipelineGeografico() {
  console.log("Iniciando pipeline Geográfico\n");

  // Pull em praias que precisam de atualização (coordenadas ou cidade)
  const { data: praias, error } = await supabase
    .from('praia')
    .select('*')
    .or('latitude.is.null, longitude.is.null, cidade.is.null, cidade.eq.Desconhecida');

  if (error) return console.error('× Erro no banco:', error);
  if (praias.length === 0) return console.log("✓ Banco 100% íntegro. Nenhuma praia precisa de atualização.");

  console.log(`Encontradas ${praias.length} praias precisando de tratamento. Processando...\n`);

  for (const praia of praias) {
    try {
      let lat = praia.latitude;
      let lon = praia.longitude;
      let atualizacoes = {};

      // SE FALTA COORDENADA:
      if (!lat || !lon) {
        // Sem coordenada, busca por nome + estado + país:
        const buscaLocal = praia.estado ? `${praia.nome}, ${praia.estado}, Brasil` : `${praia.nome}, Brasil`;
        console.log(`Buscando coordenadas para: ${buscaLocal}...`);
        
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(buscaLocal)}&format=json&limit=1`, { headers: { 'User-Agent': 'Shaka/1.0 (dev@projeto.com)' } });
        const dados = await res.json();

        if (dados.length > 0) {
          lat = parseFloat(dados[0].lat);
          lon = parseFloat(dados[0].lon);
          atualizacoes.latitude = lat;
          atualizacoes.longitude = lon;
        } else {
          console.log(`!!Falha ao achar coordenadas de: ${praia.nome}!! Pulando para proxima.`);
          await new Promise(r => setTimeout(r, DELAY_API));
          continue;
        }
        await new Promise(r => setTimeout(r, DELAY_API));
      }

      // Com coordenada mas sem cidade:
      if (!praia.cidade || praia.cidade === 'Desconhecida' || praia.cidade === null) {
        console.log(`Buscando cidade das coordenadas de: ${praia.nome}`);
        
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, { headers: { 'User-Agent': 'Shaka/1.0 (dev@projeto.com)' } });
        const local = await res.json();

        const address = local.address || {};
        atualizacoes.cidade = address.city || address.town || address.village || address.municipality || 'Desconhecida';
        atualizacoes.estado = address.state || 'Desconhecido';
        atualizacoes.pais = address.country || 'Desconhecido';
        
        await new Promise(r => setTimeout(r, DELAY_API));
      }

      // Save (so se tiver mudado algo)
      if (Object.keys(atualizacoes).length > 0) {
        const { error: updateError } = await supabase.from('praia').update(atualizacoes).eq('id', praia.id);
        if (updateError) console.error(`× Erro ao salvar ${praia.nome}:`, updateError);
        else console.log(`✓ ${praia.nome} atualizada com sucesso:`, atualizacoes);
      }

      console.log('-----------------------------------');

    } catch (err) {
      console.error(`Erro crítico em ${praia.nome}:`, err.message);
    }
  }
  console.log("Processo concluido. Praias atualizadas com sucesso");
}

pipelineGeografico();