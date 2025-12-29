
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const SALT_SIZE = 16;
const IV_SIZE = 12;

export function generateRecoveryCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 3) result += '-';
  }
  return result;
}

export function generateMasterKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(text: string, keyOrPassphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_SIZE));
  const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));
  const key = await deriveKey(keyOrPassphrase, salt);
  
  const encoder = new TextEncoder();
  const encryptedContent = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(text)
  );

  const combined = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedContent), salt.length + iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encryptedBase64: string, keyOrPassphrase: string): Promise<string> {
  const combined = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));
  
  const salt = combined.slice(0, SALT_SIZE);
  const iv = combined.slice(SALT_SIZE, SALT_SIZE + IV_SIZE);
  const data = combined.slice(SALT_SIZE + IV_SIZE);
  
  const key = await deriveKey(keyOrPassphrase, salt);
  
  const decryptedContent = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedContent);
}
