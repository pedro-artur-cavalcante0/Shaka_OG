export default function BeachCard({ praia, onClick }) {
  const temDistancia = typeof praia.distanciaKm === 'number';

  return (
    <div className="card" onClick={() => onClick(praia)}>
      <div className="titulo">
        {/* Ícone de localização — mesma ação do marcador no mapa: seleciona a praia */}
        <svg
          className="card-pin"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M12 21s-7-5.686-7-11a7 7 0 1 1 14 0c0 5.314-7 11-7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        {praia.nome}
        {temDistancia && <span className="card-distancia">{praia.distanciaKm.toFixed(1)} km</span>}
      </div>
      <div className="descricao">
        {praia.tipo_onda ? `Onda: ${praia.tipo_onda}` : 'Tipo de onda não informado'} · Pop: {praia.nivel_popularidade}/5
      </div>
      <div className="descricao">
        Dificuldade: {praia.nivel_dificuldade}/5 · {praia.perigos || 'Sem perigos informados'}
      </div>
    </div>
  );
}