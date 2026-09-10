import { useState } from 'react';
import { 
  Star, 
  User, 
  Mountain, 
  ShieldCheck, 
  Waves, 
  OctagonAlert, 
  Store, 
  Car, 
  Triangle 
} from 'lucide-react';

// 1. COMPONENTE DE ESTRELAS MODERNO
const ModernStarRating = ({ label, value, onChange, icon: Icon }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="rating-row">
      <span className="rating-label">
        {Icon && <Icon size={16} className="rating-label-icon" />}
        {label}
      </span>
      <div className="stars-wrap">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hover || value);
          return (
            <button
              key={star}
              type="button"
              className={`star-btn ${isFilled ? 'filled' : ''}`}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              <Star 
                size={20} 
                fill={isFilled ? 'var(--sand, #f59e0b)' : 'transparent'} 
                stroke={isFilled ? 'var(--sand, #f59e0b)' : 'var(--text-3, #475569)'} 
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 2. COMPONENTE DE CROWD / LOTAÇÃO (Pessoas)
const CrowdRating = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  const labels = ['', 'Vazia', 'Pouca', 'Moderada', 'Bastante', 'Muito Lotada'];

  return (
    <div className="rating-row">
      <span className="rating-label">
        <User size={16} className="rating-label-icon" />
        Crowd / Lotação
      </span>
      <div className="crowd-selector-wrap">
        <div className="crowd-icons">
          {[1, 2, 3, 4, 5].map((level) => {
            const isActive = level <= (hover || value);
            return (
              <button
                key={level}
                type="button"
                className={`crowd-btn ${isActive ? 'active' : ''}`}
                onClick={() => onChange(level)}
                onMouseEnter={() => setHover(level)}
                onMouseLeave={() => setHover(0)}
              >
                <User 
                  size={20} 
                  stroke={isActive ? 'var(--teal, #2dd4bf)' : 'var(--text-3, #475569)'} 
                  fill={isActive ? 'rgba(45, 212, 191, 0.2)' : 'transparent'}
                />
              </button>
            );
          })}
        </div>
        <span className="rating-value-desc">
          {labels[hover || value] || 'Selecione...'}
        </span>
      </div>
    </div>
  );
};

// 3. COMPONENTE DE DIFICULDADE (RAMPA DE BARRAS COM PONTEIRO)
const DifficultyRamp = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  const labels = ['', 'Muito Fácil', 'Fácil', 'Média', 'Difícil', 'Extrema'];
  const currentLevel = hover || value;

  return (
    <div className="rating-row">
      <span className="rating-label">
        <Mountain size={16} className="rating-label-icon" />
        Dificuldade
      </span>
      <div className="ramp-selector-wrap">
        <div className="ramp-container">
          {[1, 2, 3, 4, 5].map((level) => {
            const isActive = level <= currentLevel;
            return (
              <div 
                key={level} 
                className="ramp-bar-wrapper"
                onClick={() => onChange(level)}
                onMouseEnter={() => setHover(level)}
                onMouseLeave={() => setHover(0)}
              >
                {/* Indicador Triangular sobre o nível ativo */}
                {currentLevel === level && (
                  <Triangle size={10} className="ramp-pointer" />
                )}
                <div 
                  className={`ramp-bar bar-step-${level} ${isActive ? 'active' : ''}`}
                />
              </div>
            );
          })}
        </div>
        <span className="rating-value-desc">
          {labels[currentLevel] || 'Selecione...'}
        </span>
      </div>
    </div>
  );
};

// 4. COMPONENTE DE CARD INDICADOR DE PROBLEMAS / INFRA
const FeatureBadge = ({ label, icon: Icon, active, onClick, isWarning }) => {
  return (
    <button
      type="button"
      className={`feature-card-btn ${active ? 'active' : ''} ${isWarning ? 'warning' : ''}`}
      onClick={() => onClick(!active)}
    >
      <div className="feature-icon-circle">
        <Icon size={20} />
      </div>
      <span className="feature-label">{label}</span>
    </button>
  );
};

export default function AvaliacaoForm({ onSubmit, loading }) {
  const [notaGeral, setNotaGeral] = useState(0);
  const [seguranca, setSeguranca] = useState(0);
  const [dificuldade, setDificuldade] = useState(0);
  const [populacao, setPopulacao] = useState(0);

  const [temPedras, setTemPedras] = useState(false);
  const [aguaPoluida, setAguaPoluida] = useState(false);
  const [temAguaviva, setTemAguaviva] = useState(false);
  const [temQuiosque, setTemQuiosque] = useState(false);
  const [temEstacionamento, setTemEstacionamento] = useState(false);

  const [texto, setTexto] = useState('');

  const handleSubmit = () => {
    if (notaGeral === 0) {
      alert("Por favor, atribua pelo menos uma Nota Geral para a praia.");
      return;
    }

    onSubmit({
      nota_geral: notaGeral,
      seguranca: seguranca === 0 ? null : seguranca,
      dificuldade: dificuldade === 0 ? null : dificuldade,
      populacao: populacao === 0 ? null : populacao,
      tem_pedras: temPedras,
      agua_poluida: aguaPoluida,
      tem_aguaviva: temAguaviva,
      tem_quiosque: temQuiosque,
      tem_estacionamento: temEstacionamento,
      texto: texto.trim() === '' ? null : texto,
    });
  };

  return (
    <div className="avaliacao-form-container">
      <h3 className="modal-title-eval">Avalie esta praia</h3>
      
      {/* Bloco de Avaliações Quantitativas */}
      <div className="ratings-section">
        <ModernStarRating label="Nota Geral" value={notaGeral} onChange={setNotaGeral} />
        <ModernStarRating label="Segurança" value={seguranca} onChange={setSeguranca} icon={ShieldCheck} />
        <DifficultyRamp value={dificuldade} onChange={setDificuldade} />
        <CrowdRating value={populacao} onChange={setPopulacao} />
      </div>

      {/* Grid de Ícones Circulares para Condições/Infra */}
      <div className="features-grid-section">
        <span className="features-section-title">Condições e Infraestrutura</span>
        <div className="features-cards-grid">
          <FeatureBadge 
            label="Pedras" 
            icon={Mountain} 
            active={temPedras} 
            onClick={setTemPedras} 
            isWarning 
          />
          <FeatureBadge 
            label="Água Poluída" 
            icon={Waves} 
            active={aguaPoluida} 
            onClick={setAguaPoluida} 
            isWarning 
          />
          <FeatureBadge 
            label="Água-viva" 
            icon={OctagonAlert} 
            active={temAguaviva} 
            onClick={setTemAguaviva} 
            isWarning 
          />
          <FeatureBadge 
            label="Quiosques" 
            icon={Store} 
            active={temQuiosque} 
            onClick={setTemQuiosque} 
          />
          <FeatureBadge 
            label="Estacionamento" 
            icon={Car} 
            active={temEstacionamento} 
            onClick={setTemEstacionamento} 
          />
        </div>
      </div>

      {/* Campo de Comentário */}
      <textarea
        className="form-textarea form-textarea--lg"
        placeholder="Deixe um comentário detalhado (opcional)..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      <button className="btn-send" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Avaliação'}
      </button>
    </div>
  );
}