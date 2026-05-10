import { useEffect, useState, useCallback } from 'react';
import { eventService } from '../services/eventService';

const TIPOS = ['palestra', 'feira'];

const inputStyle = {
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
};

export default function EventosPage() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nomeEvento, setNomeEvento] = useState('');
  const [tipo, setTipo] = useState('palestra');
  const [data, setData] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [tempoMinimoMinutos, setTempoMinimoMinutos] = useState('');
  const [pontuacao, setPontuacao] = useState('');

  const carregarEventos = useCallback(async () => {
    try {
      setLoading(true);
      const lista = await eventService.list();
      setEventos(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarEventos(); }, [carregarEventos]);

  const handleCriarEvento = async (e) => {
    e.preventDefault();
    try {
      await eventService.create({
        nomeEvento,
        tipo,
        data,
        horaInicio,
        horaFim,
        tempoMinimoMinutos: tempoMinimoMinutos ? Number(tempoMinimoMinutos) : 0,
        pontuacao: pontuacao ? Number(pontuacao) : 0,
      });
      alert('Evento criado com sucesso!');
      carregarEventos();
      setNomeEvento('');
      setTipo('palestra');
      setData('');
      setHoraInicio('');
      setHoraFim('');
      setTempoMinimoMinutos('');
      setPontuacao('');
    } catch (error) {
      console.error(error);
      alert('Erro ao criar evento.');
    }
  };

  const handleEditar = async (evento) => {
    const novoNome = window.prompt('Nome do evento:', evento.nomeEvento || evento.name || '');
    if (novoNome === null) return;

    const novoTipo = window.prompt('Tipo (palestra/feira):', evento.tipo || 'palestra');
    if (novoTipo === null) return;

    const novaData = window.prompt('Data (yyyy-mm-dd):', evento.data || '');
    if (novaData === null) return;

    const novaHoraInicio = window.prompt('Hora inicio (HH:mm):', evento.horaInicio || '');
    if (novaHoraInicio === null) return;

    const novaHoraFim = window.prompt('Hora fim (HH:mm):', evento.horaFim || '');
    if (novaHoraFim === null) return;

    const novoTempoMinimo = window.prompt(
      'Tempo minimo (min):',
      String(evento.tempoMinimoMinutos ?? evento.minimumStayMinutes ?? 0)
    );
    if (novoTempoMinimo === null) return;

    const novaPontuacao = window.prompt(
      'Pontuacao:',
      String(evento.pontuacao ?? evento.scoreValue ?? 0)
    );
    if (novaPontuacao === null) return;

    try {
      await eventService.update(evento.id, {
        nomeEvento: novoNome,
        tipo: novoTipo,
        data: novaData,
        horaInicio: novaHoraInicio,
        horaFim: novaHoraFim,
        tempoMinimoMinutos: Number(novoTempoMinimo) || 0,
        pontuacao: Number(novaPontuacao) || 0,
      });
      carregarEventos();
    } catch (error) {
      console.error(error);
      alert('Erro ao editar evento.');
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Excluir este evento? Esta ação é irreversível.')) return;
    try {
      await eventService.delete(id);
      carregarEventos();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir evento.');
    }
  };

  return (
    <>
      <h2 style={{ color: '#c41e3a', marginBottom: '25px', fontSize: '26px' }}>
        Gerenciamento de Eventos
      </h2>

      <div className="card">
        <h3 style={{ color: '#c41e3a', marginBottom: '18px' }}>Criar Novo Evento</h3>
        <form onSubmit={handleCriarEvento} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            placeholder="Nome do Evento"
            value={nomeEvento}
            onChange={e => setNomeEvento(e.target.value)}
            required
            style={{ ...inputStyle, flex: '2 1 280px' }}
          />
          <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ ...inputStyle, flex: '1 1 160px' }}>
            {TIPOS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input type="date" value={data} onChange={e => setData(e.target.value)} required style={{ ...inputStyle, flex: '1 1 170px' }} />
          <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} required style={{ ...inputStyle, flex: '1 1 130px' }} />
          <input type="time" value={horaFim} onChange={e => setHoraFim(e.target.value)} required style={{ ...inputStyle, flex: '1 1 130px' }} />
          <input
            placeholder="Tempo mínimo (min)"
            type="number"
            min="0"
            value={tempoMinimoMinutos}
            onChange={e => setTempoMinimoMinutos(e.target.value)}
            style={{ ...inputStyle, flex: '1 1 180px' }}
          />
          <input
            placeholder="Pontuação"
            type="number"
            min="0"
            step="0.1"
            value={pontuacao}
            onChange={e => setPontuacao(e.target.value)}
            style={{ ...inputStyle, flex: '1 1 140px' }}
          />
          <div style={{ width: '100%' }}>
            <button type="submit" className="btn">Criar Evento</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ color: '#c41e3a', marginBottom: '18px' }}>Lista de Eventos</h3>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Carregando...</p>
        ) : eventos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Nenhum evento cadastrado.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #c41e3a' }}>
                  {['Nome', 'Tipo', 'Data', 'Início', 'Fim', 'Regra', 'Check-ins', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '10px 8px', color: '#c41e3a', fontWeight: 'bold' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eventos.map(ev => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 8px' }}><strong>{ev.nomeEvento || ev.name}</strong></td>
                    <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>{ev.tipo || '—'}</td>
                    <td style={{ padding: '12px 8px' }}>{ev.data || '—'}</td>
                    <td style={{ padding: '12px 8px' }}>{ev.horaInicio || '—'}</td>
                    <td style={{ padding: '12px 8px' }}>{ev.horaFim || '—'}</td>
                    <td style={{ padding: '12px 8px', fontSize: '13px' }}>
                      {`Min: ${ev.minimumStayMinutes ?? ev.tempoMinimoMinutos ?? 0} min | Pontos: ${ev.scoreValue ?? ev.pontuacao ?? 0}`}
                    </td>
                    <td style={{ padding: '12px 8px' }}>{ev.totalCheckins ?? 0}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleEditar(ev)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '13px' }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletar(ev.id)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '13px', color: '#dc3545', borderColor: '#dc3545' }}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
