import { useState } from 'react';

export default function SolicitacaoServicoForm({ onSubmit, onCancel, loading, praias = [] }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [idPraia, setIdPraia] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (!titulo.trim()) {
      alert("Nome do serviço é obrigatório.");
      return;
    }

    if (!whatsapp.trim() && !email.trim()) {
      alert("Você precisa fornecer pelo menos um contato (WhatsApp ou E-mail) para o administrador validar o serviço.");
      return;
    }

    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      id_praia: idPraia || null,
      whatsapp: whatsapp.trim() || null,
      email: email.trim() || null,
    };

    onSubmit(payload);
  };

  return (
    <div className="modal-form" style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--r-md)' }}>
      <h5 style={{ margin: '0 0 16px 0' }}>Solicitar Novo Serviço</h5>

      <div className="form-group">
        <label>Nome do Serviço <span className="required">*</span></label>
        <input
          className="form-input"
          placeholder="Ex: Surf Shop Iracema"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Descrição</label>
        <textarea
          className="form-textarea"
          placeholder="Descreva o serviço, diferenciais, área de atuação..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Praia</label>
        <select className="form-input form-select" value={idPraia} onChange={(e) => setIdPraia(e.target.value)}>
          <option value="">Não vinculado a uma praia específica</option>
          {praias.map((p) => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>WhatsApp</label>
          <input
            type="tel"
            className="form-input"
            placeholder="(00) 00000-0000"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>E-mail</label>
          <input
            type="email"
            className="form-input"
            placeholder="contato@servico.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Preencha pelo menos um meio de contato. O serviço passará por análise antes de ser publicado.</p>

      <div className="modal-form-footer">
        <button className="btn-link" onClick={onCancel} disabled={loading}>Cancelar</button>
        <button className="btn-primary-full btn-primary-full--inline" onClick={handleSubmit} disabled={loading}>
          {loading && <span className="loading-spinner"></span>}
          {loading ? 'Enviando...' : 'Enviar Solicitação'}
        </button>
      </div>
    </div>
  );
}
