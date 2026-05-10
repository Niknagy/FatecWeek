import api from '../api';

function normalizeLecture(item = {}) {
  return {
    ...item,
    id: item.id,
    eventId: item.eventId ?? item.eventoId,
    eventoId: item.eventoId ?? item.eventId,
    title: item.title || item.titulo || '',
    titulo: item.titulo || item.title || '',
    description: item.description || item.descricao || '',
    descricao: item.descricao || item.description || '',
    speaker: item.speaker || item.palestrante || '',
    palestrante: item.palestrante || item.speaker || '',
    room: item.room || item.sala || '',
    sala: item.sala || item.room || '',
    startTime: item.startTime || item.inicio || '',
    endTime: item.endTime || item.fim || '',
    minimumStayMinutes: item.minimumStayMinutes ?? item.tempoMinimoMinutos ?? 0,
    tempoMinimoMinutos: item.tempoMinimoMinutos ?? item.minimumStayMinutes ?? 0,
    scoreValue: item.scoreValue ?? item.pontuacao ?? 0,
    pontuacao: item.pontuacao ?? item.scoreValue ?? 0,
  };
}

async function tryGet(path, params) {
  const response = await api.get(path, params ? { params } : undefined);
  return response.data;
}

async function tryMutate(method, path, data) {
  const response = await api[method](path, data);
  return response.data;
}

export const lectureService = {
  async list(params = {}) {
    const attempts = [
      () => tryGet('/palestras', params),
      () => tryGet('/lectures', params),
      () => tryGet('/api/lectures', params),
    ];

    for (const attempt of attempts) {
      try {
        const data = await attempt();
        const lista = Array.isArray(data) ? data : data?.items || [];
        return lista.map(normalizeLecture);
      } catch {
        // tenta o proximo endpoint
      }
    }
    return [];
  },

  async listByEvent(eventId) {
    const attempts = [
      () => tryGet('/palestras', { eventoId: eventId }),
      () => tryGet('/lectures', { eventId }),
      () => tryGet('/api/lectures', { eventId }),
    ];

    for (const attempt of attempts) {
      try {
        const data = await attempt();
        const lista = Array.isArray(data) ? data : data?.items || [];
        return lista.map(normalizeLecture);
      } catch {
        // tenta o proximo endpoint
      }
    }
    return [];
  },

  async get(id) {
    const attempts = [
      () => tryGet(`/palestras/${id}`),
      () => tryGet(`/lectures/${id}`),
      () => tryGet(`/api/lectures/${id}`),
    ];

    for (const attempt of attempts) {
      try {
        const data = await attempt();
        return normalizeLecture(data || {});
      } catch {
        // tenta o proximo endpoint
      }
    }
    throw new Error('Nao foi possivel buscar a palestra.');
  },

  async create(data) {
    const payloadPt = {
      eventoId: data.eventoId ?? data.eventId,
      titulo: data.titulo || data.title,
      descricao: data.descricao || data.description,
      palestrante: data.palestrante || data.speaker,
      sala: data.sala || data.room,
      inicio: data.inicio || data.startTime,
      fim: data.fim || data.endTime,
      tempoMinimoMinutos: data.tempoMinimoMinutos ?? data.minimumStayMinutes ?? 0,
      pontuacao: data.pontuacao ?? data.scoreValue ?? 0,
    };
    const attempts = [
      () => tryMutate('post', '/palestras', payloadPt),
      () => tryMutate('post', '/lectures', data),
      () => tryMutate('post', '/api/lectures', data),
    ];

    for (const attempt of attempts) {
      try {
        const result = await attempt();
        return normalizeLecture(result || {});
      } catch {
        // tenta o proximo endpoint
      }
    }
    throw new Error('Nao foi possivel criar a palestra.');
  },

  async update(id, data) {
    const payloadPt = {
      eventoId: data.eventoId ?? data.eventId,
      titulo: data.titulo || data.title,
      descricao: data.descricao || data.description,
      palestrante: data.palestrante || data.speaker,
      sala: data.sala || data.room,
      inicio: data.inicio || data.startTime,
      fim: data.fim || data.endTime,
      tempoMinimoMinutos: data.tempoMinimoMinutos ?? data.minimumStayMinutes ?? 0,
      pontuacao: data.pontuacao ?? data.scoreValue ?? 0,
    };
    const attempts = [
      () => tryMutate('put', `/palestras/${id}`, payloadPt),
      () => tryMutate('put', `/lectures/${id}`, data),
      () => tryMutate('put', `/api/lectures/${id}`, data),
    ];

    for (const attempt of attempts) {
      try {
        const result = await attempt();
        return normalizeLecture(result || {});
      } catch {
        // tenta o proximo endpoint
      }
    }
    throw new Error('Nao foi possivel atualizar a palestra.');
  },

  async delete(id) {
    const attempts = [
      () => api.delete(`/palestras/${id}`),
      () => api.delete(`/lectures/${id}`),
      () => api.delete(`/api/lectures/${id}`),
    ];

    for (const attempt of attempts) {
      try {
        await attempt();
        return true;
      } catch {
        // tenta o proximo endpoint
      }
    }
    throw new Error('Nao foi possivel excluir a palestra.');
  },
};
