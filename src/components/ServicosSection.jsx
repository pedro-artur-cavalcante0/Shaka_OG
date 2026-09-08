import { useMemo, useState } from 'react';
import ServicoCard from './ServicoCard.jsx';

const CATEGORIAS = [
  { tipo: '', label: 'Todos' },
  { tipo: 'aluguel', label: '🏄 Aluguel' },
  { tipo: 'aula', label: '🎓 Aula de Surf' },
  { tipo: 'reparo', label: '🔧 Reparo' },
  { tipo: 'fotografia', label: '📷 Fotografia' },
  { tipo: 'outro', label: '📌 Outro' },
];

export default function ServicosSection({ servicos, usuario, onNovoServico, onExigirLogin }) {
  const [tipoAtivo, setTipoAtivo] = useState('');
  const [busca, setBusca] = useState('');

  // Filtro de serviços
  const servicosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    return servicos.filter((s) => {
      const bateTipo = !tipoAtivo || s.tipo === tipoAtivo;
      const bateTexto =
        !termo ||
        (s.nome || '').toLowerCase().includes(termo) ||
        (s.descricao || '').toLowerCase().includes(termo) ||
        (s.tipo || '').toLowerCase().includes(termo) ||
        (s.contato || '').toLowerCase().includes(termo);
      return bateTipo && bateTexto;
    });
  }, [servicos, tipoAtivo, busca]);

  function handleCadastrarClick() {
    if (!usuario) {
      onExigirLogin();
      return;
    }
    onNovoServico();
  }

  return (
    <section className="servicos-section" id="servicos">
      <div className="servicos-header">
        <div className="servicos-header-text">
          <span className="section-label">// SERVIÇOS</span>
          <h2 className="section-title">Serviços para Surfistas</h2>
          <p className="section-desc">Profissionais e negócios que atendem a comunidade do surf — independente de localização.</p>
        </div>
        <div className="servicos-header-actions">
          <div className="servicos-search-wrap">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className="search-input"
              type="search"
              placeholder="Buscar serviço ou tipo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <button className="btn-novo-servico" onClick={handleCadastrarClick}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Cadastrar Serviço
          </button>
        </div>
      </div>

      <div className="servicos-filtros">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.tipo}
            className={`filtro-btn${tipoAtivo === cat.tipo ? ' filtro-btn--ativo' : ''}`}
            onClick={() => setTipoAtivo(cat.tipo)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="servicos-grid">
        {servicosFiltrados.length === 0 ? (
          <div className="servicos-vazio">
            <div className="servicos-vazio-icone">🏄</div>
            <p className="servicos-vazio-texto">Nenhum serviço encontrado.</p>
            <p className="servicos-vazio-sub">Seja o primeiro a cadastrar um serviço para a comunidade!</p>
          </div>
        ) : (
          servicosFiltrados.map((s) => <ServicoCard key={s.id} servico={s} />)
        )}
      </div>
    </section>
  );
}
