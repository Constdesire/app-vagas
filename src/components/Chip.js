import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Icone from './Icone';
import Text from './Texto';
import { cores } from '../theme';

export default function Chip({ rotulo, icone, ativo, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!ativo }}
      style={({ hovered }) => [styles.chip, ativo && styles.ativo, !ativo && hovered && { backgroundColor: cores.amareloSuave }]}
    >
      {!!icone && <Icone nome={icone} tam={15} cor={ativo ? cores.tinta : cores.tintaFraca} />}
      <Text style={[styles.texto, ativo && { color: cores.tinta }]}>{rotulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
    backgroundColor: cores.superficie, borderWidth: 1.5, borderColor: cores.borda, cursor: 'pointer',
  },
  ativo: { backgroundColor: cores.amarelo, borderColor: cores.amarelo },
  texto: { color: cores.tintaFraca, fontWeight: '600', fontSize: 14 },
});
