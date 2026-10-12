import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Assentos from '../components/Assentos';
import Chip from '../components/Chip';
import Icone from '../components/Icone';
import Pilula from '../components/Pilula';
import Text from '../components/Texto';
import Vazio from '../components/Vazio';
import { CATEGORIAS, categoria } from '../categorias';
import { dataHora, dinheiro } from '../format';
import { STATUS } from '../situacao';
import { cores, PAD, sombra, tons } from '../theme';

const ESPACO = 16;

/** Tela 1 (candidatar-se): lista de vagas em grade responsiva (1, 2 ou 3 colunas conforme a largura). */
export default function VagasScreen({ vagas, carregou, erro, candidaturas, abrirVaga, recarregar }) {
  const [filtro, setFiltro] = useState(null);
  const [atualizando, setAtualizando] = useState(false);
  const [largura, setLargura] = useState(0);

  const colunas = largura >= 860 ? 3 : largura >= 540 ? 2 : 1;
  const larguraCard = Math.floor((largura - PAD * 2 - ESPACO * (colunas - 1)) / colunas);
  const visiveis = filtro ? vagas.filter((v) => v.categoria === filtro) : vagas;

  async function puxar() {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 32 }}
      onLayout={(e) => setLargura(e.nativeEvent.layout.width)}
      refreshControl={<RefreshControl refreshing={atualizando} onRefresh={puxar} tintColor={cores.tinta} />}
    >
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Vagas</Text>
        <Text style={styles.sub}>Escolha uma vaga e candidate-se. Você acompanha o resultado em Minhas candidaturas.</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros} style={{ flexGrow: 0 }}>
        <Chip rotulo="Todas" ativo={!filtro} onPress={() => setFiltro(null)} />
        {CATEGORIAS.map((c) => (
          <Chip key={c.id} rotulo={c.rotulo} icone={c.icone} ativo={filtro === c.id} onPress={() => setFiltro(c.id)} />
        ))}
      </ScrollView>

      {!!erro && (
        <View style={styles.erro}>
          <Icone nome="alert-circle" tam={16} cor={cores.rosaTexto} />
          <Text style={{ color: cores.rosaTexto, flex: 1, fontWeight: '600' }}>{erro}</Text>
        </View>
      )}

      {!carregou && <ActivityIndicator style={{ marginTop: 48 }} color={cores.tinta} />}

      {carregou && visiveis.length === 0 && !erro && (
        <Vazio icone="search" titulo="Nenhuma vaga por aqui" texto="Escolha outra categoria ou volte mais tarde." />
      )}

      {largura > 0 && (
        <View style={styles.grade}>
          {visiveis.map((v) => (
            <Cartao
              key={v.id}
              vaga={v}
              largura={larguraCard}
              minha={candidaturas.find((c) => c.vagaId === v.id)}
              abrir={() => abrirVaga(v.id)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function Cartao({ vaga: v, largura, minha, abrir }) {
  const cat = categoria(v.categoria);
  const tom = tons[cat.tom];
  const esgotada = v.disponiveis === 0;
  const status = minha ? STATUS[minha.status] : null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={abrir}
      style={({ hovered, pressed }) => [
        styles.card,
        sombra,
        { width: largura },
        hovered && { transform: [{ translateY: -3 }], transitionDuration: '150ms' },
        pressed && { transform: [{ scale: 0.99 }] },
      ]}
    >
      {!!v.imagemUrl && <Image source={{ uri: v.imagemUrl }} style={styles.imagem} />}
      <View style={styles.corpo}>
        <View style={styles.topoCard}>
          <View style={[styles.iconeCat, { backgroundColor: tom.bg }]}>
            <Icone nome={cat.icone} tam={20} cor={tom.fg} />
          </View>
          <Text style={{ flex: 1, fontSize: 13, color: cores.tintaFraca, fontWeight: '600' }}>{cat.rotulo}</Text>
          {!!status && <Pilula texto={status.texto} icone={status.icone} tom={status.tom} />}
        </View>

        <Text style={styles.nome} numberOfLines={2}>{v.titulo}</Text>

        <View style={{ gap: 6 }}>
          <Meta icone="calendar" texto={dataHora(v.inicioEm)} />
          {!!v.lugar && <Meta icone="map-pin" texto={v.lugar} />}
        </View>

        <View style={styles.rodape}>
          <Assentos ocupadas={v.capacidade - v.disponiveis} capacidade={v.capacidade} />
          <View style={styles.rodapeLinha}>
            <Text style={{ fontWeight: '700', color: esgotada ? cores.rosaTexto : cores.verdeTexto }}>
              {esgotada ? 'Vagas esgotadas' : `${v.disponiveis} de ${v.capacidade} vagas`}
            </Text>
            <Text style={styles.preco}>{dinheiro(v.valor)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function Meta({ icone, texto }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Icone nome={icone} tam={15} cor={cores.tintaFraca} />
      <Text style={{ color: cores.tintaFraca, fontSize: 14, flex: 1 }} numberOfLines={1}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho: { paddingHorizontal: PAD, paddingTop: 12, paddingBottom: 16, gap: 4 },
  titulo: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  sub: { color: cores.tintaFraca, fontSize: 16, lineHeight: 22, maxWidth: 560 },
  filtros: { paddingHorizontal: PAD, paddingBottom: 18, gap: 8 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACO, paddingHorizontal: PAD },
  card: { backgroundColor: cores.superficie, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: cores.borda, cursor: 'pointer' },
  imagem: { width: '100%', height: 130, backgroundColor: cores.borda },
  corpo: { padding: 18, gap: 14 },
  topoCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconeCat: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  nome: { fontSize: 20, fontWeight: '700', letterSpacing: -0.4, lineHeight: 25 },
  rodape: { gap: 10, paddingTop: 14, borderTopWidth: 1, borderColor: cores.borda },
  rodapeLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  preco: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  erro: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: cores.rosaSuave, marginHorizontal: PAD, marginBottom: 14, padding: 12, borderRadius: 14 },
});
