import { useEffect, useState, useCallback } from 'react';
import { eventService } from '../services/eventService';

const STATUS_COLORS = {
  Draft:     '#ffc107',
  Published: '#28a745',
  Closed:    '#6c757d',
  Cancelled: '#dc3545',
};

const inputStyle = {
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
};

export default function EventosPage() {
  const [eventos, setEventos]   = useState([]);
  const [loading, setLoading]   = useState(true);

  // Campos do formulário de criação
  const [nome,       setNome]       = useState('');
  const [descricao,  setDescricao]  = useState('');
  const [local,      setLocal]      = useState('');
  const [startDate,  setStartDate]  = useState('');
  const [endDate,    setEndDate]    = useState('');

  const carregarEventos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await eventService.list({ page: 1, pageSize: 20 });
      setEventos(data.items || data);
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
        name:        nome,
        description: descricao,
        location:    local,
        startDate:   new Date(startDate).toISOString(),
        endDate:     new Date(endDate).toISOString(),
      });
      alert('Evento criado como Draft!');
      carregarEventos();
      setNome(''); setDescricao(''); setLocal(''); setStartDate(''); setEndDate('');
    } catch (error) {
      console.error(error);
      alert('Erro ao criar evento.');
    }
  };

  const handlePublicar = async (id) => {
    try {
      await eventService.publish(id);
      carregarEventos();
    } catch (error) {
      console.error(error);
      alert('Erro ao publicar evento.');
    }
  };

  const handleEncerrar = async (id) => {
    if (!window.confirm('Encerrar este evento?')) return;
    try {
      await eventService.close(id);
      carregarEventos();
    } catch (error) {
      console.error(error);
      alert('Erro ao encerrar evento.');
    }
  };

  // Apenas eventos em Draft podem ser excluídos (regra da API)
  const handleDeletar = async (id) => {
    if (!window.confirm('Excluir este evento? Esta ação é irreversível.')) return;
    try {
      await eventService.delete(id);
      carregarEventos();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir. Apenas eventos em Draft podem ser excluídos.');
    }
  };

  return (
    <>
      <h2 style={{ color: '#c41e3a', marginBottom: '25px', fontSize: '26px' }}>
        Gerenciamento de Eventos
      </h2>

      {/* Formulário de criação */}
      <div className="card">
        <h3 style={{ color: '#c41e3a', marginBottom: '18px' }}>Criar Novo Evento</h3>
        <form onSubmit={handleCriarEvento} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            placeholder="Nome do Evento" value={nome}
            onChange={e => setNome(e.target.value)} required
            style={{ ...inputStyle, flex: '1 1 200px' }}
          />
          <input
            placeholder="Descrição" value={descricao}
            onChange={e => setDescricao(e.target.value)} required
            style={{ ...inputStyle, flex: '2 1 300px' }}
          />
          <input
            placeholder="Local" value={local}
            onChange={e => setLocal(e.target.value)} required
            style={{ ...inputStyle, flex: '1 1 180px' }}
          />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '2 1 340px', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Início:</label>
            <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required style={inputStyle} />
            <label style={{ fontWeight: 'bold', color: '#555', fontSize: '14px' }}>Fim:</label>
            <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ width: '100%' }}>
            <button type="submit" className="btn">Criar Evento (Draft)</button>
          </div>
        </form>
      </div>

      {/* Tabela de eventos */}
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
                  {['Nome / Descrição', 'Local', 'Início', 'Status', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '10px 8px', color: '#c41e3a', fontWeight: 'bold' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eventos.map(ev => (
                  <tr key={ev.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <strong>{ev.name}</strong><br />
                      <small style={{ color: '#666' }}>{ev.description}</small>
                    </td>
                    <td style={{ padding: '12px 8px' }}>{ev.location}</td>
                    <td style={{ padding: '12px 8px', fontSize: '13px' }}>
                      {ev.startDate ? new Date(ev.startDate).toLocaleString('pt-BR') : '—'}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        background: STATUS_COLORS[ev.status] || '#aaa',
                        color: ev.status === 'Draft' ? '#333' : 'white',
                        padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                      }}>
                        {ev.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {ev.status === 'Draft' && (
                          <>
                            <button onClick={() => handlePublicar(ev.id)} className="btn" style={{ padding: '6px 12px', fontSize: '13px' }}>
                              Publicar
                            </button>
                            <button
                              onClick={() => handleDeletar(ev.id)}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '13px', color: '#dc3545', borderColor: '#dc3545' }}
                            >
                              Excluir
                            </button>
                          </>
                        )}
                        {ev.status === 'Published' && (
                          <button onClick={() => handleEncerrar(ev.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                            Encerrar
                          </button>
                        )}
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
