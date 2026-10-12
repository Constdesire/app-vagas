import { Platform } from 'react-native';

// Paleta: amarelo, rosa e verde clarinhos sobre um fundo quase branco. Sem azul.
export const cores = {
  fundo: '#FBFAF4',
  superficie: '#FFFFFF',
  borda: '#EEE9D8',
  bordaForte: '#DDD6BD',
  tinta: '#2A2230', // texto principal (ameixa bem escura)
  tintaFraca: '#75697F',

  amarelo: '#FFE27A',
  amareloSuave: '#FFF4C7',
  amareloTexto: '#7A5600',
  rosa: '#FFC4D8',
  rosaSuave: '#FFE8F0',
  rosaTexto: '#AE2A59',
  verde: '#B9EBC6',
  verdeSuave: '#E5F6E9',
  verdeTexto: '#1D6A3A',
};

// cada "tom" é um par fundo/ícone usado em ícones, pílulas e avisos
export const tons = {
  amarelo: { bg: '#FFF0B3', fg: cores.amareloTexto },
  rosa: { bg: '#FFDCE8', fg: cores.rosaTexto },
  verde: { bg: '#D5F2DD', fg: cores.verdeTexto },
};

export const fonte = Platform.select({
  web: "'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', sans-serif",
  default: undefined,
});

export const sombra = Platform.select({
  web: { boxShadow: '0 1px 2px rgba(42,34,48,0.05), 0 10px 28px rgba(42,34,48,0.07)' },
  default: { shadowColor: '#2A2230', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
});

export const PAD = 20;
