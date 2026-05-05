import { useRef, useState, useEffect } from 'react';
import { facialService } from '../services/facialService';

export default function FacialPage() {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const [mensagem, setMensagem] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sucesso,  setSucesso]  = useState(false);

  // Inicia câmera ao montar a tela
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setMensagem('Erro ao acessar a câmera. Verifique as permissões do navegador.');
      }
    };
    startCamera();

    // Desliga a câmera ao desmontar
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleIdentificar = () => {
    setLoading(true);
    setMensagem('');
    setSucesso(false);

    const canvas = canvasRef.current;
    const video  = videoRef.current;

    // Captura frame atual do vídeo
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converte para blob e envia ao serviço
    // O facialService valida 100x100 mínimo e converte para base64 antes de enviar
    canvas.toBlob(async (blob) => {
      try {
        const resultado = await facialService.identify(blob);
        // Resposta: { success, userId, confidence, name }
        const confianca = (resultado.confidence * 100).toFixed(1);
        setMensagem(`Identificado: ${resultado.name} — Confiança: ${confianca}%`);
        setSucesso(true);
      } catch (error) {
        setMensagem(`Falha na identificação: ${error.message}`);
        setSucesso(false);
      } finally {
        setLoading(false);
      }
    }, 'image/jpeg');
  };

  return (
    <>
      <h2 style={{ color: '#c41e3a', marginBottom: '25px', fontSize: '26px' }}>
        Catraca / Ponto Eletrônico — Biometria Facial
      </h2>

      <div className="card" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        {/* Preview da câmera */}
        <div style={{ marginBottom: '20px' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              maxWidth: '480px',
              border: '3px solid #c41e3a',
              borderRadius: '12px',
              display: 'block',
              margin: '0 auto',
            }}
          />
        </div>

        {/* Canvas oculto para processar o frame */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Botão de identificação */}
        <div className="btn-container" style={{ margin: '0 0 20px' }}>
          <button
            onClick={handleIdentificar}
            disabled={loading}
            className="btn"
            style={{ opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Processando Biometria...' : '📷  Identificar Rosto'}
          </button>
        </div>

        {/* Mensagem de resultado */}
        {mensagem && (
          <div style={{
            padding: '14px 20px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 'bold',
            background: sucesso ? '#d4edda' : '#f8d7da',
            color:      sucesso ? '#155724' : '#721c24',
            border:     `1px solid ${sucesso ? '#c3e6cb' : '#f5c6cb'}`,
          }}>
            {mensagem}
          </div>
        )}
      </div>
    </>
  );
}
