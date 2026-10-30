import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const PixStatus = () => {
  const location  = useLocation();
  const { orderId, pixCode, pixQrImage, total } = location.state || {};

  const [copied, setCopied] = useState(false);
  const qrImageSrc = pixQrImage
    ? /^(data:image\/|https?:\/\/)/i.test(pixQrImage)
      ? pixQrImage
      : `data:image/png;base64,${pixQrImage}`
    : '';

  const copyCode = () => {
    if (!pixCode) return;
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">

        <div className="text-center">
          <h1 className="text-4xl font-bebas uppercase text-yellow-400">Pagamento via PIX</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Escaneie o QR Code ou copie o código para pagar. Esta tela não confirma o pagamento.
          </p>
        </div>

        {(pixCode || pixQrImage) && (
          <div className="bg-dark-card border border-dark-border p-6 space-y-4">
            <div className="flex justify-center">
              <div className="bg-white p-3 rounded">
                {qrImageSrc
                  ? <img src={qrImageSrc} alt="QR Code PIX" width={200} height={200} />
                  : <QRCodeSVG value={pixCode} size={200} />
                }
              </div>
            </div>

            {pixCode && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pixCode}
                  readOnly
                  className="flex-1 p-3 bg-black border border-dark-border text-white text-xs focus:outline-none"
                />
                <button
                  onClick={copyCode}
                  className="bg-lime-green text-black px-4 py-2 font-bold hover:bg-neon-green transition-all flex items-center gap-1 text-sm"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            )}

            <div className="text-xs text-gray-500 text-center">
              Pedido #{orderId} · {total != null ? `R$ ${Number(total).toFixed(2).replace('.', ',')}` : ''}
            </div>
          </div>
        )}
        {!pixCode && !pixQrImage && (
          <div className="bg-dark-card border border-yellow-400/30 p-4 text-center text-sm text-yellow-200">
            O pagamento foi iniciado, mas o servidor não retornou o QR Code PIX. Tente novamente ou entre em contato com o suporte.
          </div>
        )}
      </div>
    </div>
  );
};

export default PixStatus;
