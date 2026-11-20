import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, X } from 'lucide-react';
import matheusLogo from '../assets/logotipo_matheus_personal.png';
import { isAndroid, isIOS, isMobile, isStandalone } from '../utils/pwa';

const STORAGE_KEY = 'matheus_pwa_install_decision';

export default function InstallPwaModal() {
  const [open, setOpen] = useState(false);
  const [manualMessage, setManualMessage] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const handlePrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => {
      localStorage.setItem(STORAGE_KEY, 'installed');
      setOpen(false);
      setInstallPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);

    const decision = localStorage.getItem(STORAGE_KEY);
    if (isMobile() && !isStandalone() && !decision) {
      const timer = setTimeout(() => setOpen(true), 600);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handlePrompt);
        window.removeEventListener('appinstalled', handleInstalled);
      };
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  const close = (decision = 'dismissed') => {
    localStorage.setItem(STORAGE_KEY, decision);
    setOpen(false);
  };

  const handleInstall = async () => {
    if (isIOS()) {
      setManualMessage('No Safari, toque em Compartilhar e escolha “Adicionar à Tela de Início”. Confirme a adição para criar o atalho.');
      return;
    }
    if (!installPrompt) {
      setManualMessage(isAndroid()
        ? 'Abra o menu do navegador (⋮) e escolha “Adicionar à tela inicial” ou “Instalar aplicativo”.'
        : 'No menu do navegador, procure a opção “Adicionar à tela inicial” ou “Instalar aplicativo”.');
      return;
    }
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        localStorage.setItem(STORAGE_KEY, 'prompt-accepted');
        setManualMessage('Confirme “Instalar” na janela do navegador. O ícone será adicionado à tela inicial pelo sistema.');
      } else {
        setManualMessage('Instalação cancelada. Você pode tentar novamente pelo menu do navegador.');
      }
    } catch {
      setManualMessage('Não foi possível abrir a instalação automática. Use o menu do navegador e escolha “Adicionar à tela inicial” ou “Instalar aplicativo”.');
    } finally {
      setInstallPrompt(null);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/80 p-3 backdrop-blur-sm" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-pwa-title"
        className="w-full max-w-md max-h-[92dvh] overflow-y-auto border border-lime-green/30 bg-[#111] p-5 shadow-2xl"
        onKeyDown={(event) => event.key === 'Escape' && close()}
      >
        <div className="flex items-start justify-between gap-4">
          <img src={matheusLogo} alt="" className="h-10 brightness-0 invert" />
          <button ref={closeRef} onClick={() => close()} className="p-2 text-gray-400 hover:text-white" aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <>
            <h2 id="install-pwa-title" className="mt-5 text-3xl font-bebas uppercase text-white">Leve seu treino com você!</h2>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              Instale o Matheus Personal na tela inicial do seu celular e tenha acesso rápido aos seus treinos, evolução e acompanhamento personalizado, com uma experiência semelhante a um aplicativo.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-300">
              {['Acesso rápido pela tela inicial', 'Navegação otimizada para celular', 'Experiência sem barra de endereço quando instalado', 'Possibilidade de entrar com biometria após configuração', 'Acesso aos recursos de acompanhamento disponíveis'].map((item) => (
                <li key={item} className="flex gap-2"><span className="text-lime-green">✓</span>{item}</li>
              ))}
            </ul>
            {manualMessage && <p role="status" aria-live="polite" className="mt-4 border border-yellow-400/30 bg-yellow-400/10 p-3 text-sm text-yellow-200">{manualMessage}</p>}
            <button onClick={handleInstall} className="mt-5 flex w-full items-center justify-center gap-2 bg-lime-green py-4 font-bold uppercase text-black">
              <Download size={19} /> Instalar / adicionar à tela inicial
            </button>
            <button onClick={() => close('later')} className="mt-2 w-full py-3 text-sm text-gray-400 hover:text-white">Agora não</button>
        </>
      </div>
    </div>,
    document.body
  );
}
