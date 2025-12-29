
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../db';
import { encrypt, decrypt, generateRecoveryCode, generateMasterKey } from '../utils/crypto';
import { PlusIcon, WarningIcon, CodeIcon, RotateCcwIcon, CheckIcon, CopyIcon, SparklesIcon } from './Icons';
import { APIKey } from '../db';

const VAULT_CONFIG_ID = '__vault_config__';
const RECOVERY_KEY_PATH = '/vault/recovery-payload.bin';

interface KeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

type VaultState = 'loading' | 'uninitialized' | 'locked' | 'unlocked' | 'recovering' | 'setup_recovery';

const KeyManager: React.FC<KeyManagerProps> = ({ isOpen, onClose }) => {
  const [vaultState, setVaultState] = useState<VaultState>('loading');
  const [passphrase, setPassphrase] = useState<string>('');
  const [masterKey, setMasterKey] = useState<string | null>(null);
  const [recoveryCode, setRecoveryCode] = useState<string>('');
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [newProvider, setNewProvider] = useState('');
  const [newKey, setNewKey] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const checkVaultStatus = useCallback(async () => {
    const config = await db.apiKeys.get(VAULT_CONFIG_ID);
    if (!config) {
      setVaultState('uninitialized');
    } else {
      setVaultState('locked');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkVaultStatus();
    }
  }, [isOpen, checkVaultStatus]);

  const loadKeys = async () => {
    const allKeys = await db.apiKeys.toArray();
    setKeys(allKeys.filter(k => k.provider !== VAULT_CONFIG_ID));
  };

  const handleInitialize = async () => {
    if (passphrase.length < 8) {
      setError("Passphrase must be at least 8 characters.");
      return;
    }
    try {
      const newMasterKey = generateMasterKey();
      const newRecoveryCode = generateRecoveryCode();
      
      const wrappedForDB = await encrypt(newMasterKey, passphrase);
      await db.apiKeys.put({
        provider: VAULT_CONFIG_ID,
        encryptedKey: wrappedForDB,
        updatedAt: Date.now()
      });

      const wrappedForRecovery = await encrypt(newMasterKey, newRecoveryCode);
      const cache = await caches.open('flash-recovery');
      await cache.put(RECOVERY_KEY_PATH, new Response(wrappedForRecovery));

      setMasterKey(newMasterKey);
      setRecoveryCode(newRecoveryCode);
      setVaultState('setup_recovery');
      setPassphrase(''); // Clear sensitive data
      setError('');
    } catch (e) {
      setError("Initialization failed: Entropy source unavailable.");
    }
  };

  const handleUnlock = async () => {
    try {
      const config = await db.apiKeys.get(VAULT_CONFIG_ID);
      if (!config?.encryptedKey) throw new Error("Vault corrupted.");
      
      const unwrap = await decrypt(config.encryptedKey, passphrase);
      setMasterKey(unwrap);
      setVaultState('unlocked');
      setPassphrase(''); // Clear sensitive data
      loadKeys();
      setError('');
    } catch (e) {
      setError("Incorrect Master Passphrase. Access denied.");
    }
  };

  const handleStartRecovery = () => {
    setVaultState('recovering');
    setRecoveryCode('');
    setError('');
  };

  const handleRecover = async () => {
    try {
      const cache = await caches.open('flash-recovery');
      const response = await cache.match(RECOVERY_KEY_PATH);
      if (!response) throw new Error("Metadata missing.");
      
      const encryptedPayload = await response.text();
      const unwrap = await decrypt(encryptedPayload, recoveryCode.trim().toUpperCase());
      
      setMasterKey(unwrap);
      setVaultState('unlocked');
      setRecoveryCode(''); // Clear sensitive data
      loadKeys();
      setError('');
    } catch (e) {
      setError("Invalid recovery code. Ensure metadata is present on this device.");
    }
  };

  const handleAddKey = async () => {
    if (!newProvider || !newKey || !masterKey) return;
    try {
      const encrypted = await encrypt(newKey, masterKey);
      await db.apiKeys.put({
        provider: newProvider.toLowerCase(),
        encryptedKey: encrypted,
        updatedAt: Date.now()
      });
      setNewProvider('');
      setNewKey('');
      loadKeys();
    } catch (e) {
      setError("Encryption fault: Key could not be stored.");
    }
  };

  const handleDelete = async (provider: string) => {
    await db.apiKeys.delete(provider);
    loadKeys();
  };

  const handleView = async (encrypted: string) => {
    if (!masterKey) return;
    try {
      const original = await decrypt(encrypted, masterKey);
      alert(`${original}`);
    } catch (e) {
      setError("Failed to decrypt key: Cipher mismatch.");
    }
  };

  const copyRecoveryCode = () => {
    navigator.clipboard.writeText(recoveryCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="terminal-overlay" onClick={onClose}>
      <div className="key-manager-window" onClick={e => e.stopPropagation()}>
        <div className="terminal-header">
          <span>Vault: {vaultState.toUpperCase()}</span>
          <button onClick={onClose}>&times;</button>
        </div>

        <div className="key-manager-body">
          {vaultState === 'uninitialized' && (
            <div className="unlock-screen">
              <div className="vault-icon"><SparklesIcon /></div>
              <h3>Initialize Secure Vault</h3>
              <p>Set a master passphrase to protect all your API keys. Access is local-only and encrypted.</p>
              <input 
                type="password" 
                placeholder="Choose Master Passphrase (8+ chars)" 
                value={passphrase} 
                onChange={e => setPassphrase(e.target.value)}
                autoFocus
              />
              {error && <div className="error-text">{error}</div>}
              <button className="unlock-btn" onClick={handleInitialize}>Initialize Vault</button>
            </div>
          )}

          {vaultState === 'setup_recovery' && (
            <div className="unlock-screen">
              <div className="vault-icon" style={{color: '#4ade80'}}><CheckIcon /></div>
              <h3>Vault Initialized</h3>
              <p>Save this recovery code. If you forget your passphrase, this is the <strong>only way</strong> to recover your keys.</p>
              <div className="recovery-code-display" onClick={copyRecoveryCode}>
                <code>{recoveryCode}</code>
                {isCopied ? <CheckIcon /> : <CopyIcon />}
              </div>
              <button className="unlock-btn" onClick={() => { setVaultState('unlocked'); loadKeys(); }}>Finish Setup</button>
            </div>
          )}

          {vaultState === 'locked' && (
            <div className="unlock-screen">
              <div className="vault-icon"><CodeIcon /></div>
              <h3>Secure Vault Locked</h3>
              <p>Enter your Master Passphrase to manage keys.</p>
              <input 
                type="password" 
                placeholder="Master Passphrase" 
                value={passphrase} 
                onChange={e => setPassphrase(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                autoFocus
              />
              {error && <div className="error-text">{error}</div>}
              <button className="unlock-btn" onClick={handleUnlock}>Unlock Vault</button>
              <button className="recovery-link" onClick={handleStartRecovery}>Forgot passphrase?</button>
            </div>
          )}

          {vaultState === 'recovering' && (
            <div className="unlock-screen">
              <div className="vault-icon" style={{color: '#f472b6'}}><RotateCcwIcon /></div>
              <h3>Vault Recovery</h3>
              <p>Enter your 16-character recovery code (e.g., XXXX-XXXX-XXXX-XXXX).</p>
              <input 
                type="text" 
                placeholder="XXXX-XXXX-XXXX-XXXX" 
                value={recoveryCode} 
                onChange={e => setRecoveryCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRecover()}
                autoFocus
              />
              {error && <div className="error-text">{error}</div>}
              <div className="action-buttons" style={{marginTop: '20px'}}>
                 <button className="unlock-btn" onClick={handleRecover}>Recover Vault</button>
                 <button className="utility-btn" style={{background: 'transparent', border: 'none'}} onClick={() => setVaultState('locked')}>Cancel</button>
              </div>
            </div>
          )}

          {vaultState === 'unlocked' && (
            <div className="manager-content">
              <div className="add-key-form">
                <input 
                  placeholder="Provider (e.g. OpenAI)" 
                  value={newProvider} 
                  onChange={e => setNewProvider(e.target.value)} 
                />
                <input 
                  type="password" 
                  placeholder="API Key" 
                  value={newKey} 
                  onChange={e => setNewKey(e.target.value)} 
                />
                <button onClick={handleAddKey} disabled={!newProvider || !newKey}>
                  <PlusIcon /> Add
                </button>
              </div>

              <div className="keys-list">
                {keys.length === 0 ? (
                  <div className="empty-vault">No keys stored in this vault.</div>
                ) : (
                  keys.map(k => (
                    <div key={k.provider} className="key-item">
                      <div className="key-info">
                        <span className="key-provider">{k.provider}</span>
                        <span className="key-date">Updated: {new Date(k.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="key-actions">
                        <button onClick={() => handleView(k.encryptedKey!)}>View</button>
                        <button onClick={() => handleDelete(k.provider)} className="delete">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {error && <div className="error-text"><WarningIcon /> {error}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeyManager;