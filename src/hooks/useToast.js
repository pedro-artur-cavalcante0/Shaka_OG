import { useRef, useState, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null); // { mensagem, tipo } | null
  const timerRef = useRef(null);

  const mostrarToast = useCallback((mensagem, tipo = 'ok') => {
    setToast({ mensagem, tipo });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  return { toast, mostrarToast };
}
