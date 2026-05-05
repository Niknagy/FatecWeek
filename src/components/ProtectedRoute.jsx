import { Navigate } from 'react-router-dom';

// Decodifica o payload do JWT sem biblioteca externa
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/**
 * Rota protegida.
 * - Sem token → redireciona para /login
 * - Com requiredPolicy → verifica o claim "permission" no JWT
 *   (pode ser string ou array, conforme exemplo do PDF)
 */
export function ProtectedRoute({ children, requiredPolicy }) {
  const token = localStorage.getItem('@App:token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPolicy) {
    const decoded = decodeToken(token);
    const raw = decoded?.permission ?? [];
    // permission pode vir como string simples ou array
    const permissions = Array.isArray(raw) ? raw : [raw];

    if (!permissions.includes(requiredPolicy)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
