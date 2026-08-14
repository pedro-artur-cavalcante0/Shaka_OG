const SERVICO_META = {
  aluguel: { icone: '🏄', label: 'Aluguel' },
  aula: { icone: '🎓', label: 'Aula de Surf' },
  reparo: { icone: '🔧', label: 'Reparo' },
  hospedagem: { icone: '🏠', label: 'Hospedagem' },
  alimentacao: { icone: '🍽️', label: 'Alimentação' },
  transporte: { icone: '🚐', label: 'Transporte' },
  fotografia: { icone: '📷', label: 'Fotografia' },
  outro: { icone: '📌', label: 'Outro' },
};

export { SERVICO_META };

export default function ServicoCard({ servico }) {
  const meta = SERVICO_META[servico.tipo] || SERVICO_META.outro;

  return (
    <div className="servico-card" data-tipo={servico.tipo || 'outro'}>
      <div className="servico-card-topo">
        <div className="servico-icone-wrap">{meta.icone}</div>
        <div>
          <span className="servico-nome">{servico.nome}</span>
          <span className="servico-tipo-badge">{meta.label}</span>
        </div>
      </div>

      {servico.descricao && <p className="servico-descricao">{servico.descricao}</p>}

      <div className="servico-rodape">
        {servico.contato ? (
          <a className="servico-contato" href={`tel:${servico.contato}`}>{servico.contato}</a>
        ) : (
          <span className="servico-sem-contato">Contato não informado</span>
        )}
      </div>
    </div>
  );
}
