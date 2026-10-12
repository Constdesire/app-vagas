import React, { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Icone from '../components/Icone';
import Text from '../components/Texto';
import Vazio from '../components/Vazio';
import { request } from '../api';
import { useAuth } from '../auth';
import { INTERVALO_RELATORIO_MS } from '../config';
import { dataHora, dinheiro, mesExtenso } from '../format';
import { useLayout } from '../layout';
import { cores, PAD, sombra, tons } from '../theme';
import { usePolling } from '../usePolling';

/**
 * Relatório de vendas das vagas. SÓ O ADMIN:
 * o app só mostra esta aba para ADMIN, o gateway só libera /fatec/admin/** para ROLE_ADMIN
 * e o candidatura-ms confere o perfil de novo no token.
 */
export default function RelatorioScreen() {
  const { token, ehAdmin } = useAuth();
  const { medio } = useLayout();
  const [relatorio, setRelatorio] = useState(null);
  const [erro, setErro] = useState('');
  const [atualizando, setAtualizando] = useState(false);

  async function carregar() {
    try {
      const { dados } = await request('/fatec/admin/relatorio', { token });
      setRelatorio(dados);
      setErro('');
    } catch (e) {
      setErro(e.status === 403 ? 'Somente o administrador pode ver o relatório.' : e.message);
    }
  }
  usePolling(carregar, INTERVALO_RELATORIO_MS, [token]);

  if (!ehAdmin) {
    return <Vazio icone="lock" tom="rosa" titulo="Área do administrador" texto="Somente o administrador pode ver o relatório de vendas." />;
  }

  async function puxar() {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }

  const maiorMes = relatorio ? Math.max(1, ...relatorio.porMes.map((m) => Number(m.receita))) : 1;

  return (
    <ScrollView
      contentContainerStyle={styles.conteudo}
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={puxar} tintColor={cores.tinta} />}
    >
      <View style={{ gap: 4 }}>
        <Text style={styles.titulo}>Relatório</Text>
        <Text style={styles.sub}>Quanto cada vaga rendeu. Cada vaga garantida cobra o valor da vaga.</Text>
      </View>

      {!!erro && (
        <View style={styles.erro}>
          <Icone nome="alert-circle" tam={16} cor={cores.rosaTexto} />
          <Text style={{ color: cores.rosaTexto, flex: 1, fontWeight: '600' }}>{erro}</Text>
        </View>
      )}
      {!relatorio && !erro && <ActivityIndicator style={{ marginTop: 40 }} color={cores.tinta} />}

      {relatorio && (
        <>
          <View style={styles.tiles}>
            <Tile destaque icone="dollar-sign" rotulo="Receita total" valor={dinheiro(relatorio.receitaTotal)} fundo={cores.amarelo} />
            <Tile icone="check-circle" rotulo="Vagas garantidas" valor={String(relatorio.confirmadas)} tom={tons.verde} />
            <Tile icone="x-circle" rotulo="Sem vaga" valor={String(relatorio.recusadas)} tom={tons.rosa} />
            <Tile icone="clock" rotulo="Em análise" valor={String(relatorio.emAnalise)} tom={tons.amarelo} />
          </View>

          {relatorio.totalCandidaturas === 0 && (
            <Vazio icone="bar-chart-2" titulo="Ainda não há candidaturas" texto="Quando alguém se candidatar, as vendas aparecem aqui." />
          )}

          {relatorio.porMes.length > 0 && (
            <View style={[styles.secao, sombra]}>
              <Text style={styles.secaoTitulo}>Por mês</Text>
              {relatorio.porMes.map((m) => (
                <View key={m.mes} style={{ gap: 6 }}>
                  <View style={styles.linhaMes}>
                    <Text style={{ fontWeight: '600', flex: 1 }}>{mesExtenso(m.mes)}</Text>
                    <Text style={{ color: cores.tintaFraca }}>{m.vagas} {m.vagas === 1 ? 'vaga' : 'vagas'} · {m.confirmadas} garantidas</Text>
                    <Text style={styles.valor}>{dinheiro(m.receita)}</Text>
                  </View>
                  <View style={styles.trilho}>
                    <View style={[styles.barra, { width: `${(Number(m.receita) / maiorMes) * 100}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          )}

          {relatorio.porVaga.length > 0 && (
            <View style={[styles.secao, sombra]}>
              <Text style={styles.secaoTitulo}>Por vaga</Text>
              {medio && (
                <View style={[styles.linhaTabela, { borderBottomWidth: 1, borderColor: cores.borda, paddingBottom: 8 }]}>
                  <Text style={[styles.cab, { flex: 3 }]}>Vaga</Text>
                  <Text style={[styles.cab, styles.col]}>Pedidos</Text>
                  <Text style={[styles.cab, styles.col]}>Garantidas</Text>
                  <Text style={[styles.cab, styles.col]}>Sem vaga</Text>
                  <Text style={[styles.cab, styles.col, { textAlign: 'right' }]}>Receita</Text>
                </View>
              )}
              {relatorio.porVaga.map((v) => (
                medio ? (
                  <View key={v.vagaId} style={styles.linhaTabela}>
                    <View style={{ flex: 3 }}>
                      <Text style={{ fontWeight: '600' }} numberOfLines={1}>{v.titulo}</Text>
                      <Text style={styles.detalhe}>{v.inicioEm ? dataHora(v.inicioEm) : 'em análise'}{v.valor ? `  ·  ${dinheiro(v.valor)} cada` : ''}</Text>
                    </View>
                    <Text style={styles.col}>{v.candidaturas}</Text>
                    <Text style={[styles.col, { color: cores.verdeTexto, fontWeight: '700' }]}>{v.confirmadas}</Text>
                    <Text style={[styles.col, { color: cores.rosaTexto, fontWeight: '700' }]}>{v.recusadas}</Text>
                    <Text style={[styles.col, styles.valor, { textAlign: 'right' }]}>{dinheiro(v.receita)}</Text>
                  </View>
                ) : (
                  <View key={v.vagaId} style={styles.cartaoVaga}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                      <Text style={{ fontWeight: '700', flex: 1 }} numberOfLines={1}>{v.titulo}</Text>
                      <Text style={styles.valor}>{dinheiro(v.receita)}</Text>
                    </View>
                    <Text style={styles.detalhe}>
                      {v.candidaturas} pedidos · {v.confirmadas} garantidas · {v.recusadas} sem vaga
                    </Text>
                  </View>
                )
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function Tile({ icone, rotulo, valor, tom, fundo, destaque }) {
  return (
    <View style={[styles.tile, sombra, fundo && { backgroundColor: fundo, borderColor: fundo }, destaque && { minWidth: 220 }]}>
      <View style={[styles.tileIcone, { backgroundColor: tom ? tom.bg : 'rgba(255,255,255,0.65)' }]}>
        <Icone nome={icone} tam={18} cor={tom ? tom.fg : cores.tinta} />
      </View>
      <Text style={{ color: fundo ? cores.tinta : cores.tintaFraca, fontWeight: '600' }}>{rotulo}</Text>
      <Text style={styles.tileValor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: PAD, paddingTop: 12, paddingBottom: 40, gap: 20 },
  titulo: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  sub: { color: cores.tintaFraca, fontSize: 16 },
  erro: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: cores.rosaSuave, padding: 12, borderRadius: 14 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  tile: { flexGrow: 1, flexBasis: 150, minWidth: 150, backgroundColor: cores.superficie, borderRadius: 22, padding: 18, gap: 6, borderWidth: 1, borderColor: cores.borda },
  tileIcone: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  tileValor: { fontSize: 30, fontWeight: '800', letterSpacing: -1 },
  secao: { backgroundColor: cores.superficie, borderRadius: 24, padding: 20, gap: 16, borderWidth: 1, borderColor: cores.borda },
  secaoTitulo: { fontSize: 18, fontWeight: '700' },
  linhaMes: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  trilho: { height: 10, borderRadius: 5, backgroundColor: cores.borda, overflow: 'hidden' },
  barra: { height: 10, borderRadius: 5, backgroundColor: cores.amarelo },
  valor: { fontWeight: '800', fontSize: 16 },
  linhaTabela: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cab: { color: cores.tintaFraca, fontSize: 13, fontWeight: '600' },
  col: { flex: 1, minWidth: 70 },
  detalhe: { color: cores.tintaFraca, fontSize: 13 },
  cartaoVaga: { gap: 4, paddingVertical: 4 },
});
