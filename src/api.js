import { API_URL, CANDIDATURA_URL, LOGIN_URL, VAGAS_URL } from './config';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// RETRY: leituras (GET) que falham por rede ou por 502/503/504 (servidor acordando no Render gratuito,
// que pode levar ate ~1 min) sao repetidas esperando 1s, 2s e 4s antes de desistir.
const ESPERAS_MS = [1000, 2000, 4000];
const STATUS_RETRY = [502, 503, 504];
const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchComRetry(url, opcoes, repetir) {
  const tentativas = repetir ? ESPERAS_MS.length + 1 : 1;
  let erro;
  for (let i = 0; i < tentativas; i++) {
    const ultima = i === tentativas - 1;
    try {
      const resposta = await fetch(url, opcoes);
      if (!ultima && STATUS_RETRY.includes(resposta.status)) {
        await esperar(ESPERAS_MS[i]);
        continue;
      }
      return resposta;
    } catch (e) {
      erro = e;
      if (!ultima) await esperar(ESPERAS_MS[i]);
    }
  }
  throw erro;
}

// FALLBACK: mensagem amigavel quando o servidor nao responde mesmo depois das tentativas
const MSG_INDISPONIVEL =
  'Servidor indisponivel ou acordando (o plano gratuito pode levar ate 1 minuto). Tente novamente em instantes.';

// Escolhe a URL base conforme o microsservico dono da rota.
function baseDaRota(caminho) {
  if (caminho.startsWith('/fatec/login')) return LOGIN_URL;
  if (caminho.startsWith('/candidaturas') || caminho.startsWith('/fatec/admin/relatorio')) return CANDIDATURA_URL;
  if (caminho.startsWith('/vagas') || caminho.startsWith('/fatec/admin/vagas')) return VAGAS_URL;
  return API_URL;
}

let aoExpirarSessao = null;
export function registrarAoExpirarSessao(callback) {
  aoExpirarSessao = callback;
}

/**
 * Chamada única para o gateway. Todo request autenticado leva
 * "Authorization: Bearer <token>", que é o que o gateway (oauth2 resource server) valida.
 */
export async function request(caminho, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const base = baseDaRota(caminho);
  let resposta;
  try {
    resposta = await fetchComRetry(
      `${base}${caminho}`,
      {
        method,
        headers,
        credentials: 'include', // web: deixa o navegador guardar o cookie access_token enviado pelo login
        body: body !== undefined ? JSON.stringify(body) : undefined,
      },
      method === 'GET'
    );
  } catch (e) {
    throw new ApiError(0, MSG_INDISPONIVEL);
  }

  const texto = await resposta.text();
  let dados = null;
  try {
    dados = texto ? JSON.parse(texto) : null;
  } catch (e) {
    dados = texto;
  }

  if (!resposta.ok) {
    if (resposta.status === 401 && token && aoExpirarSessao) aoExpirarSessao();
    const mensagem =
      (dados && dados.erro) ||
      (resposta.status === 401
        ? 'Sessão expirada. Entre novamente.'
        : STATUS_RETRY.includes(resposta.status)
          ? MSG_INDISPONIVEL
          : resposta.status >= 500
            ? `Erro ${resposta.status} no servidor. Tente novamente em instantes.`
          : `Erro ${resposta.status}`);
    throw new ApiError(resposta.status, mensagem);
  }
  return { dados, resposta };
}
