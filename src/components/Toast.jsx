export default function Toast({ toast }) {
  return (
    <div className={`shaka-toast shaka-toast--${toast?.tipo || 'ok'}${toast ? ' shaka-toast--show' : ''}`}>
      {toast?.mensagem}
    </div>
  );
}
