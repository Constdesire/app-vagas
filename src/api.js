import { API_URL } from './config';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
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

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method,
      headers,
      credentials: 'include', // web: deixa o navegador guardar o cookie access_token enviado pelo login
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new ApiError(0, `Não foi possível falar com o servidor (${API_URL}). O gateway está rodando?`);
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
        : resposta.status >= 500
          ? `Erro ${resposta.status} no servidor. Veja o console do gateway e dos microsserviços.`
          : `Erro ${resposta.status}`);
    throw new ApiError(resposta.status, mensagem);
  }
  return { dados, resposta };
}
