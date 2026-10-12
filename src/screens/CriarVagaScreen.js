import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Botao from '../components/Botao';
import Campo from '../components/Campo';
import Chip from '../components/Chip';
import Icone from '../components/Icone';
import Text from '../components/Texto';
import Vazio from '../components/Vazio';
import { request } from '../api';
import { useAuth } from '../auth';
import { CATEGORIAS } from '../categorias';
import { cores, PAD, sombra } from '../theme';

const DATAS = [
  { rotulo: 'Amanhã', minutos: 1440 },
  { rotulo: 'Em 7 dias', minutos: 10080 },
  { rotulo: 'Em 30 dias', minutos: 43200 },
  { rotulo: 'Em 60 dias', minutos: 86400 },
];

/** Só o ADMIN cria vagas (POST /fatec/admin/vagas: o gateway exige ROLE_ADMIN). */
export default function CriarVagaScreen({ aoCriar }) {
  const { token, ehAdmin } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [lugar, setLugar] = useState('');
  const [capacidade, setCapacidade] = useState('40');
  const [valor, setValor] = useState('10,00');
  const [categoria, setCategoria] = useState('EDUCACAO');
  const [minutos, setMinutos] = useState(1440);
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (!ehAdmin) {
    return <Vazio icone="lock" tom="rosa" titulo="Área do administrador" texto="Somente o administrador cria vagas." />;
  }

  async function criar() {
    setEnviando(true);
    setMensagem(null);
    try {
      const numero = Number(String(valor).replace(',', '.'));
      if (Number.isNaN(numero)) throw new Error('Informe o valor em reais, por exemplo 10,00');
      const { dados } = await request('/fatec/admin/vagas', {
        method: 'POST',
        token,
        body: { titulo, descricao, categoria, lugar, capacidade: Number(capacidade), valor: numero, minutosAteInicio: minutos },
      });
      setTitulo('');
      setDescricao('');
      aoCriar(dados.id);
    } catch (e) {
      setMensagem(e.status === 403 ? 'Sem permissão: somente o administrador cria vagas.' : e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
      <View style={{ gap: 4 }}>
        <Text style={styles.titulo}>Nova vaga</Text>
        <Text style={styles.sub}>Defina quantas vagas existem e quanto cada uma custa.</Text>
      </View>

      <View style={[styles.card, sombra]}>
        <Campo rotulo="Título" valor={titulo} onChange={setTitulo} placeholder="Ex.: Aula no Laboratório 3" />
        <Campo rotulo="Descrição" valor={descricao} onChange={setDescricao} multilinha placeholder="O que os alunos vão encontrar" />

        <View style={{ gap: 8 }}>
          <Text style={styles.rotulo}>Categoria</Text>
          <View style={styles.chips}>
            {CATEGORIAS.map((c) => (
              <Chip key={c.id} rotulo={c.rotulo} icone={c.icone} ativo={categoria === c.id} onPress={() => setCategoria(c.id)} />
            ))}
          </View>
        </View>

        <View style={styles.dupla}>
          <View style={{ flex: 1, minWidth: 200 }}><Campo rotulo="Local" valor={lugar} onChange={setLugar} placeholder="Sala, laboratório, quadra" /></View>
          <View style={{ width: 140 }}><Campo rotulo="Vagas" valor={capacidade} onChange={setCapacidade} numerico /></View>
          <View style={{ width: 160 }}><Campo rotulo="Valor (R$)" valor={valor} onChange={setValor} placeholder="10,00" /></View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={styles.rotulo}>Data da aula</Text>
          <View style={styles.chips}>
            {DATAS.map((d) => (
              <Chip key={d.minutos} rotulo={d.rotulo} ativo={minutos === d.minutos} onPress={() => setMinutos(d.minutos)} />
            ))}
          </View>
        </View>

        {!!mensagem && (
          <View style={styles.erro}>
            <Icone nome="alert-circle" tam={16} cor={cores.rosaTexto} />
            <Text style={{ color: cores.rosaTexto, flex: 1, fontWeight: '600' }}>{mensagem}</Text>
          </View>
        )}
        <Botao titulo="Criar vaga" icone="plus" onPress={criar} carregando={enviando} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: PAD, paddingTop: 12, paddingBottom: 40, gap: 20 },
  titulo: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  sub: { color: cores.tintaFraca, fontSize: 16 },
  card: { backgroundColor: cores.superficie, borderRadius: 28, padding: 24, gap: 20, borderWidth: 1, borderColor: cores.borda, maxWidth: 680, width: '100%' },
  rotulo: { fontSize: 14, fontWeight: '600', color: cores.tintaFraca },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dupla: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  erro: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: cores.rosaSuave, padding: 12, borderRadius: 14 },
});
