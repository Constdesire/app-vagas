import { useWindowDimensions } from 'react-native';

/** largo = computador (menu lateral); medio = tablet; senão celular (barra inferior). */
export function useLayout() {
  const { width } = useWindowDimensions();
  return { width, largo: width >= 900, medio: width >= 600, duasColunas: width >= 1000 };
}
