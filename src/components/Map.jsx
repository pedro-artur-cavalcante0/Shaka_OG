import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ praias, onSelecionarPraia, praiaFoco }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);

  // cria o mapa uma única vez (equivalente ao configurarMapa() do script.js)
  useEffect(() => {
    mapRef.current = L.map(mapDivRef.current, {
      // Com scrollWheelZoom ligado, rolar a página com o mouse em cima do mapa
      // dá zoom em vez de rolar a página — desliga isso; o zoom continua
      // funcionando normalmente pelos botões +/- e por pinça no touch.
      scrollWheelZoom: false,
    }).setView([-3.73, -38.52], 11);
    markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap & CARTO',
    }).addTo(mapRef.current);

    return () => {
      mapRef.current.remove();
      mapRef.current = null;
    };
  }, []);

  // equivalente a atualizarMarcadores(lista) — roda toda vez que a lista de praias mudar
  useEffect(() => {
    if (!markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();
    praias.forEach((p) => {
      const marker = L.marker([p.latitude, p.longitude], { title: p.nome }).addTo(markersLayerRef.current);
      marker.bindPopup(`<strong>${p.nome}</strong><br>${p.tipo_onda || 'Sem tipo'}<br>Popularidade: ${p.nivel_popularidade}`);
      marker.on('click', () => onSelecionarPraia(p));
    });
  }, [praias, onSelecionarPraia]);

  // equivalente ao map.flyTo(...) dentro de selecionarPraia()
  useEffect(() => {
    if (praiaFoco && mapRef.current) {
      mapRef.current.flyTo([praiaFoco.latitude, praiaFoco.longitude], 13, { animate: true });
    }
  }, [praiaFoco]);

  return <div id="map" ref={mapDivRef} />;
}
