import { useState } from 'react';

//Estrelas
const StarRating = ({ label, value, onChange }) => {
  return (
    <div className="star-rating-group" style={{ marginBottom: '10px' }}>
      <span style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>{label}:</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange(star)}
          style={{
            cursor: 'pointer',
            color: star <= value ? '#f59e0b' : '#d1d5db',
            fontSize: '20px',
            marginLeft: '5px'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

// Toggles
const ToggleBool = ({ label, checked, onChange }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      style={{ width: '18px', height: '18px' }}
    />
    {label}
  </label>
);

export default function AvaliacaoForm({ onSubmit, loading }) {
  // Estados das notas (0 significa não avaliado)
  const [notaGeral, setNotaGeral] = useState(0);
  const [seguranca, setSeguranca] = useState(0);
  const [dificuldade, setDificuldade] = useState(0);
  const [populacao, setPopulacao] = useState(0);

  // Estados dos booleanos
  const [temPedras, setTemPedras] = useState(false);
  const [aguaPoluida, setAguaPoluida] = useState(false);
  const [temAguaviva, setTemAguaviva] = useState(false);
  const [temQuiosque, setTemQuiosque] = useState(false);
  const [temEstacionamento, setTemEstacionamento] = useState(false);

  // Estado do texto
  const [texto, setTexto] = useState('');

  const handleSubmit = () => {
    // Validação (Nota Geral é obrigatória)
    if (notaGeral === 0) {
      alert("Por favor, dê pelo menos uma Nota Geral para a praia.");
      return;
    }

    const avaliacaoData = {
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
    };

    onSubmit(avaliacaoData);
  };

  return (
    <div className="avaliacao-form-container" style={{ padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', marginTop: '15px' }}>
      <h5 style={{ marginTop: 0 }}>Avalie esta praia</h5>
      
      {/* Sistema de Estrelas */}
      <StarRating label="Nota Geral" value={notaGeral} onChange={setNotaGeral} />
      <StarRating label="Segurança" value={seguranca} onChange={setSeguranca} />
      <StarRating label="Dificuldade" value={dificuldade} onChange={setDificuldade} />
      <StarRating label="Crowd/Público" value={populacao} onChange={setPopulacao} />

      {/* Grid de Checkboxes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '15px 0' }}>
        <ToggleBool label="Tem Pedras?" checked={temPedras} onChange={setTemPedras} />
        <ToggleBool label="Água Poluída?" checked={aguaPoluida} onChange={setAguaPoluida} />
        <ToggleBool label="Tem Água-viva?" checked={temAguaviva} onChange={setTemAguaviva} />
        <ToggleBool label="Tem Quiosque?" checked={temQuiosque} onChange={setTemQuiosque} />
        <ToggleBool label="Tem Estacionamento?" checked={temEstacionamento} onChange={setTemEstacionamento} />
      </div>

      {/* Campo de Texto */}
      <textarea
        className="form-textarea"
        placeholder="Opcional: Deixe um comentário detalhado..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        style={{ width: '100%', minHeight: '80px', marginBottom: '10px' }}
      />

      <button className="btn-send" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Avaliação'}
      </button>
    </div>
  );
}