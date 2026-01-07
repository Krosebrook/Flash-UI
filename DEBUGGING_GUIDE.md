# Flash UI - Debugging & Troubleshooting Guide

This comprehensive guide helps developers diagnose and fix issues in Flash UI, whether you're contributing code or debugging production problems.

## Table of Contents
1. [Common Issues](#common-issues)
2. [Debugging Tools](#debugging-tools)
3. [Component-Specific Issues](#component-specific-issues)
4. [Performance Debugging](#performance-debugging)
5. [Security Issues](#security-issues)
6. [Browser Compatibility](#browser-compatibility)

---

## Common Issues

### 1. Generation Failures

#### Symptom: "API Key Invalid" Error

**Diagnosis**:
```javascript
// Open browser console (F12)
// Check if API key is configured
const db = await Dexie.open('FlashUIDatabase');
const keys = await db.table('apiKeys').toArray();
console.log('API Keys:', keys);
```

**Possible Causes**:
- No API key configured
- Key expired or revoked
- Key for wrong service (not Gemini)
- Vault not unlocked

**Solutions**:
```javascript
// 1. Clear vault and reinitialize
localStorage.clear();
await db.delete();
window.location.reload();

// 2. Manually set key (temporary)
const { GoogleGenAI } = await import('@google/genai');
const ai = new GoogleGenAI({ apiKey: 'YOUR_KEY_HERE' });
// Test generation...
```

**Prevention**:
- Always test with a valid key in .env during development
- Add key validation on Vault initialization

---

#### Symptom: "Rate Limit Exceeded"

**Diagnosis**:
```javascript
// Check API call frequency
// Add this to index.tsx (temporary)
const originalFetch = window.fetch;
let callCount = 0;
window.fetch = (...args) => {
  if (args[0].includes('googleapis.com')) {
    callCount++;
    console.log(`API Call #${callCount} at ${new Date().toISOString()}`);
  }
  return originalFetch(...args);
};
```

**Possible Causes**:
- Too many generations in short time
- Free tier quota exceeded
- Concurrent requests (3 artifacts × multiple sessions)

**Solutions**:
```typescript
// Add rate limiting to generation
const rateLimiter = new Map<string, number>();

const checkRateLimit = (userId: string = 'default'): boolean => {
  const now = Date.now();
  const lastCall = rateLimiter.get(userId) || 0;
  
  if (now - lastCall < 2000) { // 2-second cooldown
    return false;
  }
  
  rateLimiter.set(userId, now);
  return true;
};

// In handleSendMessage()
if (!checkRateLimit()) {
  setError("Please wait 2 seconds between generations");
  return;
}
```

**Prevention**:
- Implement exponential backoff
- Queue requests instead of parallel
- Show user their remaining quota

---

#### Symptom: "Safety Filter Blocked"

**Diagnosis**:
```javascript
// Log full API response
const response = await ai.models.generateContent({...});
console.log('Full response:', JSON.stringify(response, null, 2));

// Check blockReason
if (response.candidates?.[0]?.finishReason === 'SAFETY') {
  console.log('Safety ratings:', response.candidates[0].safetyRatings);
}
```

**Possible Causes**:
- Prompt contains flagged terms
- Model interprets request as harmful
- Overly aggressive safety settings

**Solutions**:
```typescript
// 1. Rephrase prompt to be more technical
const sanitizePrompt = (prompt: string): string => {
  return prompt
    .replace(/hack/gi, 'develop')
    .replace(/attack/gi, 'test')
    .replace(/exploit/gi, 'utilize');
};

// 2. Add safety settings (use with caution)
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: { parts: [{ text: prompt }] },
  safetySettings: [
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_ONLY_HIGH'
    }
  ]
});
```

**Prevention**:
- Provide prompt examples in UI
- Pre-validate prompts for common issues
- Guide users toward technical language

---

### 2. Vault Issues

#### Symptom: Vault Won't Unlock

**Diagnosis**:
```javascript
// Test passphrase directly
import { decrypt } from './utils/crypto';

const db = await Dexie.open('FlashUIDatabase');
const config = await db.table('apiKeys').get('__vault_config__');

if (config?.encryptedKey) {
  try {
    const masterKey = await decrypt(config.encryptedKey, 'TEST_PASSPHRASE');
    console.log('Unlock successful:', masterKey.substring(0, 10) + '...');
  } catch (e) {
    console.error('Unlock failed:', e.message);
  }
}
```

**Possible Causes**:
- Wrong passphrase
- Corrupted encrypted data
- Browser crypto API issues
- IndexedDB data corruption

**Solutions**:
```javascript
// 1. Try recovery code
const cache = await caches.open('flash-recovery');
const response = await cache.match('recovery-payload.bin');
if (response) {
  const encryptedPayload = await response.text();
  // Try decrypt with recovery code...
}

// 2. Last resort: Export what you can, reinitialize
const sessions = JSON.parse(localStorage.getItem('flash_ui_sessions_v1') || '[]');
console.log('Backup sessions:', sessions);
// Save to file, then reset vault
```

**Prevention**:
- Show passphrase strength meter
- Require confirmation during setup
- Test unlock immediately after setup

---

#### Symptom: Recovery Code Doesn't Work

**Diagnosis**:
```javascript
// Check if recovery data exists
const cache = await caches.open('flash-recovery');
const keys = await cache.keys();
console.log('Cache keys:', keys.map(k => k.url));

const recoveryExists = keys.some(k => k.url.includes('recovery-payload.bin'));
console.log('Recovery file exists:', recoveryExists);
```

**Possible Causes**:
- Cache API not available (private browsing)
- Cache cleared by browser/user
- Recovery code incorrect format

**Solutions**:
```javascript
// Add fallback to IndexedDB
const storeRecoveryBackup = async (encryptedMasterKey: string) => {
  // Primary: Cache API
  const cache = await caches.open('flash-recovery');
  await cache.put('recovery-payload.bin', new Response(encryptedMasterKey));
  
  // Fallback: IndexedDB
  await db.apiKeys.put({
    provider: '__recovery_backup__',
    encryptedKey: encryptedMasterKey,
    updatedAt: Date.now()
  });
};
```

**Prevention**:
- Store recovery in multiple locations
- Warn user about private browsing limitations
- Provide export option for manual backup

---

### 3. Service Worker Issues

#### Symptom: "Service Worker Registration Failed"

**Diagnosis**:
```javascript
// Check SW status
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('SW Registrations:', registrations);
    registrations.forEach(reg => {
      console.log('  Scope:', reg.scope);
      console.log('  State:', reg.active?.state);
    });
  });
}

