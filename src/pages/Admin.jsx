import { Navigate } from 'react-router-dom';

export default function Admin({ usuario, carregando }) {
  if (carregando) return null;

  if (usuario?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="admin-page">
      <h1>Painel do administrador</h1>
    </section>
  );
}
