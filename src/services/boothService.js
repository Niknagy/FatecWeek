import api from '../api';

export const boothService = {
  async list(params = {}) {
    const response = await api.get('/api/booths', { params });
    return response.data;
  },

  // GET /api/booths?eventId=... conforme documentação
  async listByEvent(eventId) {
    const response = await api.get('/api/booths', { params: { eventId } });
    return response.data;
  },

  async get(id) {
    const response = await api.get(`/api/booths/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/api/booths', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/api/booths/${id}`, data);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/api/booths/${id}`);
    return true;
  },

  // Corpo: "guid-do-expositor" (string JSON pura, conforme documentação)
  async assignExhibitor(boothId, exhibitorId) {
    const response = await api.post(
      `/api/booths/${boothId}/exhibitors`,
      JSON.stringify(exhibitorId),
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  },

  // DELETE /api/booths/{boothId}/exhibitors/{exhibitorId}
  async removeExhibitor(boothId, exhibitorId) {
    await api.delete(`/api/booths/${boothId}/exhibitors/${exhibitorId}`);
    return true;
  },
};
