import { useEffect, useState, useCallback } from 'react';
import { exhibitorService } from '../services/exhibitorService';

const inputStyle = {
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
  flex: '1 1 160px',
};

export default function ExpositoresPage() {
  const [expositores, setExpositores] = useState([]);
  const [loading, setLoading]         = useState(true);

  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [phone,   setPhone]   = useState('');
  const [website, setWebsite] = useState('');

  const carregarExpositores = useCallback(async () => {
    try {
      setLoading(true);
      const data = await exhibitorService.list();
      setExpositores(data.items || data);
    } catch (error) {
      console.error('Erro ao carregar expositores:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarExpositores(); }, [carregarExpositores]);

  const handleCriarExpositor = async (e) => {
    e.preventDefault();
    try {
      await exhibitorService.create({ name, email, phone, website });
      alert('Expositor cadastrado com sucesso!');
      carregarExpositores();
      setName(''); setEmail(''); setPhone(''); setWebsite('');
    } catch (error) {
      console.error('Erro ao criar:', error);
      alert(`Erro ao cadastrar: ${error.response?.data?.message || 'Verifique os dados.'}`);
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Excluir este expositor?')) return;
    try {
      await exhibitorService.delete(id);
      carregarExpositores();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('Erro ao excluir o expositor.');
    }
  };

  return (
    <>
      <h2 style={{ color: '#c41e3a', marginBottom: '25px', fontSize: '26px' }}>
        Gerenciamento de Expositores
      </h2>

      {/* Formulário de cadastro */}
      <div className="card">
        <h3 style={{ color: '#c41e3a', marginBottom: '18px' }}>Cadastrar Nova Empresa</h3>
        <form onSubmit={handleCriarExpositor} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input placeholder="Nome da Empresa" value={name}    onChange={e => setName(e.target.value)}    required style={inputStyle} />
          <input placeholder="Email"            value={email}   onChange={e => setEmail(e.target.value)}   required type="email" style={inputStyle} />
          <input placeholder="Telefone"         value={phone}   onChange={e => setPhone(e.target.value)}   required style={inputStyle} />
          <input placeholder="Website (opcional)" value={website} onChange={e => setWebsite(e.target.value)} style={inputStyle} />
          <div style={{ width: '100%' }}>
            <button type="submit" className="btn">Cadastrar Expositor</button>
          </div>
        </form>
      </div>

      {/* Tabela */}
      <div className="card">
        <h3 style={{ color: '#c41e3a', marginBottom: '18px' }}>Empresas Cadastradas</h3>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Carregando...</p>
        ) : expositores.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>Nenhum expositor cadastrado.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #c41e3a' }}>
                  {['Empresa', 'Email', 'Telefone', 'Site', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '10px 8px', color: '#c41e3a', fontWeight: 'bold' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expositores.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{exp.name}</td>
                    <td style={{ padding: '12px 8px' }}>{exp.email}</td>
                    <td style={{ padding: '12px 8px' }}>{exp.phone}</td>
                    <td style={{ padding: '12px 8px' }}>
                      {exp.website
                        ? <a href={exp.website} target="_blank" rel="noreferrer" style={{ color: '#c41e3a' }}>{exp.website}</a>
                        : '—'}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <button
                        onClick={() => handleDeletar(exp.id)}
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
