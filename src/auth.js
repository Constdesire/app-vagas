import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { request, registrarAoExpirarSessao } from './api';

const AuthContext = createContext(null);

/**
 * O login_v1 grava o JWT num cookie httpOnly ("access_token") e o gateway valida "Authorization: Bearer".
 * Cookie httpOnly não é legível por JavaScript no navegador; por isso o login também devolve o token no corpo.
 * No app nativo (Expo Go) o cabeçalho Set-Cookie é legível, então serve como alternativa.
 */
function extrairToken(resposta, corpo) {
  if (corpo && corpo.token) return corpo.token;
  const cookie = resposta.headers.get('set-cookie');
  const achou = cookie && cookie.match(/access_token=([^;,\s]+)/);
  return achou ? achou[1] : null;
}

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null); // { token, id, username, roles }

  // "Sair": /v1/logout do login_v1 apaga o cookie access_token (Max-Age=0); depois limpamos a sessão local.
  const sair = useCallback(() => {
    request('/fatec/login/v1/logout', { method: 'POST' }).catch(() => {});
    setSessao(null);
  }, []);

  useEffect(() => {
    registrarAoExpirarSessao(sair);
  }, [sair]);

  const abrirSessao = useCallback((resposta, corpo) => {
    const token = extrairToken(resposta, corpo);
    if (!token) {
      throw new Error(
        'O login respondeu, mas o token não veio no cabeçalho Set-Cookie. ' +
          'Isso acontece no navegador (web); use o app no celular/emulador (Expo Go).'
      );
    }
    setSessao({ token, id: corpo.id, username: corpo.username, roles: corpo.roles || [] });
  }, []);

  const entrar = useCallback(
    async (username, password) => {
      const { dados, resposta } = await request('/fatec/login/v1/auth', {
        method: 'POST',
        body: { username, password },
      }).catch((e) => {
        if (e.status === 401 || e.status === 403 || e.status === 500) {
          throw new Error('Usuário ou senha inválidos');
        }
        throw e;
      });
      abrirSessao(resposta, dados);
    },
    [abrirSessao]
  );

  const cadastrar = useCallback(
    async (username, password, roles) => {
      const { dados, resposta } = await request('/fatec/login/v1/save', {
        method: 'POST',
        body: { username, password, roles },
      });
      abrirSessao(resposta, dados);
    },
    [abrirSessao]
  );

  const valor = useMemo(
    () => ({
      sessao,
      token: sessao?.token,
      usuario: sessao?.username,
      ehAdmin: !!sessao?.roles?.includes('ADMIN'),
      entrar,
      cadastrar,
      sair,
    }),
    [sessao, entrar, cadastrar, sair]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
