// `icone` = nome do ícone Feather; `tom` = cor do tema (amarelo, rosa ou verde)
export const CATEGORIAS = [
  { id: 'EDUCACAO', rotulo: 'Educação', icone: 'book-open', tom: 'amarelo' },
  { id: 'SAUDE', rotulo: 'Saúde', icone: 'heart', tom: 'rosa' },
  { id: 'ESPORTE', rotulo: 'Esporte', icone: 'activity', tom: 'verde' },
  { id: 'EVENTO', rotulo: 'Evento', icone: 'mic', tom: 'rosa' },
  { id: 'SERVICO', rotulo: 'Serviço', icone: 'scissors', tom: 'verde' },
  { id: 'OUTROS', rotulo: 'Outros', icone: 'star', tom: 'amarelo' },
];

export function categoria(id) {
  return CATEGORIAS.find((c) => c.id === id) || CATEGORIAS[CATEGORIAS.length - 1];
}
