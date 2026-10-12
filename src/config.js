import Constants from 'expo-constants';

// Descobre o IP do computador que está rodando o Expo, assim funciona no celular (Expo Go),
// no emulador e no navegador sem mexer em nada. Só o GATEWAY é acessado pelo app.
// Para forçar um endereço: EXPO_PUBLIC_API_URL=http://192.168.0.10:8080
function descobrirHost() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) return hostUri.split(':')[0];
  return 'localhost';
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${descobrirHost()}:8080`;

export const INTERVALO_VAGAS_MS = 3000;
export const INTERVALO_CANDIDATURAS_MS = 2000; // status "ao vivo": em análise -> confirmada/recusada
export const INTERVALO_RELATORIO_MS = 5000;
