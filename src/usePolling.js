import { useEffect, useRef } from 'react';

/** Executa `funcao` agora e a cada `intervaloMs` (atualização "ao vivo" sem WebSocket). */
export function usePolling(funcao, intervaloMs, dependencias = []) {
  const ref = useRef(funcao);
  ref.current = funcao;

  useEffect(() => {
    let ativo = true;
    const executar = () => {
      if (ativo) Promise.resolve(ref.current()).catch(() => {});
    };
    executar();
    const id = setInterval(executar, intervaloMs);
    return () => {
      ativo = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervaloMs, ...dependencias]);
}
