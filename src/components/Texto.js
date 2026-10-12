import React from 'react';
import { Text as RNText, TextInput as RNTextInput } from 'react-native';
import { cores, fonte } from '../theme';

// Text e TextInput com a fonte e a cor padrão do app (React Native não tem "fonte global").
export default function Texto({ style, ...resto }) {
  return <RNText {...resto} style={[{ fontFamily: fonte, color: cores.tinta }, style]} />;
}

export const Entrada = React.forwardRef(function Entrada({ style, ...resto }, ref) {
  return <RNTextInput ref={ref} {...resto} style={[{ fontFamily: fonte, color: cores.tinta }, style]} />;
});
