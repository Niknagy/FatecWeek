import api from '../api';

export const eventService = {
  async list(params = {}) {
    const response = await api.get('/api/events', { params });
    return response.data;
  },

  async get(id) {
    const response = await api.get(`/api/events/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/api/events', data);
    return response.data;
  },

  // Apenas eventos em status Draft podem ser atualizados
  async update(id, data) {
    const response = await api.put(`/api/events/${id}`, { id, ...data });
    return response.data;
  },

  // Apenas eventos em status Draft podem ser excluídos
  async delete(id) {
    await api.delete(`/api/events/${id}`);
    return true;
  },

  async publish(id) {
    const response = await api.post(`/api/events/${id}/publish`);
    return response.data;
  },

  // reason é uma string simples enviada como JSON
  async cancel(id, reason) {
    const response = await api.post(`/api/events/${id}/cancel`, JSON.stringify(reason), {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  async close(id) {
    const response = await api.post(`/api/events/${id}/close`);
    return response.data;
  },
};
