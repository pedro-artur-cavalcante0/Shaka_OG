import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map({ praias, onSelecionarPraia, praiaFoco }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Criar o mapa
  useEffect(() => {
    mapRef.current = L.map(mapDivRef.current, {
      // Com scrollWheelZoom libera rodar a pagina mesmo por cima do mapa, mas o zoom com scroll do mouse fica desativado.
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

  // Adicionar marcadores das praias
  useEffect(() => {
    if (!markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();
    praias.forEach((p) => {
      const marker = L.marker([p.latitude, p.longitude], { title: p.nome }).addTo(markersLayerRef.current);
      marker.bindPopup(`<strong>${p.nome}</strong><br>${p.tipo_onda || 'Sem tipo'}<br>Popularidade: ${p.nivel_popularidade}`);
      marker.on('click', () => onSelecionarPraia(p));
    });
  }, [praias, onSelecionarPraia]);

  // Focar na praia selecionada
  useEffect(() => {
    if (praiaFoco && mapRef.current) {
      mapRef.current.flyTo([praiaFoco.latitude, praiaFoco.longitude], 13, { animate: true });
    }
  }, [praiaFoco]);

  return <div id="map" ref={mapDivRef} />;
}
