/**
 * Encryption Service for Sensitive Data
 * 
 * Provides AES-256-GCM encryption for credentials stored in the database.
 * Uses environment variable for master key.
 * 
 * WARNING: This is a demonstration implementation.
 * For production, use HashiCorp Vault or AWS KMS.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;

/**
 * Get encryption key from environment
 * In production, use KMS/Vault
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  
  // If key is hex-encoded, decode it
  if (key.length === 64) {
    return Buffer.from(key, 'hex');
  }
  
  // Otherwise, hash it to get 32 bytes
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Encrypt sensitive data
 * Returns: base64(iv + authTag + encryptedData)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    return plaintext;
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  // Combine: IV + AuthTag + EncryptedData
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'base64')
  ]);
  
  return combined.toString('base64');
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) {
    return encryptedData;
  }

  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash sensitive data (one-way)
 * Use for comparison, not retrieval
 */
export function hash(data: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.pbkdf2Sync(data, salt, 100000, KEY_LENGTH, 'sha512');
  
  return salt.toString('hex') + ':' + hash.toString('hex');
}

/**
 * Verify hashed data
 */
export function verify(data: string, hashedData: string): boolean {
  const [saltHex, hashHex] = hashedData.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const originalHash = Buffer.from(hashHex, 'hex');
  
  const hash = crypto.pbkdf2Sync(data, salt, 100000, KEY_LENGTH, 'sha512');
  
  return crypto.timingSafeEqual(hash, originalHash);
}

/**
 * Generate a new encryption key
 */
export function generateKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Helper to encrypt object fields
 */
export function encryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      (result as any)[field] = encrypt(result[field]);
    }
  }
  
  return result;
}

/**
 * Helper to decrypt object fields
 */
export function decryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      (result as any)[field] = decrypt(result[field]);
    }
  }
  
  return result;
}

/**
 * Configuration for encrypting source credentials
 * Use this in sources.service.ts when storing/retrieving config
 */
export const SOURCE_CREDENTIAL_FIELDS = [
  'apiKey',
  'apiSecret', 
  'accessToken',
  'accessTokenSecret',
  'clientSecret',
  'bearerToken',
  'placeId'
] as const;

/**
 * Encrypt source config before storage
 */
export function encryptSourceConfig(config: Record<string, any>): Record<string, any> {
  const encrypted = { ...config };
  
  for (const field of SOURCE_CREDENTIAL_FIELDS) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encrypt(encrypted[field]);
    }
  }
  
  return encrypted;
}

/**
 * Decrypt source config after retrieval
 */
export function decryptSourceConfig(config: Record<string, any>): Record<string, any> {
  const decrypted = { ...config };
  
  for (const field of SOURCE_CREDENTIAL_FIELDS) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      try {
        decrypted[field] = decrypt(decrypted[field]);
      } catch {
        // Field might not be encrypted, keep as-is
      }
    }
  }
  
  return decrypted;
}
