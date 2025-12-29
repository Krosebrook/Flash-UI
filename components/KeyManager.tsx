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
// Use relative path for recovery payload
const RECOVERY_KEY_PATH = 'recovery-payload.bin';

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
    setVaultState(config ? 'locked' : 'uninitialized');
  }, []);

  useEffect(() => {
    if (isOpen) checkVaultStatus();
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
      await db.apiKeys.put({ provider: VAULT_CONFIG_ID, encryptedKey: wrappedForDB, updatedAt: Date.now() });
      const wrappedForRecovery = await encrypt(newMasterKey, newRecoveryCode);
      const cache = await caches.open('flash-recovery');
      await cache.put(RECOVERY_KEY_PATH, new Response(wrappedForRecovery));
      setMasterKey(newMasterKey);
      setRecoveryCode(newRecoveryCode);
      setVaultState('setup_recovery');
      setPassphrase(''); // SECURITY: Clear passphrase immediately
      setError('');
    } catch (e) { setError("Initialization failed."); }
  };

  const handleUnlock = async () => {
    try {
      const config = await db.apiKeys.get(VAULT_CONFIG_ID);
      if (!config?.encryptedKey) throw new Error();
      const unwrap = await decrypt(config.encryptedKey, passphrase);
      setMasterKey(unwrap);
      setVaultState('unlocked');
      setPassphrase(''); // SECURITY: Clear passphrase immediately
      loadKeys();
      setError('');
    } catch (e) { setError("Incorrect Passphrase."); }
  };

  const handleRecover = async () => {
    try {
      const cache = await caches.open('flash-recovery');
      const response = await cache.match(RECOVERY_KEY_PATH);
      if (!response) throw new Error();
      const encryptedPayload = await response.text();
      const unwrap = await decrypt(encryptedPayload, recoveryCode.trim().toUpperCase());
      setMasterKey(unwrap);
      setVaultState('unlocked');
      setRecoveryCode(''); // SECURITY: Clear recovery code immediately
      loadKeys();
      setError('');
    } catch (e) { setError("Invalid Recovery Code."); }
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
      setError('');
    } catch (e) {
      setError("Failed to add key.");
    }
  };

  const handleDeleteKey = async (provider: string) => {
    await db.apiKeys.delete(provider);
    loadKeys();
  };

  const handleViewKey = async (encrypted: string) => {
    if (!masterKey) return;
    try {
      const original = await decrypt(encrypted, masterKey);
      alert(`Decrypted Key: ${original}`);
    } catch (e) {
      setError("Decryption failed.");
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
          <button onClick={onClose} className="terminal-close">&times;</button>
        </div>

        <div className="key-manager-body">
          {vaultState === 'uninitialized' && (
            <div className="unlock-screen">
              <div className="vault-icon"><SparklesIcon /></div>
              <h3>Initialize Secure Vault</h3>
              <p>Set a master passphrase to protect your API keys. Encryption is handled entirely on-device.</p>
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
              <h3>Vault Ready</h3>
              <p>IMPORTANT: Save this recovery code. If you forget your passphrase, this is the only way to recover access.</p>
              <div className="recovery-code-display" onClick={copyRecoveryCode}>
                <code>{recoveryCode}</code>
                {isCopied ? <CheckIcon /> : <CopyIcon />}
              </div>
              <button className="unlock-btn" onClick={() => { setVaultState('unlocked'); loadKeys(); }}>Enter Studio</button>
            </div>
          )}

          {vaultState === 'locked' && (
            <div className="unlock-screen">
              <div className="vault-icon"><CodeIcon /></div>
              <h3>Vault Locked</h3>
              <p>Enter your Master Passphrase to access your keys.</p>
              <input 
                type="password" 
                placeholder="Passphrase" 
                value={passphrase} 
                onChange={e => setPassphrase(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                autoFocus
              />
              {error && <div className="error-text">{error}</div>}
              <button className="unlock-btn" onClick={handleUnlock}>Unlock</button>
              <button className="recovery-link" onClick={() => setVaultState('recovering')}>Forgot passphrase?</button>
            </div>
          )}

          {vaultState === 'recovering' && (
            <div className="unlock-screen">
              <div className="vault-icon" style={{color: '#f472b6'}}><RotateCcwIcon /></div>
              <h3>Recovery Mode</h3>
              <p>Enter your 16-character recovery code.</p>
              <input 
                type="text" 
                placeholder="XXXX-XXXX-XXXX-XXXX" 
                value={recoveryCode} 
                onChange={e => setRecoveryCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRecover()}
                autoFocus
              />
              {error && <div className="error-text">{error}</div>}
              <div className="action-buttons" style={{marginTop: '16px'}}>
                <button className="unlock-btn" onClick={handleRecover}>Recover Access</button>
                <button className="utility-btn" style={{border:'none', background:'transparent'}} onClick={() => setVaultState('locked')}>Cancel</button>
              </div>
            </div>
          )}

          {vaultState === 'unlocked' && (
            <div className="manager-content">
              <div className="add-key-form">
                <input 
                  placeholder="Provider (e.g. Gemini)" 
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
                  <PlusIcon /> Add Key
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
                        <span className="key-date">Added: {new Date(k.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="key-actions">
                        <button onClick={() => handleViewKey(k.encryptedKey!)}>View</button>
                        <button onClick={() => handleDeleteKey(k.provider)} className="delete">Delete</button>
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