
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);

  const status = err.status || 500;
  const mensagem = status === 500 ? 'Erro interno do servidor.' : err.message;

  res.status(status).json({ erro: mensagem });
}

export function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada.' });
}
