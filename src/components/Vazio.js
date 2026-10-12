import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icone from './Icone';
import Text from './Texto';
import { cores, tons } from '../theme';

export default function Vazio({ icone, titulo, texto, tom = 'amarelo' }) {
  return (
    <View style={styles.caixa}>
      <View style={[styles.icone, { backgroundColor: tons[tom].bg }]}>
        <Icone nome={icone} tam={24} cor={tons[tom].fg} />
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { alignItems: 'center', gap: 8, paddingVertical: 56, paddingHorizontal: 24 },
  icone: { width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  titulo: { fontSize: 18, fontWeight: '700' },
  texto: { color: cores.tintaFraca, textAlign: 'center', maxWidth: 320, lineHeight: 21 },
});
