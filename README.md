# Shaka — versão React

## Como rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:5173

## O que foi migrado

- `script.js` inteiro virou: `src/lib/` (supabase, weather, resumoIA — lógica pura,
  sem tocar DOM) + `src/hooks/` (useAuth, useToast — estado + efeitos colaterais) +
  `src/components/` (um arquivo por pedaço da tela).
- `shaka.css` foi copiado para `src/index.css` sem nenhuma alteração.
- Leaflet (o mapa) agora vive dentro de `src/components/Map.jsx`, controlado por
  useRef + useEffect, porque ele manipula o DOM diretamente e não pode virar
  JSX puro.
- Toda variável global do script.js (praiaSelecionada, usuarioAtual, todosServicos...)
  virou useState em algum componente ou no App.jsx.

## Próximos passos sugeridos

1. Rodar `npm install && npm run dev` e comparar visualmente com a versão original.
2. Mover a SUPABASE_ANON_KEY para uma variável de ambiente (.env + import.meta.env.VITE_...)
   em vez de deixar hardcoded em src/lib/supabase.js.
3. Conferir se as tabelas do Supabase têm Row Level Security configurada.
