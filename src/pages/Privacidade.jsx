import { Link } from 'react-router-dom';

export default function Privacidade() {
  return (
    <div className="static-page">
      <span className="section-label">// LEGAL</span>
      <h1>Política de Privacidade</h1>
      <span className="static-updated">Última atualização: agosto de 2026</span>

      <p>
        Esta política explica quais dados o Shaka coleta, para que servem e
        como são armazenados.
      </p>

      <h2>1. Quais dados coletamos</h2>
      <ul>
        <li><strong>Cadastro:</strong> nome de usuário, email e senha, usados para login.</li>
        <li><strong>Conteúdo enviado:</strong> comentários, eventos e serviços que você cadastra na plataforma.</li>
        <li><strong>Identificador anônimo:</strong> caso você comente sem estar logado, um identificador aleatório é gerado localmente no seu navegador para associar o comentário.</li>
      </ul>

      <h2>2. Como os dados são usados</h2>
      <p>
        Os dados são usados exclusivamente para o funcionamento da plataforma:
        autenticação, exibição de comentários e eventos, e cadastro de serviços.
        Não compartilhamos dados com terceiros para fins de publicidade.
      </p>

      <h2>3. Armazenamento</h2>
      <p>
        Os dados ficam armazenados no banco de dados do projeto (Supabase).
        Informações de sessão (como o usuário logado) são salvas localmente no
        seu navegador (<code>localStorage</code>) e não são enviadas a terceiros.
      </p>

      <h2>4. Dados de clima e localização</h2>
      <p>
        As condições climáticas e de ondas exibidas para cada praia são obtidas
        de uma API pública de previsão meteorológica, usando apenas a latitude e
        longitude da praia selecionada — não é feita nenhuma coleta de
        localização do seu dispositivo.
      </p>

      <h2>5. Seus direitos</h2>
      <p>
        Como este é um projeto acadêmico, solicitações de remoção de conta ou de
        conteúdo podem ser feitas diretamente pela página de{' '}
        <Link className="static-inline-link" to="/contato">Contato</Link>.
      </p>
    </div>
  );
}
