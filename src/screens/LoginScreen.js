import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Botao from '../components/Botao';
import Campo from '../components/Campo';
import Icone from '../components/Icone';
import Text from '../components/Texto';
import Assentos from '../components/Assentos';
import Logo from '../components/Logo';
import { useAuth } from '../auth';
import { useLayout } from '../layout';
import { cores, sombra, tons } from '../theme';

const DESTAQUES = [
  { icone: 'clock', tom: tons.amarelo, texto: 'Candidate-se e acompanhe o resultado em tempo real.' },
  { icone: 'lock', tom: tons.verde, texto: 'Mesmo com muita gente pedindo ao mesmo tempo, ninguém passa do limite de vagas.' },
  { icone: 'bar-chart-2', tom: tons.rosa, texto: 'Quem organiza vê quanto cada vaga rendeu.' },
];

export default function LoginScreen() {
  const { entrar, cadastrar } = useAuth();
  const { largo } = useLayout();
  const [modoCadastro, setModoCadastro] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [admin, setAdmin] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function enviar() {
    if (!username.trim() || !password) {
      setErro('Informe usuário e senha.');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      if (modoCadastro) await cadastrar(username.trim(), password, [admin ? 'ADMIN' : 'USER']);
      else await entrar(username.trim(), password);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  const formulario = (
    <View style={[styles.card, sombra]}>
      <Text style={styles.titulo}>{modoCadastro ? 'Criar conta' : 'Entrar'}</Text>
      <Text style={styles.sub}>{modoCadastro ? 'Leva menos de um minuto.' : 'Bom te ver de novo.'}</Text>
      <Campo rotulo="Usuário" valor={username} onChange={setUsername} autoCapitalize="none" />
      <Campo rotulo="Senha" valor={password} onChange={setPassword} senha onSubmitEditing={enviar} />

      {modoCadastro && (
        <Pressable style={styles.linhaCheck} onPress={() => setAdmin(!admin)} accessibilityRole="checkbox" accessibilityState={{ checked: admin }}>
          <View style={[styles.check, admin && styles.checkAtivo]}>{admin && <Icone nome="check" tam={14} cor={cores.tinta} />}</View>
          <Text style={{ flex: 1, color: cores.tintaFraca }}>Sou administrador (cria vagas e vê o relatório)</Text>
        </Pressable>
      )}

      {!!erro && (
        <View style={styles.erro}>
          <Icone nome="alert-circle" tam={16} cor={cores.rosaTexto} />
          <Text style={{ color: cores.rosaTexto, flex: 1, fontWeight: '600' }}>{erro}</Text>
        </View>
      )}

      <Botao titulo={modoCadastro ? 'Criar conta' : 'Entrar'} onPress={enviar} carregando={carregando} />

      <Pressable onPress={() => { setModoCadastro(!modoCadastro); setErro(''); }}>
        <Text style={styles.alternar}>{modoCadastro ? 'Já tenho conta' : 'Não tenho conta. Criar agora'}</Text>
      </Pressable>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, flexDirection: largo ? 'row' : 'column' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {largo && (
        <View style={styles.painel}>
          <View style={[styles.bolha, { width: 280, height: 280, top: -90, right: -70, backgroundColor: cores.rosa }]} />
          <View style={[styles.bolha, { width: 170, height: 170, bottom: 70, left: -50, backgroundColor: cores.verde }]} />
          <Logo tamanho={26} />
          <View style={{ gap: 28, maxWidth: 460 }}>
            <Text style={styles.manchete}>Vagas limitadas. Quem pede primeiro, garante.</Text>
            <View style={{ gap: 6 }}>
              <Assentos ocupadas={7} capacidade={8} tamanho={22} />
              <Text style={{ fontWeight: '600', color: cores.tinta }}>Cada bolinha é uma vaga. Quando enchem, acabou.</Text>
            </View>
            <View style={{ gap: 14 }}>
              {DESTAQUES.map((d) => (
                <View key={d.icone} style={styles.destaque}>
                  <View style={[styles.destaqueIcone, { backgroundColor: d.tom.bg }]}><Icone nome={d.icone} tam={18} cor={d.tom.fg} /></View>
                  <Text style={{ flex: 1, fontSize: 15 }}>{d.texto}</Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={{ color: cores.tintaFraca, fontSize: 13 }}>Aulas, laboratórios, consultas, quadras e eventos.</Text>
        </View>
      )}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.lado, !largo && { paddingTop: 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        {!largo && (
          <View style={{ alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <Logo tamanho={30} />
            <Text style={{ color: cores.tintaFraca, textAlign: 'center' }}>Candidate-se e garanta a sua vaga.</Text>
          </View>
        )}
        {formulario}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  painel: { flex: 1.05, backgroundColor: cores.amarelo, padding: 48, justifyContent: 'space-between', overflow: 'hidden' },
  bolha: { position: 'absolute', borderRadius: 999, opacity: 0.85 },
  manchete: { fontSize: 46, fontWeight: '800', letterSpacing: -1.5, lineHeight: 50 },
  destaque: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  destaqueIcone: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  lado: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { backgroundColor: cores.superficie, borderRadius: 28, padding: 28, gap: 16, maxWidth: 440, width: '100%', alignSelf: 'center', borderWidth: 1, borderColor: cores.borda },
  titulo: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  sub: { color: cores.tintaFraca, marginTop: -10 },
  linhaCheck: { flexDirection: 'row', alignItems: 'center', gap: 10, cursor: 'pointer' },
  check: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: cores.bordaForte, alignItems: 'center', justifyContent: 'center' },
  checkAtivo: { backgroundColor: cores.amarelo, borderColor: cores.amarelo },
  erro: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: cores.rosaSuave, padding: 12, borderRadius: 14 },
  alternar: { textAlign: 'center', fontWeight: '600', textDecorationLine: 'underline' },
});
