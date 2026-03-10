import { createStaticPix } from 'pix-utils';
import { Buffer } from 'buffer';

// Garantir que Buffer está disponível globalmente
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

export const generatePixCode = (pixKey, amount, description) => {
  const pix = createStaticPix({
    merchantName: 'MATHEUS CASTRO PERSONAL',
    merchantCity: 'PASSOS',
    pixKey: pixKey,
    infoAdicional: description,
    transactionAmount: amount
  });
  
  return pix.toBRCode();
};