// Check for errors
navigator.serviceWorker.register('/sw.js').catch(err => {
  console.error('Registration error:', err);
  console.error('Error type:', err.name);
  console.error('Message:', err.message);
});
```

**Possible Causes**:
- SW file not found (404)
- Scope mismatch
- HTTPS requirement (except localhost)
- Browser doesn't support SW
- Origin mismatch (CDN issues)

**Solutions**:
```javascript
// 1. Force absolute URL resolution
const swUrl = new URL('sw.js', window.location.href).href;
console.log('Registering SW at:', swUrl);
navigator.serviceWorker.register(swUrl);

// 2. Check if HTTPS
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  console.warn('Service Workers require HTTPS');
}

// 3. Fallback: Unregister and re-register
const unregisterAll = async () => {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map(reg => reg.unregister()));
  console.log('All SW unregistered. Reload page to re-register.');
};
```

**Prevention**:
- Test SW registration in CI
- Add SW status indicator in UI
- Provide manual unregister button (dev mode)

---

#### Symptom: Infinite Update Loop

**Diagnosis**:
```javascript
// Monitor SW lifecycle
navigator.serviceWorker.addEventListener('controllerchange', () => {
  console.log('Controller changed at', new Date().toISOString());
  console.trace('Stack trace');
});

// Check if reload is triggered too often
let reloadCount = 0;
const originalReload = window.location.reload;
window.location.reload = () => {
  reloadCount++;
  console.log(`Reload #${reloadCount}`);
  if (reloadCount > 3) {
    console.error('Too many reloads! Blocking...');
    return;
  }
  originalReload.call(window.location);
};
```

**Possible Causes**:
- Installing worker immediately calls skipWaiting()
- Active worker triggers reload on statechange
- Race condition in update detection

**Solutions**:
```javascript
// Fix in index.tsx
registration.onupdatefound = () => {
  const installingWorker = registration.installing;
  if (installingWorker) {
    setGlobalLoading(true, "Updating System...");
    installingWorker.onstatechange = () => {
      // IMPORTANT: Only reload if there's an active controller
      if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // Give user choice instead of auto-reload
        const shouldReload = confirm('New version available. Reload now?');
        if (shouldReload) {
          window.location.reload();
        }
      }
    };
  }
};
```

**Prevention**:
- Add user confirmation before reload
- Debounce update checks
- Add "Skip Update" option

---

### 4. Streaming Issues

#### Symptom: Artifacts Not Updating During Streaming

**Diagnosis**:
```javascript
// Monitor state updates
const OriginalUpdateArtifact = updateArtifact;
updateArtifact = (...args) => {
  console.log('updateArtifact called:', args[0], args[1], args[2]?.html?.substring(0, 50));
  return OriginalUpdateArtifact(...args);
};

// Check if React is batching updates
import { flushSync } from 'react-dom';

