import { useEffect, useState, useCallback } from 'react';
import { boothService }    from '../services/boothService';
import { eventService }    from '../services/eventService';
import { exhibitorService } from '../services/exhibitorService';

const inputStyle = {
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
};

export default function EstandesPage() {
  const [eventos,           setEventos]           = useState([]);
  const [eventoSelecionado, setEventoSelecionado] = useState('');
  const [expositores,       setExpositores]       = useState([]);
  const [estandes,          setEstandes]          = useState([]);
  const [loading,           setLoading]           = useState(false);

  const [name,                 setName]                 = useState('');
  const [location,             setLocation]             = useState('');
  const [estandeParaAtribuir,  setEstandeParaAtribuir]  = useState('');
  const [expositorParaAtribuir,setExpositorParaAtribuir] = useState('');

  // Carrega estandes do evento selecionado — GET /api/booths?eventId=...
  const carregarEstandes = useCallback(async () => {
    if (!eventoSelecionado) return;
    try {
      setLoading(true);
      const data = await boothService.listByEvent(eventoSelecionado);
      const lista = data.items || data;
      setEstandes(lista);
      if (lista.length > 0) setEstandeParaAtribuir(lista[0].id);
    } catch (error) {
      console.error('Erro ao buscar estandes:', error);
    } finally {
      setLoading(false);
    }
  }, [eventoSelecionado]);

  const carregarDadosBase = useCallback(async () => {
    try {
      const evData  = await eventService.list();
      const eventos = evData.items || evData;
      setEventos(eventos);
      if (eventos.length > 0) setEventoSelecionado(eventos[0].id);

      const expData    = await exhibitorService.list();
      const expositores = expData.items || expData;
      setExpositores(expositores);
      if (expositores.length > 0) setExpositorParaAtribuir(expositores[0].id);
    } catch (error) {
      console.error('Erro nos dados base:', error);
    }
  }, []);

  useEffect(() => { carregarDadosBase(); }, [carregarDadosBase]);
  useEffect(() => { carregarEstandes();  }, [carregarEstandes]);

  const handleCriarEstande = async (e) => {
    e.preventDefault();
    try {
      await boothService.create({ eventId: eventoSelecionado, name, location });
      alert('Estande criado com sucesso!');
      carregarEstandes();
      setName(''); setLocation('');
    } catch (error) {
      console.error(error);
      alert('Falha ao criar estande.');
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Excluir este estande?')) return;
    try {
      await boothService.delete(id);
      carregarEstandes();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir o estande.');
    }
  };

  // POST /api/booths/{boothId}/exhibitors — corpo: "guid-do-expositor" (string JSON)
  const handleAtribuir = async (e) => {
    e.preventDefault();
    try {
      await boothService.assignExhibitor(estandeParaAtribuir, expositorParaAtribuir);
      alert('Expositor vinculado com sucesso!');
      carregarEstandes();
    } catch (error) {
      console.error(error);
      alert('Erro ao vincular expositor.');
    }
  };

  // DELETE /api/booths/{boothId}/exhibitors/{exhibitorId}
  const handleRemoverExpositor = async (boothId, exhibitorId) => {
    try {
      await boothService.removeExhibitor(boothId, exhibitorId);
      carregarEstandes();
    } catch (error) {
      console.error(error);
      alert('Erro ao remover expositor do estande.');
    }
  };

  return (
    <>
      <h2 style={{ color: '#c41e3a', marginBottom: '25px', fontSize: '26px' }}>
        Gerenciamento de Estandes
      </h2>

      {/* Seletor de evento */}
      <div className="card" style={{ padding: '20px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '12px', color: '#555' }}>Evento:</label>
        <select
          value={eventoSelecionado}
          onChange={e => setEventoSelecionado(e.target.value)}
          style={{ ...inputStyle, width: '320px' }}
        >
          {eventos.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
      </div>

      {/* Cards de criação e vinculação */}
      <div className="info-grid">
        {/* Criar estande */}
        <div className="card info-card" style={{ textAlign: 'left' }}>
          <h3 style={{ color: '#c41e3a', marginBottom: '18px' }}>Cadastrar Novo Estande</h3>
          <form onSubmit={handleCriarEstande} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input placeholder="Identificação (ex.: Estande 12)" value={name}     onChange={e => setName(e.target.value)}     required style={inputStyle} />
            <input placeholder="Localização (ex.: Pavilhão A)"   value={location} onChange={e => setLocation(e.target.value)} required style={inputStyle} />
            <button type="submit" className="btn" style={{ width: '100%' }}>Criar Estande</button>
          </form>
        </div>

        {/* Vincular expositor */}
        <div className="card info-card" style={{ textAlign: 'left', borderTop: '4px solid #c41e3a' }}>
          <h3 style={{ color: '#c41e3a', marginBottom: '18px' }}>Vincular Empresa ao Estande</h3>
          <form onSubmit={handleAtribuir} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <select value={estandeParaAtribuir} onChange={e => setEstandeParaAtribuir(e.target.value)} required style={inputStyle}>
              <option value="">— Selecione o Estande —</option>
              {estandes.map(est => (
                <option key={est.id} value={est.id}>{est.name} ({est.location})</option>
              ))}
            </select>
            <select value={expositorParaAtribuir} onChange={e => setExpositorParaAtribuir(e.target.value)} required style={inputStyle}>
              <option value="">— Selecione a Empresa —</option>
              {expositores.map(exp => (
                <option key={exp.id} value={exp.id}>{exp.name}</option>
              ))}
            </select>
            <button type="submit" className="btn" style={{ width: '100%' }}>Vincular</button>
          </form>
        </div>
      </div>

      {/* Mapa de estandes */}
      <div className="card">
        <h3 style={{ color: '#c41e3a', marginBottom: '18px' }}>Mapa de Estandes</h3>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Carregando...</p>
        ) : estandes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Nenhum estande cadastrado para este evento.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #c41e3a' }}>
                  {['Estande', 'Localização', 'Empresas Vinculadas', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '10px 8px', color: '#c41e3a', fontWeight: 'bold' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {estandes.map(est => (
                  <tr key={est.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{est.name}</td>
                    <td style={{ padding: '12px 8px' }}>{est.location}</td>
                    <td style={{ padding: '12px 8px' }}>
                      {est.exhibitors && est.exhibitors.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: '18px' }}>
                          {est.exhibitors.map(exp => (
                            <li key={exp.id} style={{ marginBottom: '4px' }}>
                              {exp.name}
                              <button
                                onClick={() => handleRemoverExpositor(est.id, exp.id)}
                                style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', marginLeft: '6px', fontWeight: 'bold' }}
                                title="Remover empresa"
                              >
                                ✕
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ color: '#aaa', fontStyle: 'italic' }}>Vazio</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <button
                        onClick={() => handleDeletar(est.id)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '13px', color: '#dc3545', borderColor: '#dc3545' }}
                      >
                        Excluir
                      </button>
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
