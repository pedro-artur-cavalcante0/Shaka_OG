import Hero from '../components/Hero.jsx';
import FeaturesSection from '../components/FeaturesSection.jsx';
import SpotsSection from '../components/SpotsSection.jsx';
import ServicosSection from '../components/ServicosSection.jsx';

export default function Home({ praias, servicos, usuario, usuarioId, onExigirLogin, onNovoServico, mostrarToast }) {
  return (
    <>
      <Hero />

      <FeaturesSection totalPraias={praias.length} totalServicos={servicos.length} />

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
    </>
  );
}
