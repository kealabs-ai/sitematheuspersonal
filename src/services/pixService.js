import { createStaticPix } from 'pix-utils';

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
