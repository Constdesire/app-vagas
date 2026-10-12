import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icone from './Icone';
import Text from './Texto';

/** Etiqueta pequena com ícone. `tom` = { bg, fg } (ver theme.tons). */
export default function Pilula({ texto, icone, tom }) {
  return (
    <View style={[styles.pilula, { backgroundColor: tom.bg }]}>
      {!!icone && <Icone nome={icone} tam={13} cor={tom.fg} />}
      <Text style={[styles.texto, { color: tom.fg }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pilula: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, alignSelf: 'flex-start' },
  texto: { fontSize: 12, fontWeight: '700' },
});