// Test with immediate flush
flushSync(() => {
  updateArtifact(sessionId, artifactId, { html: newHtml });
});
```

**Possible Causes**:
- React batching updates (18+ automatic batching)
- Async state updates not triggered
- iframe not detecting srcDoc changes
- Memory issues with large HTML strings

**Solutions**:
```typescript
// 1. Use flushSync for streaming
for await (const chunk of responseStream) {
  accumulated += chunk.text;
  const wrapped = wrapCodeInLibraryTemplate(accumulated, library);
  
  flushSync(() => {
    updateArtifact(sessionId, artifactId, { 
      html: wrapped, 
      status: 'streaming' 
    });
  });
}

// 2. Force iframe re-render with key
<iframe 
  key={artifact.html.length} // Changes on every update
  srcDoc={artifact.html}
/>

// 3. Throttle updates (balance UX vs performance)
let lastUpdate = 0;
for await (const chunk of responseStream) {
  accumulated += chunk.text;
  const now = Date.now();
  
  if (now - lastUpdate > 100) { // Update every 100ms
    updateArtifact(sessionId, artifactId, { html: accumulated });
    lastUpdate = now;
  }
}
```

**Prevention**:
- Add streaming tests
- Monitor update frequency
- Provide "streaming quality" setting

---

## Debugging Tools

### 1. Browser DevTools

#### React DevTools
```bash
# Install
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

# Usage
# 1. Open DevTools (F12)
# 2. Click "Components" tab
# 3. Select component to inspect
# 4. View props, state, hooks
```

**Useful Filters**:
- `StorageContext` - Check global state
- `ArtifactCard` - Inspect individual artifacts
- `AppContent` - See all top-level state

#### Performance Profiler
```javascript
// Record a generation session
// 1. Open DevTools → Performance
// 2. Click Record
// 3. Trigger generation
// 4. Stop recording
// 5. Analyze flame graph

// Look for:
// - Long tasks (> 50ms)
// - Excessive re-renders
// - Memory spikes
```

#### Network Tab
```javascript
// Monitor API calls
// Filter: "googleapis.com"
// Check:
// - Request payload
// - Response time
// - Status codes
// - Response size
```

### 2. Console Debugging

#### Enable Verbose Logging
```javascript
// Add to index.tsx (dev mode)
if (process.env.NODE_ENV === 'development') {
  window.DEBUG = true;
  
  // Log all storage operations
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    console.log(`localStorage.setItem("${key}", ${value.substring(0, 100)}...)`);
    return originalSetItem.apply(this, arguments);
  };
  
  // Log all IndexedDB operations
  const originalPut = Dexie.Table.prototype.put;
  Dexie.Table.prototype.put = async function(...args) {
    console.log(`IndexedDB.${this.name}.put`, args[0]);
    return originalPut.apply(this, args);
  };
}
```

#### Useful Console Commands
```javascript
// Get all sessions
JSON.parse(localStorage.getItem('flash_ui_sessions_v1'))

// Count artifacts
JSON.parse(localStorage.getItem('flash_ui_sessions_v1'))
  .reduce((sum, s) => sum + s.artifacts.length, 0)

// Find sessions by prompt
JSON.parse(localStorage.getItem('flash_ui_sessions_v1'))
  .filter(s => s.prompt.includes('login'))

// Check vault status
(async () => {
  const db = await Dexie.open('FlashUIDatabase');
  const config = await db.table('apiKeys').get('__vault_config__');
  console.log('Vault initialized:', !!config);
})()

// Check service worker
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW:', reg?.active?.state);
})
```

### 3. Custom Debug Panel

```typescript
// Add to index.tsx (development only)
const DebugPanel: React.FC = () => {
  const { sessions, config } = useStorage();
  const [swStatus, setSWStatus] = useState<string>('unknown');
  
  useEffect(() => {
    navigator.serviceWorker.getRegistration().then(reg => {
      setSWStatus(reg?.active?.state || 'not registered');
    });
  }, []);
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      background: 'rgba(0,0,0,0.9)',
      color: '#0f0',
      padding: '10px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999
    }}>
      <div>Sessions: {sessions.length}</div>
      <div>Artifacts: {sessions.reduce((s, sess) => s + sess.artifacts.length, 0)}</div>
      <div>Library: {config.library}</div>
      <div>HQ Mode: {config.hq ? 'ON' : 'OFF'}</div>
      <div>SW: {swStatus}</div>
      <div>Memory: {(performance as any).memory?.usedJSHeapSize 
        ? `${((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(0)}MB`
        : 'N/A'}
      </div>
    </div>
  );
};

// Use in AppContent (dev only)
{process.env.NODE_ENV === 'development' && <DebugPanel />}
```

---

## Component-Specific Issues

### ArtifactCard

#### Issue: Iframe Shows White Screen

**Debug**:
```javascript
// Check srcDoc content
const iframe = document.querySelector('iframe[title="artifact-id"]');
console.log('srcDoc length:', iframe?.srcdoc?.length);
console.log('srcDoc preview:', iframe?.srcdoc?.substring(0, 200));

