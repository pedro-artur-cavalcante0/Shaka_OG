export default function BeachCard({ praia, onClick }) {
  return (
    <div className="card" onClick={() => onClick(praia)}>
      <div className="titulo">{praia.nome}</div>
      <div className="descricao">
        {praia.tipo_onda ? `Onda: ${praia.tipo_onda}` : 'Tipo de onda não informado'} · Pop: {praia.nivel_popularidade}/5
      </div>
      <div className="descricao">
        Dificuldade: {praia.nivel_dificuldade}/5 · {praia.perigos || 'Sem perigos informados'}
      </div>
    </div>
  );
}
