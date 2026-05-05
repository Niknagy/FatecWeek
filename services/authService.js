import api from '../api';

export const authService = {
  async login(email, password) {
    // /connect/token usa application/x-www-form-urlencoded (padrão OAuth2/OIDC)
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', email);
    params.append('password', password);

    const response = await api.post('/connect/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const token = response.data.access_token;
    localStorage.setItem('@App:token', token);
    return response.data;
  },

  logout() {
    localStorage.removeItem('@App:token');
  },

  getToken() {
    return localStorage.getItem('@App:token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
