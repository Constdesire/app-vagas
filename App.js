import React, { useEffect, useState } from 'react';
import { Platform, Pressable, SafeAreaView, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/auth';
import { request } from './src/api';
import { INTERVALO_CANDIDATURAS_MS, INTERVALO_VAGAS_MS } from './src/config';
import { useLayout } from './src/layout';
import { cores, tons } from './src/theme';
import { usePolling } from './src/usePolling';
import Icone from './src/components/Icone';
import Logo from './src/components/Logo';
import Text from './src/components/Texto';
import LoginScreen from './src/screens/LoginScreen';
import VagasScreen from './src/screens/VagasScreen';
import VagaScreen from './src/screens/VagaScreen';
import MinhasScreen from './src/screens/MinhasScreen';
import RelatorioScreen from './src/screens/RelatorioScreen';
import CriarVagaScreen from './src/screens/CriarVagaScreen';

// No navegador: carrega a fonte e ajusta a página (no celular usa a fonte do sistema).
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap';
  document.head.appendChild(link);
  document.title = 'VagaJá';
  document.body.style.backgroundColor = cores.fundo;
  document.body.style.margin = '0';
  const css = document.createElement('style');
  css.textContent = '*{-webkit-font-smoothing:antialiased} [role="button"]:focus-visible{outline:2px solid #2A2230;outline-offset:2px}';
  document.head.appendChild(css);
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Raiz />
    </AuthProvider>
  );
}

function Raiz() {
  const { sessao } = useAuth();
  return <SafeAreaView style={styles.raiz}>{sessao ? <Principal /> : <LoginScreen />}</SafeAreaView>;
}

