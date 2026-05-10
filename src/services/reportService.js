import api from '../api';

function extractList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.results)) return payload.results;
  if (payload.data && Array.isArray(payload.data.items)) return payload.data.items;
  return [];
}

async function tryEndpoints(eventId) {
  const endpoints = [
    { url: '/relatorio/academico', params: { evento_id: eventId } },
    { url: '/api/reports/attendance', params: { eventId } },
    { url: '/api/reports', params: { eventId } },
    { url: `/api/events/${eventId}/report` },
    { url: '/api/attendances', params: { eventId } },
    { url: '/api/check-ins', params: { eventId } },
    { url: '/api/facial/check-in', params: { eventId } },
  ];

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint.url, { params: endpoint.params });
      const lista = extractList(response.data);
      if (lista.length > 0) {
        return lista;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Nao foi possivel carregar relatorio.');
}

function flattenAcademicReport(payload) {
  if (!payload || typeof payload !== 'object') return [];
  const grupos = payload.grupos || payload.Grupos;
  if (!grupos || typeof grupos !== 'object') return [];

  const rows = [];
  Object.values(grupos).forEach((items) => {
    if (!Array.isArray(items)) return;
    items.forEach((item) => {
      rows.push({
        ...item,
        name: item.name || item.nome || item.nomeCompleto || item.NomeCompleto,
        userName: item.userName || item.nomeCompleto || item.NomeCompleto,
        course: item.course || item.curso || item.Curso,
        semester: item.semester ?? item.semestre ?? item.Semestre,
        shift: item.shift || item.turno || item.Turno,
        stayMinutes: item.stayMinutes ?? item.tempoPermanenciaMinutos ?? item.TempoPermanenciaMinutos,
        totalPoints: item.totalPoints ?? item.pontuacao ?? item.Pontuacao,
        isValid: item.isValid ?? item.presencaValida ?? item.PresencaValida,
      });
    });
  });

  return rows;
}

export const reportService = {
  async getAttendanceByEvent(eventId) {
    const data = await tryEndpoints(eventId);
    const academic = flattenAcademicReport(data);
    return academic.length > 0 ? academic : data;
  },
};
