import { tons } from './theme';

// Status de uma candidatura (o backend decide; o app só mostra)
export const STATUS = {
  PENDENTE: { texto: 'Em análise', icone: 'clock', tom: tons.amarelo },
  CONFIRMADA: { texto: 'Vaga garantida', icone: 'check-circle', tom: tons.verde },
  RECUSADA: { texto: 'Sem vaga', icone: 'x-circle', tom: tons.rosa },
};
