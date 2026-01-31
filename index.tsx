
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Captura erros globais para ajudar no diagnóstico de tela branca
window.onerror = function(message, source, lineno, colno, error) {
  console.error("🔥 Erro Global Detectado:", message, "em", source, ":", lineno);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (err) {
  console.error("💥 Falha Crítica na Renderização:", err);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; color: #721c24; background: #f8d7da; border-radius: 8px; margin: 20px;">
      <h2 style="margin-top: 0">Erro de Inicialização</h2>
      <p>Ocorreu um erro ao carregar o aplicativo. Verifique o console do navegador (F12) para detalhes técnicos.</p>
    </div>
  `;
}
