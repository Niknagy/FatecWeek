import api from '../api';

export const lectureService = {
  async list(params = {}) {
    const response = await api.get('/api/lectures', { params });
    return response.data;
  },

  // GET /api/lectures?eventId=... conforme documentação
  async listByEvent(eventId) {
    const response = await api.get('/api/lectures', { params: { eventId } });
    return response.data;
  },

  async get(id) {
    const response = await api.get(`/api/lectures/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/api/lectures', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/api/lectures/${id}`, data);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/api/lectures/${id}`);
    return true;
  },
};
