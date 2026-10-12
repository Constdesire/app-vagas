import React from 'react';
import { Feather } from '@expo/vector-icons';
import { cores } from '../theme';

// Ícones de linha (Feather): traço fino e minimalista.
export default function Icone({ nome, tam = 18, cor = cores.tinta }) {
  return <Feather name={nome} size={tam} color={cor} />;
}
