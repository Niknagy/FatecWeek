import api from '../api';

function normalizeExhibitor(item = {}) {
  return {
    ...item,
    id: item.id,
    name: item.name || item.nome || item.nomeEmpresa || '',
    nome: item.nome || item.name || item.nomeEmpresa || '',
    nomeEmpresa: item.nomeEmpresa || item.nome || item.name || '',
    description: item.description || item.descricao || '',
    descricao: item.descricao || item.description || '',
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

export const exhibitorService = {
  async list(params = {}) {
    const attempts = [
      () => tryGet('/expositores', params),
      () => tryGet('/exhibitors', params),
      () => tryGet('/api/exhibitors', params),
    ];

    for (const attempt of attempts) {
      try {
        const data = await attempt();
        const lista = Array.isArray(data) ? data : data?.items || [];
        return lista.map(normalizeExhibitor);
      } catch {
        // tenta o proximo endpoint
      }
    }
    return [];
  },

  async get(id) {
    const attempts = [
      () => tryGet(`/expositores/${id}`),
      () => tryGet(`/exhibitors/${id}`),
      () => tryGet(`/api/exhibitors/${id}`),
    ];

    for (const attempt of attempts) {
      try {
        const data = await attempt();
        return normalizeExhibitor(data || {});
      } catch {
        // tenta o proximo endpoint
      }
    }
    throw new Error('Nao foi possivel buscar o expositor.');
  },

  async create(data) {
    const payloadPt = {
      nomeEmpresa: data.nomeEmpresa || data.nome || data.name,
      descricao: data.descricao || data.description,
      ...data,
    };
    const attempts = [
      () => tryMutate('post', '/expositores', payloadPt),
      () => tryMutate('post', '/exhibitors', data),
      () => tryMutate('post', '/api/exhibitors', data),
    ];

    for (const attempt of attempts) {
      try {
        const result = await attempt();
        return normalizeExhibitor(result || {});
      } catch {
        // tenta o proximo endpoint
      }
    }
    throw new Error('Nao foi possivel criar o expositor.');
  },

  async update(id, data) {
    const payloadPt = {
      nomeEmpresa: data.nomeEmpresa || data.nome || data.name,
      descricao: data.descricao || data.description,
      ...data,
    };
    const attempts = [
      () => tryMutate('put', `/expositores/${id}`, payloadPt),
      () => tryMutate('put', `/exhibitors/${id}`, data),
      () => tryMutate('put', `/api/exhibitors/${id}`, data),
    ];

    for (const attempt of attempts) {
      try {
        const result = await attempt();
        return normalizeExhibitor(result || {});
      } catch {
        // tenta o proximo endpoint
      }
    }
    throw new Error('Nao foi possivel atualizar o expositor.');
  },

  async delete(id) {
    const attempts = [
      () => api.delete(`/expositores/${id}`),
      () => api.delete(`/exhibitors/${id}`),
      () => api.delete(`/api/exhibitors/${id}`),
    ];

    for (const attempt of attempts) {
      try {
        await attempt();
        return true;
      } catch {
        // tenta o proximo endpoint
      }
    }
    throw new Error('Nao foi possivel excluir o expositor.');
  },
};
