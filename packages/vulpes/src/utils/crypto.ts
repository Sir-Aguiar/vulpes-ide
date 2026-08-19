export interface EncryptedRequestEnvelope {
  version: string;
  encryptedKey: string; // chave AES-256, cifrada com RSA-OAEP SHA-256 (Base64)
  iv: string; // 12 bytes, único por request (Base64)
  ciphertext: string; // AES-GCM(JSON do body + tag) (Base64)
}

export interface EncryptedPayload<T extends object> {
  nonce: string; // UUID por request
  timestamp: number;
  path: string;
  body: T;
}

const ENVELOPE_VERSION = "1";
const AES_IV_LENGTH = 12;

let cachedPublicKey: CryptoKey | null = null;

function getSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;

  if (!subtle) {
    throw new Error("Web Crypto API indisponível neste ambiente");
  }

  return subtle;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replaceAll(String.raw`\n`, "\n")
    .replaceAll("-----BEGIN PUBLIC KEY-----", "")
    .replaceAll("-----END PUBLIC KEY-----", "")
    .replaceAll(/\s+/g, "");

  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.codePointAt(i) ?? 0;
  }

  return bytes.buffer;
}

function toBase64(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = "";
  const chunkSize = 32_768;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCodePoint(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

async function getPublicKey(): Promise<CryptoKey> {
  if (cachedPublicKey) {
    return cachedPublicKey;
  }

  const pem = process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY;

  if (!pem) {
    throw new Error("NEXT_PUBLIC_RSA_PUBLIC_KEY não configurada");
  }

  cachedPublicKey = await getSubtle().importKey(
    "spki",
    pemToArrayBuffer(pem),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );

  return cachedPublicKey;
}

export const encodeRequest = async (
  request: object,
  path: string,
): Promise<EncryptedRequestEnvelope> => {
  const subtle = getSubtle();
  const publicKey = await getPublicKey();

  const aesKey = await subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"],
  );

  const iv = crypto.getRandomValues(new Uint8Array(AES_IV_LENGTH));

  const payload: EncryptedPayload<object> = {
    nonce: crypto.randomUUID(),
    timestamp: Date.now(),
    path,
    body: request,
  };

  const plaintext = new TextEncoder().encode(JSON.stringify(payload));

  const ciphertext = await subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    plaintext,
  );

  const rawAesKey = await subtle.exportKey("raw", aesKey);

  const encryptedKey = await subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    rawAesKey,
  );

  return {
    version: ENVELOPE_VERSION,
    encryptedKey: toBase64(encryptedKey),
    iv: toBase64(iv),
    ciphertext: toBase64(ciphertext),
  };
};
