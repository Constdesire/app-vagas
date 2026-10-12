import React from 'react';
import { StyleSheet, View } from 'react-native';
import { cores } from '../theme';

/**
 * Visual das vagas: uma bolinha por vaga (até 12); acima disso, uma barra.
 * Preenchida = ocupada. Quando lota, tudo vira rosa.
 */
export default function Assentos({ ocupadas, capacidade, tamanho = 14 }) {
  const lotada = ocupadas >= capacidade;
  const cheio = lotada ? '#FF9DBE' : '#6FD39A';
  if (capacidade > 12) {
    const pct = Math.min(100, (ocupadas / capacidade) * 100);
    return (
      <View style={styles.trilho}>
        <View style={[styles.preenchido, { width: `${pct}%`, backgroundColor: cheio }]} />
      </View>
    );
  }
  return (
    <View style={styles.linha}>
      {Array.from({ length: capacidade }, (_, i) => (
        <View
          key={i}
          style={[
            { width: tamanho, height: tamanho, borderRadius: tamanho / 2, borderWidth: 2 },
            i < ocupadas ? { backgroundColor: cheio, borderColor: cheio } : { backgroundColor: 'transparent', borderColor: cores.bordaForte },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  trilho: { height: 10, borderRadius: 5, backgroundColor: cores.borda, overflow: 'hidden' },
  preenchido: { height: 10, borderRadius: 5 },
});
