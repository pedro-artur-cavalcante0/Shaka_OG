export default function Contato() {
  return (
    <div className="static-page">
      <span className="section-label">// SUPORTE</span>
      <h1>Contato</h1>
      <span className="static-updated">Fale com a equipe do Shaka</span>

      <p>
        Tem alguma dúvida, sugestão ou encontrou um problema na plataforma?
        Fale com a gente por um dos canais abaixo.
      </p>

      <div className="static-contact-grid">
        <div className="static-contact-card">
          <strong>Email</strong>
          <a href="mailto:contato@shaka-app.com.br">contato@shaka-app.com.br</a>
        </div>
        <div className="static-contact-card">
          <strong>Instagram</strong>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">@shaka.ce</a>
        </div>
        <div className="static-contact-card">
          <strong>Projeto</strong>
          <span>Trabalho acadêmico — Shaka, litoral do Ceará</span>
        </div>
        <div className="static-contact-card">
          <strong>Reportar problema</strong>
          <span>Encontrou um erro na plataforma? Descreva o que aconteceu no email acima.</span>
        </div>
      </div>
    </div>
  );
}
