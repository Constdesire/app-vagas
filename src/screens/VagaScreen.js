import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Assentos from '../components/Assentos';
import Botao from '../components/Botao';
import Icone from '../components/Icone';
import Text from '../components/Texto';
import { request } from '../api';
import { useAuth } from '../auth';
import { categoria } from '../categorias';
import { dataHora, dinheiro } from '../format';
import { useLayout } from '../layout';
import { cores, PAD, sombra, tons } from '../theme';

/** Detalhe da vaga e botão de candidatura. A resposta ("vaga garantida" ou "sem vaga") chega depois, de forma assíncrona. */
export default function VagaScreen({ vaga, candidaturas, voltar, recarregar, irParaMinhas }) {
  const { token } = useAuth();
  const { duasColunas } = useLayout();
  const [mensagem, setMensagem] = useState(null); // { texto, ok }
  const [enviando, setEnviando] = useState(false);

  const Voltar = (
    <Pressable onPress={voltar} accessibilityRole="button" style={({ hovered }) => [styles.voltar, hovered && { backgroundColor: cores.amareloSuave }]}>
      <Icone nome="arrow-left" tam={18} />
      <Text style={{ fontWeight: '600' }}>Voltar</Text>
    </Pressable>
  );

  if (!vaga) {
    return (
      <View style={styles.conteudo}>
        {Voltar}
        <Text style={{ color: cores.tintaFraca }}>Carregando...</Text>
      </View>
    );
  }

  const minha = candidaturas.find((c) => c.vagaId === vaga.id);
  const cat = categoria(vaga.categoria);
  const tom = tons[cat.tom];
  const esgotada = vaga.disponiveis === 0;

  async function candidatar() {
    setEnviando(true);
    setMensagem(null);
    try {
      await request('/candidaturas', { method: 'POST', token, body: { vagaId: vaga.id } });
      setMensagem({ texto: 'Candidatura enviada. Aguarde: estamos verificando a vaga.', ok: true });
      recarregar();
    } catch (e) {
      setMensagem({ texto: e.message, ok: false });
    } finally {
      setEnviando(false);
    }
  }

  const principal = (
    <View style={{ gap: 20, flex: duasColunas ? 1.4 : undefined }}>
      {vaga.imagemUrl ? (
        <Image source={{ uri: vaga.imagemUrl }} style={styles.imagem} />
      ) : (
        <View style={[styles.capa, { backgroundColor: tom.bg }]}>
          <View style={styles.capaIcone}><Icone nome={cat.icone} tam={34} cor={tom.fg} /></View>
        </View>
      )}
      <View style={{ gap: 8 }}>
        <Text style={{ color: tom.fg, fontWeight: '700' }}>{cat.rotulo}</Text>
        <Text style={styles.titulo}>{vaga.titulo}</Text>
        {!!vaga.descricao && <Text style={styles.descricao}>{vaga.descricao}</Text>}
      </View>
      <View style={[styles.card, { gap: 14 }]}>
        <Linha icone="calendar" rotulo="Quando" valor={dataHora(vaga.inicioEm)} />
        {!!vaga.lugar && <Linha icone="map-pin" rotulo="Onde" valor={vaga.lugar} />}
        <Linha icone="tag" rotulo="Valor para entrar" valor={dinheiro(vaga.valor)} />
      </View>
    </View>
  );

  const lateral = (
    <View style={{ gap: 16, flex: duasColunas ? 1 : undefined }}>
      {!!mensagem && (
        <View style={[styles.aviso, { backgroundColor: mensagem.ok ? cores.verdeSuave : cores.rosaSuave }]}>
          <Icone nome={mensagem.ok ? 'check-circle' : 'alert-circle'} tam={17} cor={mensagem.ok ? cores.verdeTexto : cores.rosaTexto} />
          <Text style={{ flex: 1, fontWeight: '600', color: mensagem.ok ? cores.verdeTexto : cores.rosaTexto }}>{mensagem.texto}</Text>
        </View>
      )}

      <View style={[styles.card, sombra, { gap: 14 }]}>
        <View style={styles.cabecaPainel}>
          <View style={{ gap: 2 }}>
            <Text style={styles.mini}>Valor</Text>
            <Text style={{ fontSize: 30, fontWeight: '800', letterSpacing: -0.8 }}>{dinheiro(vaga.valor)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <Text style={styles.mini}>Vagas livres</Text>
            <Text style={{ fontSize: 30, fontWeight: '800', letterSpacing: -0.8 }}>
              {vaga.disponiveis}<Text style={{ color: cores.tintaFraca }}> / {vaga.capacidade}</Text>
            </Text>
          </View>
        </View>
        <Assentos ocupadas={vaga.capacidade - vaga.disponiveis} capacidade={vaga.capacidade} tamanho={18} />

        {!minha && (
          <>
            <Botao
              titulo={esgotada ? 'Vagas esgotadas' : `Candidatar-se por ${dinheiro(vaga.valor)}`}
              icone={esgotada ? 'slash' : 'check'}
              onPress={candidatar}
              carregando={enviando}
              desabilitado={esgotada}
            />
            {!esgotada && <Text style={styles.mini}>O pedido é analisado na hora. Se ainda houver vaga, ela é sua.</Text>}
          </>
        )}

        {minha?.status === 'PENDENTE' && (
          <View style={[styles.faixa, { backgroundColor: cores.amareloSuave, borderColor: cores.amarelo }]}>
            <View style={styles.faixaTitulo}>
              <Icone nome="clock" tam={20} cor={cores.amareloTexto} />
              <Text style={[styles.destaque, { color: cores.amareloTexto }]}>Aguarde, estamos verificando</Text>
            </View>
            <Text style={{ color: cores.tintaFraca }}>Sua candidatura foi recebida. O resultado aparece aqui e em Minhas candidaturas.</Text>
          </View>
        )}
        {minha?.status === 'CONFIRMADA' && (
          <View style={[styles.faixa, { backgroundColor: cores.verdeSuave, borderColor: cores.verde }]}>
            <View style={styles.faixaTitulo}>
              <Icone nome="check-circle" tam={20} cor={cores.verdeTexto} />
              <Text style={[styles.destaque, { color: cores.verdeTexto }]}>Sua vaga está garantida</Text>
            </View>
            <Text style={{ color: cores.tintaFraca }}>Valor cobrado: {dinheiro(minha.valor)}</Text>
          </View>
        )}
        {minha?.status === 'RECUSADA' && (
          <View style={[styles.faixa, { backgroundColor: cores.rosaSuave, borderColor: cores.rosa }]}>
            <View style={styles.faixaTitulo}>
              <Icone nome="x-circle" tam={20} cor={cores.rosaTexto} />
              <Text style={[styles.destaque, { color: cores.rosaTexto }]}>Não foi dessa vez</Text>
            </View>
            <Text style={{ color: cores.tintaFraca }}>{minha.motivo || 'As vagas acabaram.'} Nada foi cobrado.</Text>
          </View>
        )}
        {!!minha && <Botao titulo="Ver minhas candidaturas" variante="neutro" icone="check-square" onPress={irParaMinhas} />}
      </View>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.conteudo}>
      <View style={{ alignSelf: 'flex-start' }}>{Voltar}</View>
      <View style={duasColunas ? { flexDirection: 'row', gap: 28, alignItems: 'flex-start' } : { gap: 20 }}>
        {principal}
        {lateral}
      </View>
    </ScrollView>
  );
}

