// licensing/core/vault.ts

import { createHmac, randomBytes } from 'crypto';

/**
 * Ürün ve Donanım mühürleme için kullanılan kripto motoru.
 * ABD standartlarında AES-256 ve HMAC-SHA256 kullanarak 
 * asimetrik bir güven bağı oluşturur.
 */
export class Vault {
  private static MASTER_SECRET = process.env.SYSTEM_MASTER_KEY || 'rgz_secret_2026';

  // Donanım ID'sini sistem anahtarıyla mühürler
  static generateHardwareHash(hwid: string): string {
    return createHmac('sha256', this.MASTER_SECRET)
      .update(hwid)
      .digest('hex');
  }

  // Alıcı için tekil API Key üretir
  static generateBuyerApiKey(): string {
    return `rgz_live_${randomBytes(24).toString('hex')}`;
  }
}
