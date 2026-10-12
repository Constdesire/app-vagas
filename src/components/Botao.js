import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Icone from './Icone';
import Text from './Texto';
import { cores } from '../theme';

const VARIANTES = {
  principal: { bg: cores.tinta, fg: '#FFFFFF', borda: cores.tinta },
  amarelo: { bg: cores.amarelo, fg: cores.tinta, borda: cores.amarelo },
  perigo: { bg: cores.rosaSuave, fg: cores.rosaTexto, borda: cores.rosa },
  neutro: { bg: cores.superficie, fg: cores.tinta, borda: cores.bordaForte },
};

export default function Botao({ titulo, onPress, carregando, desabilitado, variante = 'principal', pequeno, icone }) {
  const v = VARIANTES[variante];
  const inativo = carregando || desabilitado;
  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      style={({ pressed, hovered }) => [
        styles.botao,
        pequeno && styles.pequeno,
        { backgroundColor: v.bg, borderColor: v.borda, opacity: inativo ? 0.5 : hovered || pressed ? 0.88 : 1 },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.conteudo}>
          {!!icone && <Icone nome={icone} tam={pequeno ? 15 : 17} cor={v.fg} />}
          <Text style={[styles.texto, pequeno && { fontSize: 14 }, { color: v.fg }]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 999, alignItems: 'center', borderWidth: 1.5, cursor: 'pointer' },
  pequeno: { paddingVertical: 8, paddingHorizontal: 16 },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  texto: { fontWeight: '700', fontSize: 15 },
});
