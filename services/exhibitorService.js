import api from '../api';

export const exhibitorService = {
  async list(params = {}) {
    const response = await api.get('/api/exhibitors', { params });
    return response.data;
  },

  async get(id) {
    const response = await api.get(`/api/exhibitors/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/api/exhibitors', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/api/exhibitors/${id}`, data);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/api/exhibitors/${id}`);
    return true;
  },
};
