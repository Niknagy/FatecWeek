import api from '../api';

// Converte Blob para string base64 (sem prefixo data:...)
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Falha ao converter imagem.'));
    reader.readAsDataURL(blob);
  });

// Valida resolução mínima de 100x100 pixels conforme documentação
const validateDimensions = (blob) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width < 100 || img.height < 100) {
        reject(new Error('Resolução mínima exigida: 100x100 pixels.'));
      } else {
        resolve();
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível carregar a imagem para validação.'));
    };
    img.src = url;
  });

export const facialService = {
  // POST /api/facial/identify — { image: "base64-encoded-image" }
  async identify(imageBlob) {
    await validateDimensions(imageBlob);
    const image = await blobToBase64(imageBlob);
    const response = await api.post('/api/facial/identify', { image });
    return response.data; // { success, userId, confidence, name }
  },

  // POST /api/facial/register — { userId, image: "base64-encoded-image" }
  async register(userId, imageBlob) {
    await validateDimensions(imageBlob);
    const image = await blobToBase64(imageBlob);
    const response = await api.post('/api/facial/register', { userId, image });
    return response.data; // { success, message, faceId }
  },

  // GET /api/facial/check-in
  async checkIn() {
    const response = await api.get('/api/facial/check-in');
    return response.data;
  },
};
