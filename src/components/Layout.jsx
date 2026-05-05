import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import logoFatexpo from '../imagens/Fatexpo-01.png';

const NAV_LINKS = [
  { path: '/eventos',              label: 'Eventos' },
  { path: '/expositores',          label: 'Expositores' },
  { path: '/palestras',            label: 'Palestras' },
  { path: '/estandes',             label: 'Estandes' },
  { path: '/reconhecimento-facial',label: 'Biometria' },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="header">
        <div className="header-content">
          {/* Logo / título da aplicação */}

          <img 
            src={logoFatexpo} 
            alt="FatecWeek" 
            className="logo-principal" 
            onClick={() => navigate('/eventos')} 
            // Forçando a largura para 200 pixels para ter certeza que ela vai aparecer
            style={{ cursor: 'pointer', width: '200px', height: 'auto', display: 'block' }} 
          />


          <div className="header-buttons">
            {NAV_LINKS.map(({ path, label }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="btn btn-secondary btn-header"
                style={{
                  background: pathname === path ? '#c41e3a' : undefined,
                  color: pathname === path ? 'white' : undefined,
                }}
              >
                {label}
              </button>
            ))}
            <button className="btn btn-header" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1 }}>
        {children}
      </main>

      <footer className="footer">
        <p>FatecWeek — Sistema de Gerenciamento de Eventos</p>
        <p>© {new Date().getFullYear()} Centro Paula Souza</p>
      </footer>
    </div>
  );
}
