import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icone from './Icone';
import Text from './Texto';
import { cores } from '../theme';

export default function Logo({ tamanho = 22 }) {
  const lado = tamanho + 10;
  return (
    <View style={styles.linha}>
      <View style={[styles.marca, { width: lado, height: lado, borderRadius: lado * 0.32 }]}>
        <Icone nome="check" tam={tamanho * 0.75} cor={cores.tinta} />
      </View>
      <Text style={{ fontSize: tamanho, fontWeight: '800', letterSpacing: -0.5 }}>VagaJá</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  marca: { backgroundColor: cores.amarelo, alignItems: 'center', justifyContent: 'center' },
});
