const base64UrlToBuffer = (value) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0)).buffer;
};

export const bufferToBase64Url = (buffer) => {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const prepareCreationOptions = (options) => ({
  ...options,
  challenge: base64UrlToBuffer(options.challenge),
  user: options.user ? { ...options.user, id: base64UrlToBuffer(options.user.id) } : undefined,
  excludeCredentials: (options.excludeCredentials ?? []).map((credential) => ({
    ...credential,
    id: base64UrlToBuffer(credential.id)
  }))
});

export const prepareRequestOptions = (options) => ({
  ...options,
  challenge: base64UrlToBuffer(options.challenge),
  allowCredentials: (options.allowCredentials ?? []).map((credential) => ({
    ...credential,
    id: base64UrlToBuffer(credential.id)
  }))
});

export const creationResponse = (credential) => ({
  id: credential.id,
  rawId: bufferToBase64Url(credential.rawId),
  type: credential.type,
  response: {
    clientDataJSON: bufferToBase64Url(credential.response.clientDataJSON),
    attestationObject: bufferToBase64Url(credential.response.attestationObject),
    transports: credential.response.getTransports?.() ?? []
  }
});

export const assertionResponse = (credential) => ({
  id: credential.id,
  rawId: bufferToBase64Url(credential.rawId),
  type: credential.type,
  response: {
    clientDataJSON: bufferToBase64Url(credential.response.clientDataJSON),
    authenticatorData: bufferToBase64Url(credential.response.authenticatorData),
    signature: bufferToBase64Url(credential.response.signature),
    userHandle: credential.response.userHandle ? bufferToBase64Url(credential.response.userHandle) : null
  }
});
