
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import Dexie, { type EntityTable } from 'dexie';

export interface APIKey {
  provider: string;
  key?: string; // For legacy/terminal use
  encryptedKey?: string; // For Vault use
  updatedAt: number;
}

// Initialize Dexie Database
export const db = new Dexie('FlashUIDatabase') as Dexie & {
  apiKeys: EntityTable<APIKey, 'provider'>;
};

// Version 1: Basic provider-key-updatedAt
// Version 2: Added encryptedKey support
db.version(2).stores({
  apiKeys: 'provider, key, encryptedKey, updatedAt'
});
