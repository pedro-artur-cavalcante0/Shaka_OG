import { useState } from 'react';
import { fazerRequisicaoSupabase } from '../lib/supabase.js';

export default function ServicoModal({ aberto, onFechar, onServicoCriado, mostrarToast }) {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [contato, setContato] = useState('');
  const [salvando, setSalvando] = useState(false);

  function resetar() {
    setNome('');
    setTipo('');
    setDescricao('');
    setContato('');
  }

  function fechar() {
    resetar();
    onFechar();
  }

  async function criarServico() {
    if (!nome.trim() || !tipo) {
      mostrarToast('Preencha pelo menos o nome e o tipo do serviço!', 'erro');
      return;
    }

    setSalvando(true);
    const novoServico = {
      nome: nome.trim(),
      tipo,
      descricao: descricao.trim() || null,
      contato: contato.trim() || null,
    };
    const ok = await fazerRequisicaoSupabase('servico', '', 'POST', novoServico);
    setSalvando(false);

    if (ok) {
      mostrarToast(`"${nome}" cadastrado com sucesso! 🤙`, 'ok');
      fechar();
      onServicoCriado();
    } else {
      mostrarToast('Erro ao cadastrar. Verifique as permissões no Supabase.', 'erro');
    }
  }

  if (!aberto) return null;

  return (
    <div className="modal-overlay active">
      <div className="modal modal--servico">
        <div className="modal-header">
          <div>
            <h3>Cadastrar Serviço</h3>
            <p className="modal-subtitle">Seu serviço ficará visível para toda a comunidade.</p>
          </div>
          <button className="modal-fechar" onClick={fechar}>✕</button>
        </div>

        <div className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nome do serviço <span className="required">*</span></label>
              <input className="form-input" type="text" placeholder="ex: Surf Shop Iracema" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Tipo <span className="required">*</span></label>
              <select className="form-input form-select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="" disabled>Selecione...</option>
                <option value="aluguel">🏄 Aluguel de equipamento</option>
                <option value="aula">🎓 Aula de surf</option>
                <option value="reparo">🔧 Reparo de prancha</option>
                <option value="hospedagem">🏠 Hospedagem</option>
                <option value="alimentacao">🍽️ Alimentação</option>
                <option value="transporte">🚐 Transporte</option>
                <option value="fotografia">📷 Fotografia / Filmagem</option>
                <option value="outro">📌 Outro</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              className="form-textarea form-textarea--lg"
              placeholder="Descreva o serviço, diferenciais, área de atuação..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Contato</label>
            <input className="form-input" type="text" placeholder="Telefone, @instagram, site..." value={contato} onChange={(e) => setContato(e.target.value)} />
          </div>

          <div className="modal-form-footer">
            <button type="button" className="btn-ghost-sm" onClick={fechar}>Cancelar</button>
            <button type="button" className="btn-primary-full btn-primary-full--inline" onClick={criarServico} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Cadastrar Serviço'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
