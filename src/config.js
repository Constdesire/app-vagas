import Constants from 'expo-constants';

// Descobre o IP do computador que está rodando o Expo, assim funciona no celular (Expo Go),
// no emulador e no navegador sem mexer em nada. Só o GATEWAY é acessado pelo app.
// Para forçar um endereço: EXPO_PUBLIC_API_URL=http://192.168.0.10:8080
function descobrirHost() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) return hostUri.split(':')[0];
  return 'localhost';
}

// URL base da API (o gateway). Vem da variavel EXPO_PUBLIC_API_URL (secret API_URL no deploy).
export const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${descobrirHost()}:8080`;

// Uma URL por microsservico, cada uma vinda de uma variavel/secret propria (nada escrito no codigo).
// Hoje as tres apontam para o gateway, que roteia para cada servico e valida o token.
// Se faltar a variavel, usa a URL do gateway.
export const LOGIN_URL = process.env.EXPO_PUBLIC_LOGIN_URL || API_URL;
export const VAGAS_URL = process.env.EXPO_PUBLIC_VAGAS_URL || API_URL;
export const CANDIDATURA_URL = process.env.EXPO_PUBLIC_CANDIDATURA_URL || API_URL;

export const INTERVALO_VAGAS_MS = 3000;
export const INTERVALO_CANDIDATURAS_MS = 2000; // status "ao vivo": em análise -> confirmada/recusada
export const INTERVALO_RELATORIO_MS = 5000;
