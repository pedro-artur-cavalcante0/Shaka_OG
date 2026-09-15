import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Correção para os ícones padrão sumirem no Vercel/Builds de produção
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerIconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function Map({ praias, onSelecionarPraia, praiaFoco }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Criar o mapa
  useEffect(() => {
    mapRef.current = L.map(mapDivRef.current, {
      scrollWheelZoom: false,
    }).setView([-3.73, -38.52], 11);
    
    markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
    
    // Insira sua chave de API aqui se necessário
    const apiKey = 'cb1_2tsg_1_5902f9ba53b63e5f23bf0328'; 
    const tileUrl = apiKey 
      ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${apiKey}`
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
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

  // Focar na praia selecionada e recalcular dimensões
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
        if (praiaFoco) {
          mapRef.current.flyTo([praiaFoco.latitude, praiaFoco.longitude], 13, { animate: true });
        }
      }, 300);
    }
  }, [praiaFoco]);

  return <div id="map" ref={mapDivRef} style={{ width: '100%', height: '100%' }} />;
}