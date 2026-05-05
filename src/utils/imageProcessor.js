export const processFaceImage = (fileOrBlob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Validação estrita da documentação: mínima de 100x100
        if (img.width < 100 || img.height < 100) {
          reject(new Error("A imagem deve ter no mínimo 100x100 pixels."));
          return;
        }
        
        // Pega apenas a string base64, removendo o prefixo "data:image/jpeg;base64,"
        const base64String = event.target.result.split(',')[1];
        resolve(base64String);
      };
      img.src = event.target.result;
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(fileOrBlob); // Converte para Base64
  });
};