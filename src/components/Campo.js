import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text, { Entrada } from './Texto';
import { cores } from '../theme';

export default function Campo({ rotulo, valor, onChange, numerico, senha, placeholder, multilinha, ...resto }) {
  const [foco, setFoco] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {!!rotulo && <Text style={styles.rotulo}>{rotulo}</Text>}
      <Entrada
        style={[styles.input, multilinha && { minHeight: 80, textAlignVertical: 'top' }, foco && styles.foco]}
        value={valor}
        onChangeText={onChange}
        keyboardType={numerico ? 'number-pad' : 'default'}
        secureTextEntry={senha}
        placeholder={placeholder}
        placeholderTextColor="#A79DB0"
        multiline={multilinha}
        onFocus={() => setFoco(true)}
        onBlur={() => setFoco(false)}
        {...resto}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rotulo: { fontSize: 14, fontWeight: '600', color: cores.tintaFraca },
  input: {
    backgroundColor: cores.superficie, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: cores.borda, fontSize: 16, outlineStyle: 'none',
  },
  foco: { borderColor: cores.tinta },
});