// Check for JavaScript errors in iframe
iframe.contentWindow.addEventListener('error', (e) => {
  console.error('Iframe error:', e.message);
});
```

**Fix**:
- Validate HTML is well-formed
- Check for missing CDN resources
- Ensure sandbox permissions are correct

### StorageContext

#### Issue: State Not Persisting

**Debug**:
```javascript
// Check if useEffect is triggered
const { sessions } = useStorage();

useEffect(() => {
  console.log('Sessions changed, persisting...', sessions.length);
  localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
}, [sessions]);
```

**Fix**:
- Verify dependencies array includes all state
- Check for localStorage quota exceeded
- Ensure no race conditions in updates

---

## Performance Debugging

### Identifying Bottlenecks

```javascript
// Measure component render time
const withPerf = (Component) => {
  return (props) => {
    const start = performance.now();
    const result = <Component {...props} />;
    const end = performance.now();
    
    if (end - start > 16) { // > 1 frame
      console.warn(`${Component.name} took ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  };
};

// Use
const PerfArtifactCard = withPerf(ArtifactCard);
```

### Memory Leaks

```javascript
// Monitor memory usage
setInterval(() => {
  if ((performance as any).memory) {
    const used = (performance as any).memory.usedJSHeapSize;
    const total = (performance as any).memory.totalJSHeapSize;
    console.log(`Memory: ${(used / 1024 / 1024).toFixed(0)}MB / ${(total / 1024 / 1024).toFixed(0)}MB`);
  }
}, 5000);

// Take heap snapshot in DevTools Memory tab
// Compare snapshots before/after actions to find leaks
```

---

## Security Issues

### XSS Vulnerability Check

```javascript
// Test iframe sandbox
const testXSS = () => {
  const maliciousCode = `
    <script>
      try {
        parent.document.body.innerHTML = 'HACKED';
        console.log('XSS successful');
      } catch (e) {
        console.log('XSS blocked:', e.message);
      }
    </script>
  `;
  
  // This should fail due to sandbox
  updateArtifact(sessionId, artifactId, { html: maliciousCode });
};
```

### Encryption Validation

```javascript
// Verify encryption is working
import { encrypt, decrypt } from './utils/crypto';

const testCrypto = async () => {
  const plaintext = 'test-api-key-12345';
  const passphrase = 'my-secure-password';
  
  const encrypted = await encrypt(plaintext, passphrase);
  console.log('Encrypted:', encrypted.substring(0, 50) + '...');
  
  const decrypted = await decrypt(encrypted, passphrase);
  console.log('Decrypted:', decrypted);
  console.log('Match:', plaintext === decrypted);
  
  // Test with wrong passphrase
  try {
    await decrypt(encrypted, 'wrong-password');
    console.error('ERROR: Decryption should have failed!');
  } catch (e) {
    console.log('Correct: Wrong passphrase rejected');
  }
};
```

---

## Browser Compatibility

### Check Feature Support

```javascript
const checkCompatibility = () => {
  const features = {
    'Service Worker': 'serviceWorker' in navigator,
    'IndexedDB': 'indexedDB' in window,
    'Cache API': 'caches' in window,
    'Web Crypto': 'crypto' in window && 'subtle' in crypto,
    'Local Storage': 'localStorage' in window,
    'ES2022': (() => { try { eval('[].at(0)'); return true; } catch { return false; } })()
  };
  
  console.table(features);
  
  const unsupported = Object.entries(features)
    .filter(([_, supported]) => !supported)
    .map(([feature]) => feature);
  
  if (unsupported.length > 0) {
    console.error('Unsupported features:', unsupported);
  }
};

checkCompatibility();
```

### Test Matrix

| Browser | Version | Status | Issues |
|---------|---------|--------|--------|
| Chrome | 120+ | ✅ Full | None |
| Firefox | 119+ | ✅ Full | None |
| Safari | 17+ | ✅ Full | None |
| Edge | 120+ | ✅ Full | None |
| Opera | 106+ | ✅ Full | None |
| Safari iOS | 17+ | ✅ Full | Keyboard overlap |
| Chrome Mobile | 120+ | ✅ Full | None |
| Samsung Internet | 24+ | ⚠️ Partial | SW issues |

---

## Getting Help

If you've tried everything and still have issues:

1. **Search Existing Issues**: https://github.com/Krosebrook/Flash-UI/issues
2. **Open New Issue**: Include:
   - Browser version
   - Steps to reproduce
   - Console errors
   - Expected vs actual behavior
3. **Community**: Discord/Discussions for non-bug questions

---

**Last Updated**: 2025-01-XX
**Maintainer**: [@ammaar](https://x.com/ammaar)
