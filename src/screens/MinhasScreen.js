import React from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Icone from '../components/Icone';
import Pilula from '../components/Pilula';
import Text from '../components/Texto';
import Vazio from '../components/Vazio';
import { dataHora, dinheiro, horaCurta } from '../format';
import { STATUS } from '../situacao';
import { cores, PAD } from '../theme';

/** Tela 2 (status da minha vaga): atualiza sozinha enquanto o pedido está "em análise". */
export default function MinhasScreen({ candidaturas, vagas, carregou, recarregar, abrirVaga }) {
  const [atualizando, setAtualizando] = React.useState(false);
  const emAnalise = candidaturas.filter((c) => c.status === 'PENDENTE').length;

  async function puxar() {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  }

  return (
    <ScrollView
      contentContainerStyle={styles.conteudo}
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={puxar} tintColor={cores.tinta} />}
    >
      <View style={{ gap: 4, marginBottom: 8 }}>
        <Text style={styles.titulo}>Minhas candidaturas</Text>
        <Text style={styles.sub}>
          {emAnalise > 0
            ? `${emAnalise} em análise agora. Esta tela atualiza sozinha.`
            : 'O status de cada vaga que você pediu.'}
        </Text>
      </View>

      {carregou && candidaturas.length === 0 && (
        <Vazio icone="check-square" tom="verde" titulo="Nenhuma candidatura ainda" texto="Escolha uma vaga na aba Vagas e candidate-se." />
      )}

      <View style={{ gap: 12, maxWidth: 760 }}>
        {candidaturas.map((c) => {
          const status = STATUS[c.status];
          const vaga = vagas.find((v) => v.id === c.vagaId);
          const titulo = c.vagaTitulo || vaga?.titulo || `Vaga #${c.vagaId}`;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              onPress={() => abrirVaga(c.vagaId)}
              style={({ hovered }) => [styles.card, hovered && { borderColor: cores.tinta }]}
            >
              <View style={[styles.icone, { backgroundColor: status.tom.bg }]}>
                <Icone nome={status.icone} tam={22} cor={status.tom.fg} />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <View style={styles.linhaTopo}>
                  <Text style={styles.nome} numberOfLines={1}>{titulo}</Text>
                  <Pilula texto={status.texto} icone={status.icone} tom={status.tom} />
                </View>
                <Text style={{ color: cores.tintaFraca }}>
                  {c.status === 'PENDENTE' && 'Aguarde, estamos verificando se ainda há vaga.'}
                  {c.status === 'CONFIRMADA' && `Valor cobrado: ${dinheiro(c.valor)}`}
                  {c.status === 'RECUSADA' && `${c.motivo || 'As vagas acabaram.'} Nada foi cobrado.`}
                </Text>
                <Text style={styles.detalhe}>
                  Pedido às {horaCurta(c.criadaEm)}{c.vagaInicioEm ? `  ·  Aula: ${dataHora(c.vagaInicioEm)}` : ''}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: PAD, paddingTop: 12, paddingBottom: 32, gap: 8 },
  titulo: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  sub: { color: cores.tintaFraca, fontSize: 16 },
  card: { flexDirection: 'row', gap: 14, backgroundColor: cores.superficie, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: cores.borda, cursor: 'pointer' },
  icone: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  linhaTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' },
  nome: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3, flexShrink: 1 },
  detalhe: { color: cores.tintaFraca, fontSize: 13 },
});
