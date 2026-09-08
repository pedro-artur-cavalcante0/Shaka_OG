import { useState } from 'react';

export default function SolicitacaoEventoForm({ onSubmit, onCancel, loading }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    // Check campos obrigatórios
    if (!titulo.trim() || !data) {
      alert("Título e Data são obrigatórios.");
      return;
    }

    // Check pelo menos um contato
    if (!whatsapp.trim() && !email.trim()) {
      alert("Você precisa fornecer pelo menos um contato (WhatsApp ou E-mail) para o administrador validar o evento.");
      return;
    }

    // Limpa os campos pro db processar corretamente
    const payload = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      data: data,
      whatsapp: whatsapp.trim() || null,
      email: email.trim() || null,
    };

    onSubmit(payload);
  };

  return (
    <div className="modal-form" style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--r-md)' }}>
      <h5 style={{ margin: '0 0 16px 0' }}>Solicitar Novo Evento</h5>
      
      <div className="form-group">
        <label>Título do Evento <span className="required">*</span></label>
        <input 
          className="form-input" 
          placeholder="Ex: Campeonato de Surf Local" 
          value={titulo} 
          onChange={(e) => setTitulo(e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label>Descrição</label>
        <textarea 
          className="form-textarea" 
          placeholder="Detalhes, horários, categorias..." 
          value={descricao} 
          onChange={(e) => setDescricao(e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label>Data <span className="required">*</span></label>
        <input 
          type="date" 
          className="form-input" 
          value={data} 
          onChange={(e) => setData(e.target.value)} 
        />
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
            placeholder="contato@evento.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Preencha pelo menos um meio de contato. O evento passará por análise antes de ser publicado.</p>

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