import Hero from '../components/Hero.jsx';
import SpotsSection from '../components/SpotsSection.jsx';
import ServicosSection from '../components/ServicosSection.jsx';
import FeaturesSection from '../components/FeaturesSection.jsx';

export default function Home({ praias, servicos, usuario, usuarioId, onExigirLogin, onNovoServico, mostrarToast }) {
  return (
    <>
      <Hero />

      <SpotsSection
        praias={praias}
        usuario={usuario}
        usuarioId={usuarioId}
        onExigirLogin={onExigirLogin}
        mostrarToast={mostrarToast}
      />

      <ServicosSection
        servicos={servicos}
        usuario={usuario}
        onNovoServico={onNovoServico}
        onExigirLogin={onExigirLogin}
      />

      {/* Encerramento da página — resume como a aplicação funciona antes do rodapé */}
      <FeaturesSection totalPraias={praias.length} totalServicos={servicos.length} />
    </>
  );
}