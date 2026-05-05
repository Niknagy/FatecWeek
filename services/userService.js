import api from '../api'; // Importa a configuração do Axios com Interceptors

export const userService = {
  // Criação exige validação dos campos obrigatórios no cliente (Regra de Boas Práticas)
  create: async (userData) => {
    const requiredFields = ['userName', 'email', 'password', 'name', 'cpf'];
    const missing = requiredFields.filter(field => !userData[field]);
    if (missing.length > 0) throw new Error(`Campos obrigatórios faltando: ${missing.join(', ')}`);
    
    const response = await api.post('/api/users', userData);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    // Aviso da documentação: Exclusão irreversível
    const confirm = window.confirm("Atenção: A exclusão de um usuário é permanente. Deseja continuar?");
    if (!confirm) return;
    
    const response = await api.delete(`/api/users/${id}`);
    return response.status === 204; 
  }
};