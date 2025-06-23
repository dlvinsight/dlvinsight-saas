import crypto from 'node:crypto';

// Encryption configuration
const algorithm = 'aes-256-gcm';
const ivLength = 16;
const tagLength = 16;
const saltLength = 32;
const iterations = 100000;
const keyLength = 32;

/**
 * Derives an encryption key from a password and salt
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256');
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * @param text - The text to encrypt
 * @param password - The encryption password (should be from env variable)
 * @returns Encrypted string in format: salt:iv:tag:encrypted
 */
export function encrypt(text: string, password: string): string {
  // Generate random salt and IV
  const salt = crypto.randomBytes(saltLength);
  const iv = crypto.randomBytes(ivLength);

  // Derive key from password
  const key = deriveKey(password, salt);

  // Create cipher
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  // Encrypt the text
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  // Get the auth tag
  const tag = cipher.getAuthTag();

  // Combine all parts
  const combined = Buffer.concat([salt, iv, tag, encrypted]);

  // Return base64 encoded
  return combined.toString('base64');
}

/**
 * Decrypts data encrypted with the encrypt function
 * @param encryptedText - The encrypted text to decrypt
 * @param password - The decryption password
 * @returns Decrypted string
 */
export function decrypt(encryptedText: string, password: string): string {
  // Decode from base64
  const combined = Buffer.from(encryptedText, 'base64');

  // Extract parts
  const salt = combined.slice(0, saltLength);
  const iv = combined.slice(saltLength, saltLength + ivLength);
  const tag = combined.slice(saltLength + ivLength, saltLength + ivLength + tagLength);
  const encrypted = combined.slice(saltLength + ivLength + tagLength);

  // Derive key from password
  const key = deriveKey(password, salt);

  // Create decipher
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);

  // Decrypt
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Encrypts an object as JSON
 */
export function encryptObject(obj: any, password: string): string {
  return encrypt(JSON.stringify(obj), password);
}

/**
 * Decrypts a JSON object
 */
export function decryptObject<T = any>(encryptedText: string, password: string): T {
  return JSON.parse(decrypt(encryptedText, password));
}

// Helper functions for SP-API credentials
export type SpApiCredentials = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

export function encryptSpApiCredentials(
  credentials: SpApiCredentials,
  password: string,
): {
    lwaClientId: string;
    lwaClientSecret: string;
    refreshToken: string;
  } {
  return {
    lwaClientId: encrypt(credentials.clientId, password),
    lwaClientSecret: encrypt(credentials.clientSecret, password),
    refreshToken: encrypt(credentials.refreshToken, password),
  };
}

export function decryptSpApiCredentials(
  encrypted: {
    lwaClientId: string;
    lwaClientSecret: string;
    refreshToken: string;
  },
  password: string,
): SpApiCredentials {
  return {
    clientId: decrypt(encrypted.lwaClientId, password),
    clientSecret: decrypt(encrypted.lwaClientSecret, password),
    refreshToken: decrypt(encrypted.refreshToken, password),
  };
}