function Principal() {
  const { token, usuario, ehAdmin, sair } = useAuth();
  const { largo } = useLayout();
  const [aba, setAba] = useState('vagas');
  const [vagaAberta, setVagaAberta] = useState(null);
  const [vagas, setVagas] = useState([]);
  const [carregouVagas, setCarregouVagas] = useState(false);
  const [erroVagas, setErroVagas] = useState('');
  const [candidaturas, setCandidaturas] = useState([]);
  const [carregouCandidaturas, setCarregouCandidaturas] = useState(false);

  // Dois "ao vivo" (polling): as vagas (quantas restam) e as MINHAS candidaturas (em análise -> resultado)
  async function carregarVagas() {
    try {
      const { dados } = await request('/vagas', { token });
      setVagas(dados);
      setErroVagas('');
    } catch (e) {
      setErroVagas(e.message);
    } finally {
      setCarregouVagas(true);
    }
  }
  async function carregarCandidaturas() {
    const { dados } = await request('/candidaturas/minhas', { token });
    setCandidaturas(dados);
    setCarregouCandidaturas(true);
  }
  usePolling(carregarVagas, INTERVALO_VAGAS_MS, [token]);
  usePolling(carregarCandidaturas, INTERVALO_CANDIDATURAS_MS, [token]);

  const emAnalise = candidaturas.filter((c) => c.status === 'PENDENTE').length;

  // as abas "soAdmin" só existem para o perfil ADMIN (o gateway também bloqueia no servidor)
  const abas = [
    { id: 'vagas', rotulo: 'Vagas', icone: 'grid' },
    { id: 'minhas', rotulo: 'Minhas', icone: 'check-square', selo: emAnalise },
    ...(ehAdmin
      ? [
          { id: 'relatorio', rotulo: 'Relatório', icone: 'bar-chart-2', soAdmin: true },
          { id: 'criar', rotulo: 'Nova vaga', icone: 'plus-circle', soAdmin: true },
        ]
      : []),
  ];

  function trocarAba(id) {
    setAba(id);
    setVagaAberta(null);
  }

  const conteudo = (
    <View style={styles.conteudo}>
      {vagaAberta !== null && (
        <VagaScreen
          vaga={vagas.find((v) => v.id === vagaAberta)}
          candidaturas={candidaturas}
          voltar={() => setVagaAberta(null)}
          recarregar={() => { carregarCandidaturas().catch(() => {}); carregarVagas(); }}
          irParaMinhas={() => trocarAba('minhas')}
        />
      )}
      {vagaAberta === null && aba === 'vagas' && (
        <VagasScreen vagas={vagas} carregou={carregouVagas} erro={erroVagas} candidaturas={candidaturas}
          abrirVaga={setVagaAberta} recarregar={carregarVagas} />
      )}
      {vagaAberta === null && aba === 'minhas' && (
        <MinhasScreen candidaturas={candidaturas} vagas={vagas} carregou={carregouCandidaturas}
          recarregar={() => carregarCandidaturas().catch(() => {})} abrirVaga={setVagaAberta} />
      )}
      {vagaAberta === null && aba === 'relatorio' && <RelatorioScreen />}
      {vagaAberta === null && aba === 'criar' && (
        <CriarVagaScreen aoCriar={(id) => { setAba('vagas'); carregarVagas(); setVagaAberta(id); }} />
      )}
    </View>
  );

  const papel = ehAdmin ? 'Administrador' : 'Usuário';

  // ---- computador: menu lateral ----
  if (largo) {
    return (
      <View style={styles.linha}>
        <View style={styles.lateral}>
          <View style={{ paddingHorizontal: 8, paddingBottom: 24 }}><Logo /></View>
          <View style={{ gap: 4, flex: 1 }}>
            {abas.map((a) => {
              const ativa = aba === a.id && vagaAberta === null;
              return (
                <Pressable
                  key={a.id}
                  accessibilityRole="button"
                  onPress={() => trocarAba(a.id)}
                  style={({ hovered }) => [styles.item, ativa && styles.itemAtivo, !ativa && hovered && { backgroundColor: cores.amareloSuave }]}
                >
                  <Icone nome={a.icone} tam={19} cor={ativa ? cores.tinta : cores.tintaFraca} />
                  <Text style={[styles.itemTexto, ativa && { color: cores.tinta, fontWeight: '700' }]}>{a.rotulo}</Text>
                  {a.soAdmin && <View style={styles.tagAdmin}><Text style={styles.tagAdminTexto}>admin</Text></View>}
                  {a.selo > 0 && <View style={styles.selo}><Text style={styles.seloTexto}>{a.selo}</Text></View>}
                </Pressable>
              );
            })}
          </View>
          <View style={styles.usuarioCaixa}>
            <View style={styles.avatar}><Text style={styles.avatarTexto}>{(usuario || '?')[0].toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700' }} numberOfLines={1}>{usuario}</Text>
              <Text style={{ fontSize: 12, color: cores.tintaFraca }}>{papel}</Text>
            </View>
            <Pressable onPress={sair} accessibilityLabel="Sair" accessibilityRole="button" style={styles.sairIcone}>
              <Icone nome="log-out" tam={18} cor={cores.tintaFraca} />
            </Pressable>
          </View>
        </View>
        <View style={{ flex: 1 }}>{conteudo}</View>
      </View>
    );
  }

  // ---- celular/tablet: topo + barra inferior ----
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topo}>
        <Logo tamanho={20} />
        <View style={styles.topoDireita}>
          <View style={styles.avatar}><Text style={styles.avatarTexto}>{(usuario || '?')[0].toUpperCase()}</Text></View>
          <Pressable onPress={sair} accessibilityLabel="Sair" accessibilityRole="button" style={styles.sairIcone}>
            <Icone nome="log-out" tam={19} cor={cores.tintaFraca} />
          </Pressable>
        </View>
      </View>
      {conteudo}
      <View style={styles.barra}>
        {abas.map((a) => {
          const ativa = aba === a.id && vagaAberta === null;
          return (
            <Pressable key={a.id} style={styles.barraItem} accessibilityRole="button" onPress={() => trocarAba(a.id)}>
              <View style={[styles.barraIcone, ativa && { backgroundColor: cores.amarelo }]}>
                <Icone nome={a.icone} tam={20} cor={ativa ? cores.tinta : cores.tintaFraca} />
                {a.selo > 0 && <View style={[styles.selo, styles.seloCanto]}><Text style={styles.seloTexto}>{a.selo}</Text></View>}
              </View>
              <Text style={[styles.barraTexto, ativa && { color: cores.tinta, fontWeight: '700' }]}>{a.rotulo}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.fundo, paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0 },
  linha: { flex: 1, flexDirection: 'row' },
  conteudo: { flex: 1, width: '100%', maxWidth: 1120, alignSelf: 'center' },

  lateral: { width: 256, padding: 20, borderRightWidth: 1, borderColor: cores.borda, backgroundColor: cores.superficie },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 14, cursor: 'pointer' },
  itemAtivo: { backgroundColor: cores.amarelo },
  itemTexto: { color: cores.tintaFraca, fontWeight: '600', fontSize: 15, flex: 1 },
  usuarioCaixa: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 16, backgroundColor: cores.fundo, borderWidth: 1, borderColor: cores.borda },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: tons.rosa.bg, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { color: cores.rosaTexto, fontWeight: '800' },
  sairIcone: { padding: 8, borderRadius: 10, cursor: 'pointer' },

  selo: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: cores.amarelo, alignItems: 'center', justifyContent: 'center' },
  seloCanto: { position: 'absolute', top: -4, right: -6 },
  tagAdmin: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 999, backgroundColor: cores.rosaSuave },
  tagAdminTexto: { color: cores.rosaTexto, fontSize: 11, fontWeight: '700' },
  seloTexto: { color: cores.tinta, fontSize: 11, fontWeight: '800' },

  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  topoDireita: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  barra: { flexDirection: 'row', backgroundColor: cores.superficie, borderTopWidth: 1, borderColor: cores.borda, paddingTop: 8, paddingBottom: 10 },
  barraItem: { flex: 1, alignItems: 'center', gap: 4, cursor: 'pointer' },
  barraIcone: { width: 52, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  barraTexto: { fontSize: 12, color: cores.tintaFraca, fontWeight: '600' },
});
