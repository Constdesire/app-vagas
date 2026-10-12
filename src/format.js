export function dinheiro(valor) {
  if (valor === null || valor === undefined) return '—';
  const [inteiro, decimal] = Number(valor).toFixed(2).split('.');
  return `R$ ${inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimal}`;
}

export function tempoRestante(ms) {
  if (ms <= 0) return 'Encerrado';
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const dois = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${dois(m)}:${dois(s)}` : `${dois(m)}:${dois(s)}`;
}

export function horaCurta(epochMs) {
  const d = new Date(epochMs);
  const dois = (n) => String(n).padStart(2, '0');
  return `${dois(d.getHours())}:${dois(d.getMinutes())}:${dois(d.getSeconds())}`;
}

const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

/** Ex.: "qua 01/10 14:30" */
export function dataHora(epochMs) {
  const d = new Date(epochMs);
  const dois = (n) => String(n).padStart(2, '0');
  return `${DIAS[d.getDay()]} ${dois(d.getDate())}/${dois(d.getMonth() + 1)} ${dois(d.getHours())}:${dois(d.getMinutes())}`;
}

/** Contagem longa: "2d 03:10:05" para prazos de dias. */
export function tempoAte(ms) {
  if (ms <= 0) return 'Já começou';
  const dias = Math.floor(ms / 86400000);
  const resto = ms % 86400000;
  const base = tempoRestante(resto);
  return dias > 0 ? `${dias}d ${base.length === 5 ? '00:' + base : base}` : base;
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** "2026-10" -> "outubro de 2026" */
export function mesExtenso(anoMes) {
  const [ano, mes] = anoMes.split('-');
  return `${MESES[Number(mes) - 1]} de ${ano}`;
}