function Linha({ icone, rotulo, valor }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <View style={styles.linhaIcone}><Icone nome={icone} tam={17} cor={cores.tintaFraca} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.mini}>{rotulo}</Text>
        <Text style={{ fontWeight: '600', fontSize: 16 }}>{valor}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: PAD, paddingTop: 12, paddingBottom: 40, gap: 16 },
  voltar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, marginLeft: -12, borderRadius: 999, cursor: 'pointer' },
  imagem: { width: '100%', height: 240, borderRadius: 28, backgroundColor: cores.borda },
  capa: { width: '100%', height: 160, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  capaIcone: { width: 72, height: 72, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 36, fontWeight: '800', letterSpacing: -1.2, lineHeight: 40 },
  descricao: { fontSize: 17, lineHeight: 26, color: cores.tintaFraca, maxWidth: 620 },
  card: { backgroundColor: cores.superficie, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: cores.borda },
  cabecaPainel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 },
  mini: { fontSize: 13, color: cores.tintaFraca, fontWeight: '600' },
  faixa: { borderRadius: 20, padding: 16, gap: 10, borderWidth: 1.5 },
  faixaTitulo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  destaque: { fontSize: 18, fontWeight: '700' },
  aviso: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 14, borderRadius: 16 },
  linhaIcone: { width: 38, height: 38, borderRadius: 13, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center' },
});
