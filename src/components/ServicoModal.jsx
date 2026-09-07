import { useState } from 'react';
import { fazerRequisicaoSupabase } from '../lib/supabase.js';
import SolicitacaoServicoForm from './SolicitacaoServicoForm.jsx';

export default function ServicoModal({ aberto, onFechar, mostrarToast, usuario, usuarioId, onExigirLogin, praias = [] }) {
  const [enviando, setEnviando] = useState(false);

  function fechar() {
    onFechar();
  }

  async function enviarSolicitacao(dadosFormulario) {
    if (!usuario) {
      mostrarToast('Faça login para solicitar um serviço!', 'erro');
      onExigirLogin();
      return;
    }

    setEnviando(true);

    const payload = {
      ...dadosFormulario,
      id_servico: null,
      id_usuario: usuarioId,
      status: 'PENDENTE',
    };

    const ok = await fazerRequisicaoSupabase('solicitacao_servico', '', 'POST', payload);
    setEnviando(false);

    if (ok) {
      mostrarToast('Solicitação enviada para análise!', 'ok');
      fechar();
    } else {
      mostrarToast('Erro ao enviar solicitação.', 'erro');
    }
  }

  if (!aberto) return null;

  return (
    <div className="modal-overlay active">
      <div className="modal modal--servico">
        <div className="modal-header">
          <div>
            <h3>Solicitar Serviço</h3>
            <p className="modal-subtitle">Sua solicitação passa por análise antes de aparecer pra comunidade.</p>
          </div>
          <button className="modal-fechar" onClick={fechar}>✕</button>
        </div>

        <SolicitacaoServicoForm
          onSubmit={enviarSolicitacao}
          onCancel={fechar}
          loading={enviando}
          praias={praias}
        />
      </div>
    </div>
  );
}
