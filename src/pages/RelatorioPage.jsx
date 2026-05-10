import { useEffect, useMemo, useState } from 'react';
import { eventService } from '../services/eventService';
import { reportService } from '../services/reportService';

const CURSOS = [
  'Automação Industrial',
  'Desenvolvimento de Software Multiplataforma',
  'Gestão Empresarial (EaD)',
  'Gestão Financeira',
  'Manutenção Industrial',
  'Redes de Computadores',
  'Sistemas Biomédicos',
];

const SEMESTRES = ['1', '2', '3', '4', '5', '6', '7', '8'];
const TURNOS = ['Matutino', 'Vespertino', 'Noturno', 'Integral', 'EaD'];

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function resolveDateValue(linha, candidates) {
  for (const key of candidates) {
    const value = linha[key];
    if (value) return value;
  }
  return null;
}

function normalizeText(value) {
  return (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function resolveCourseValue(linha) {
  return (
    linha.courseName ||
    linha.course ||
    linha.courseTitle ||
    linha.curso ||
    linha.nomeCurso ||
    linha.className ||
    'Não informado'
  );
}

function resolveSemesterValue(linha) {
  return (
    linha.semester ||
    linha.semestre ||
    linha.period ||
    linha.periodo ||
    linha.term ||
    ''
  ).toString();
}

function resolveShiftValue(linha) {
  return (
    linha.shift ||
    linha.turno ||
    linha.timeOfDay ||
    linha.schedule ||
    ''
  ).toString();
}

function resolveEntryMethod(linha) {
  return (
    linha.entryMethod ||
    linha.metodoEntrada ||
    linha.checkInMethod ||
    linha.inputMethod ||
    '—'
  );
}

function resolveExitMethod(linha) {
  return (
    linha.exitMethod ||
    linha.metodoSaida ||
    linha.checkOutMethod ||
    linha.outputMethod ||
    '—'
  );
}

function resolvePhotoLinked(linha) {
  const value = linha.photoLinked ?? linha.fotoVinculada ?? linha.hasFaceEnrollment ?? linha.hasPhoto;
  if (value === true) return 'Sim';
  if (value === false) return 'Não';
  return '—';
}

function resolveValidValue(linha) {
  const value = linha.isValid ?? linha.presencaValida ?? linha.PresencaValida;
  if (typeof value === 'boolean') return value;
  return null;
}

export default function RelatorioPage() {
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState('');
  const [dados, setDados] = useState([]);
  const [cursoSelecionado, setCursoSelecionado] = useState('TODOS');
  const [semestreSelecionado, setSemestreSelecionado] = useState('TODOS');
  const [turnoSelecionado, setTurnoSelecionado] = useState('TODOS');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarEventos() {
      try {
        const lista = await eventService.list();
        setEventos(lista);
        if (lista.length > 0) {
          setEventoSelecionado(lista[0].id);
        }
      } catch {
        setErro('Nao foi possivel carregar eventos.');
      }
    }

    carregarEventos();
  }, []);

  useEffect(() => {
    if (!eventoSelecionado) return;

    async function carregarRelatorio() {
      try {
        setLoading(true);
        setErro('');
        const response = await reportService.getAttendanceByEvent(eventoSelecionado);
        const lista = Array.isArray(response) ? response : [];
        setDados(Array.isArray(lista) ? lista : []);
      } catch {
        setDados([]);
        setErro('Nao foi possivel carregar registros deste evento no momento.');
      } finally {
        setLoading(false);
      }
    }

    carregarRelatorio();
  }, [eventoSelecionado]);

  const eventoAtual = useMemo(
    () => eventos.find(ev => ev.id === eventoSelecionado),
    [eventos, eventoSelecionado]
  );

  const regra = {
    minimumStayMinutes: eventoAtual?.minimumStayMinutes ?? eventoAtual?.tempoMinimoMinutos ?? 0,
    scoreValue: eventoAtual?.scoreValue ?? eventoAtual?.pontuacao ?? 0,
  };

  const regraConfigurada = regra.minimumStayMinutes > 0 || regra.scoreValue > 0;

  const dadosFiltrados = useMemo(() => {
    return dados.filter((linha) => {
      const cursoLinha = resolveCourseValue(linha);
      const semestreLinha = resolveSemesterValue(linha);
      const turnoLinha = resolveShiftValue(linha);

      const cursoOk =
        cursoSelecionado === 'TODOS' ||
        normalizeText(cursoLinha) === normalizeText(cursoSelecionado);

      const semestreOk =
        semestreSelecionado === 'TODOS' ||
        normalizeText(semestreLinha) === normalizeText(semestreSelecionado);

      const turnoOk =
        turnoSelecionado === 'TODOS' ||
        normalizeText(turnoLinha) === normalizeText(turnoSelecionado);

      return cursoOk && semestreOk && turnoOk;
    });
  }, [dados, cursoSelecionado, semestreSelecionado, turnoSelecionado]);

  return (
    <>
      <h2 style={{ color: '#c41e3a', marginBottom: '25px', fontSize: '26px' }}>
        Relatório por Cursos
      </h2>

      <div className="card" style={{ padding: '20px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '12px', color: '#555' }}>Evento:</label>
        <select
          value={eventoSelecionado}
          onChange={e => setEventoSelecionado(e.target.value)}
          style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '320px' }}
        >
          {eventos.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.name || ev.nomeEvento || `Evento ${ev.id}`}</option>
          ))}
        </select>

        <div style={{ marginTop: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#555' }}>Curso:</label>
            <select
              value={cursoSelecionado}
              onChange={(e) => setCursoSelecionado(e.target.value)}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '320px' }}
            >
              <option value="TODOS">Todos</option>
              {CURSOS.map((curso) => (
                <option key={curso} value={curso}>{curso}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#555' }}>Semestre:</label>
            <select
              value={semestreSelecionado}
              onChange={(e) => setSemestreSelecionado(e.target.value)}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '140px' }}
            >
              <option value="TODOS">Todos</option>
              {SEMESTRES.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: '#555' }}>Turno:</label>
            <select
              value={turnoSelecionado}
              onChange={(e) => setTurnoSelecionado(e.target.value)}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', width: '180px' }}
            >
              <option value="TODOS">Todos</option>
              {TURNOS.map((turno) => (
                <option key={turno} value={turno}>{turno}</option>
              ))}
            </select>
          </div>
        </div>

        <p style={{ marginTop: '12px', color: '#666', fontSize: '14px' }}>
          {regraConfigurada
            ? `Regra ativa: permanência mínima de ${regra.minimumStayMinutes} min e pontos base ${regra.scoreValue}.`
            : 'Regra do evento não configurada.'}
        </p>
      </div>

      <div className="card">
        <h3 style={{ color: '#c41e3a', marginBottom: '18px' }}>Resultados por Curso</h3>

        {loading && (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Carregando relatório...</p>
        )}

        {!loading && erro && (
          <p style={{ textAlign: 'center', color: '#c41e3a', padding: '20px' }}>{erro}</p>
        )}

        {!loading && !erro && dados.length === 0 && (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Nenhum registro encontrado para este evento.</p>
        )}

        {!loading && !erro && dados.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #c41e3a' }}>
                  {['Curso', 'Semestre', 'Turno', 'Participante', 'Método entrada', 'Foto vinculada', 'Método saída', 'Entrada', 'Saída', 'Permanência (min)', 'Status', 'Pontos finais'].map(h => (
                    <th key={h} style={{ padding: '10px 8px', color: '#c41e3a', fontWeight: 'bold' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dadosFiltrados.map((linha, idx) => {
                  const permanencia = toNumber(
                    linha.stayMinutes ?? linha.tempoPermanenciaMinutos ?? linha.TempoPermanenciaMinutos ?? linha.permanenciaMinutos ?? linha.durationMinutes ?? linha.duration,
                    0
                  );
                  const minimo = toNumber(linha.minimumStayMinutes ?? linha.tempoMinimoMinutos ?? regra.minimumStayMinutes, 0);
                  const validoApi = resolveValidValue(linha);
                  const valido = typeof validoApi === 'boolean' ? validoApi : (minimo > 0 ? permanencia >= minimo : true);
                  const pontosBase = toNumber(linha.scoreValue ?? linha.pontuacao ?? linha.Pontuacao ?? regra.scoreValue, 0);
                  const pontosFinalApi = linha.finalScore ?? linha.pontosFinais ?? linha.totalPoints ?? linha.pontuacao ?? linha.Pontuacao;
                  const pontosFinais = Number.isFinite(Number(pontosFinalApi))
                    ? Number(pontosFinalApi)
                    : (valido ? pontosBase : 0);

                  const entrada = resolveDateValue(linha, ['checkInAt', 'entryAt', 'entradaEm', 'checkIn']);
                  const saida = resolveDateValue(linha, ['checkOutAt', 'exitAt', 'saidaEm', 'checkOut']);
                  const curso = resolveCourseValue(linha);
                  const semestre = resolveSemesterValue(linha) || '—';
                  const turno = resolveShiftValue(linha) || '—';
                  const metodoEntrada = resolveEntryMethod(linha);
                  const metodoSaida = resolveExitMethod(linha);
                  const fotoVinculada = resolvePhotoLinked(linha);

                  return (
                    <tr key={linha.id || idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 8px' }}>{curso}</td>
                      <td style={{ padding: '12px 8px' }}>{semestre}</td>
                      <td style={{ padding: '12px 8px' }}>{turno}</td>
                      <td style={{ padding: '12px 8px' }}>{linha.userName || linha.name || linha.nome || '—'}</td>
                      <td style={{ padding: '12px 8px' }}>{metodoEntrada}</td>
                      <td style={{ padding: '12px 8px' }}>{fotoVinculada}</td>
                      <td style={{ padding: '12px 8px' }}>{metodoSaida}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px' }}>
                        {entrada ? new Date(entrada).toLocaleString('pt-BR') : '—'}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '13px' }}>
                        {saida ? new Date(saida).toLocaleString('pt-BR') : '—'}
                      </td>
                      <td style={{ padding: '12px 8px' }}>{permanencia}</td>
                      <td style={{ padding: '12px 8px', color: valido ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                        {valido ? 'Valido' : 'Invalido'}
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{pontosFinais}</td>
                    </tr>
                  );
                })}
                {dadosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="12" style={{ textAlign: 'center', color: '#888', padding: '18px' }}>
                      Nenhum resultado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
