import { useEffect, useState, useCallback } from 'react';
import { lectureService } from '../services/lectureService';
import { eventService }   from '../services/eventService';

const inputStyle = {
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
};

export default function PalestrasPage() {
  const [eventos,           setEventos]           = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState('');
  const [palestras,         setPalestras]         = useState([]);
  const [loading,           setLoading]           = useState(false);

  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [speaker,     setSpeaker]     = useState('');
  const [startTime,   setStartTime]   = useState('');
  const [endTime,     setEndTime]     = useState('');
  const [room,        setRoom]        = useState('');

  const carregarEventos = useCallback(async () => {
    try {
      const data = await eventService.list();
      const lista = data.items || data;
      setEventos(lista);
      if (lista.length > 0) setEventoSelecionado(lista[0].id);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  }, []);

  // GET /api/lectures?eventId=... conforme documentação
  const carregarPalestras = useCallback(async () => {
    if (!eventoSelecionado) return;
    try {
      setLoading(true);
      const data = await lectureService.listByEvent(eventoSelecionado);
      setPalestras(data.items || data);
    } catch (error) {
      console.error('Erro ao carregar palestras:', error);
    } finally {
      setLoading(false);
    }
  }, [eventoSelecionado]);

  useEffect(() => { carregarEventos(); },  [carregarEventos]);
  useEffect(() => { carregarPalestras(); }, [carregarPalestras]);

  const handleCriarPalestra = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        eventId:     eventoSelecionado,
        title,
        description,
        speaker,
        room,
        startTime:   new Date(startTime).toISOString(),
        endTime:     new Date(endTime).toISOString(),
      };
      await lectureService.create(payload);
      alert('Palestra cadastrada!');
      carregarPalestras();
      setTitle(''); setDescription(''); setSpeaker(''); setStartTime(''); setEndTime(''); setRoom('');
    } catch (error) {
      console.error(error);
      alert('Erro ao cadastrar palestra.');
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Excluir esta palestra?')) return;
    try {
      await lectureService.delete(id);
      setPalestras(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir palestra.');
    }
  };

  return (
    <>
      <h2 style={{ color: '#c41e3a', marginBottom: '25px', fontSize: '26px' }}>
        Gerenciamento de Palestras
      </h2>

      {/* Seletor de evento */}
      <div className="card" style={{ padding: '20px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '12px', color: '#555' }}>Evento:</label>
        <select
          value={eventoSelecionado}
          onChange={e => setEventoSelecionado(e.target.value)}
          style={{ ...inputStyle, width: '320px' }}
        >
          {eventos.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.name}</option>
          ))}
        </select>
      </div>

      {/* Formulário de criação */}
      <div className="card">
        <h3 style={{ color: '#c41e3a', marginBottom: '18px' }}>Cadastrar Nova Palestra</h3>
        <form onSubmit={handleCriarPalestra} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input placeholder="Título da Palestra" value={title}       onChange={e => setTitle(e.target.value)}       required style={{ ...inputStyle, flex: '2 1 240px' }} />
          <input placeholder="Palestrante"        value={speaker}     onChange={e => setSpeaker(e.target.value)}     required style={{ ...inputStyle, flex: '1 1 180px' }} />
          <input placeholder="Sala / Auditório"   value={room}        onChange={e => setRoom(e.target.value)}        required style={{ ...inputStyle, flex: '1 1 140px' }} />
          <input placeholder="Descrição"          value={description} onChange={e => setDescription(e.target.value)} required style={{ ...inputStyle, flex: '3 1 100%' }} />

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: '2 1 360px', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Início:</label>
            <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required style={inputStyle} />
            <label style={{ fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Fim:</label>
            <input type="datetime-local" value={endTime}   onChange={e => setEndTime(e.target.value)}   required style={inputStyle} />
          </div>

          <div style={{ width: '100%' }}>
            <button type="submit" className="btn">Cadastrar Palestra</button>
          </div>
        </form>
      </div>

      {/* Tabela de palestras */}
      <div className="card">
        <h3 style={{ color: '#c41e3a', marginBottom: '18px' }}>Agenda de Palestras do Evento</h3>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Carregando palestras...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #c41e3a' }}>
                  {['Horário', 'Título / Descrição', 'Palestrante', 'Sala', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '10px 8px', color: '#c41e3a', fontWeight: 'bold' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {palestras.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Nenhuma palestra agendada para este evento.</td></tr>
                ) : (
                  palestras.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 8px', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {new Date(p.startTime).toLocaleString('pt-BR')}
                        <br />
                        <small style={{ color: '#888' }}>até {new Date(p.endTime).toLocaleTimeString('pt-BR')}</small>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <strong>{p.title}</strong><br />
                        <small style={{ color: '#666' }}>{p.description}</small>
                      </td>
                      <td style={{ padding: '12px 8px' }}>{p.speaker}</td>
                      <td style={{ padding: '12px 8px' }}>{p.room}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <button
                          onClick={() => handleDeletar(p.id)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '13px', color: '#dc3545', borderColor: '#dc3545' }}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
