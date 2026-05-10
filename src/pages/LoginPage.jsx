import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import logoFatexpo from '../imagens/Fatexpo-01.png';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.login(email, password);
      navigate('/eventos');
    } catch {
      setError('Falha ao autenticar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSemSenha = () => {
    const now = Math.floor(Date.now() / 1000);

    const header = { alg: 'none', typ: 'JWT' };
    const payload = {
      sub: 'dev-user',
      email: email || 'dev@fatecweek.local',
      permission: [
        'Events:Manage',
        'Exhibitors:Manage',
        'Lectures:Manage',
        'Booths:Manage',
      ],
      iat: now,
      exp: now + 60 * 60 * 24,
    };

    const encodeBase64Url = (obj) =>
      btoa(JSON.stringify(obj))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    const fakeToken = `${encodeBase64Url(header)}.${encodeBase64Url(payload)}.`;
    localStorage.setItem('@App:token', fakeToken);
    navigate('/eventos');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      <header className="header">
        <div className="header-content" style={{ justifyContent: 'center' }}>

          <img 
            src={logoFatexpo} 
            alt="FatecWeek" 
            className="logo-principal" 
            onClick={() => navigate('/eventos')} 
            // Forçando a largura para 200 pixels para ter certeza que ela vai aparecer
            style={{ cursor: 'pointer', width: '200px', height: 'auto', display: 'block' }} 
          />
          
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
          <div className="sobre">
            <h2>Acesso ao Sistema</h2>
          </div>

          {error && (
            <p style={{ color: '#c41e3a', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#555' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#555' }}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn"
              style={{ width: '100%', opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleLoginSemSenha}
              style={{ width: '100%' }}
            >
              Entrar sem senha (temporario)
            </button>
          </form>
        </div>
      </div>

      <footer className="footer">
        <p>© {new Date().getFullYear()} FatecWeek — Centro Paula Souza</p>
      </footer>
    </div>
  );
}
