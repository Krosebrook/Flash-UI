# Flash UI - Quick Reference Guide

A concise reference for developers working on Flash UI. Keep this handy!

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/Krosebrook/Flash-UI.git
cd Flash-UI
npm install

# Environment
echo "GEMINI_API_KEY=your_key_here" > .env

# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run preview      # Preview production build
```

## 📁 Project Structure

```
Flash-UI/
├── components/           # React components
│   ├── ArtifactCard.tsx    # Generated UI display
│   ├── KeyManager.tsx      # Vault (encryption)
│   ├── Terminal.tsx        # CLI interface
│   ├── SideDrawer.tsx      # Code/variations panel
│   ├── GlobalLoading.tsx   # Loading overlay
│   └── Icons.tsx           # SVG components
│
├── contexts/
│   └── StorageContext.tsx  # Global state (sessions, config)
│
├── utils/
│   └── crypto.ts           # AES-256-GCM encryption
│
├── index.tsx             # Main app + generation logic
├── types.ts              # TypeScript interfaces
├── db.ts                 # Dexie (IndexedDB) schema
├── sw.js                 # Service Worker
├── constants.ts          # App constants
├── index.css             # Global styles
└── vite.config.ts        # Build config
```

## 🔑 Key Files

### `index.tsx` (Main App)
**Lines**: ~422  
**Purpose**: Root component, generation pipeline, PWA logic  
**Key Functions**:
- `handleSendMessage()` - Orchestrate generation
- `generateArtifact()` - Single artifact generation with streaming
- `wrapCodeInLibraryTemplate()` - Inject framework code

**State**: 15+ useState hooks (consider refactoring to custom hooks)

### `contexts/StorageContext.tsx`
**Purpose**: Global state management  
**Provides**:
```typescript
{
  sessions: Session[];               // All generation sessions
  config: { library, hq };           // User preferences
  addSession: (Session) => void;     // Create new session
  updateArtifact: (...) => void;     // Update artifact
  setLibrary: (lib) => void;         // Change framework
  clearAll: () => void;              // Reset everything
}
```

### `utils/crypto.ts`
**Purpose**: Encryption utilities  
**Functions**:
- `encrypt(text, passphrase)` → string (base64)
- `decrypt(encrypted, passphrase)` → string
- `generateMasterKey()` → string (32 bytes, base64)
- `generateRecoveryCode()` → string (XXXX-XXXX-XXXX-XXXX)

**Algorithm**: AES-256-GCM with PBKDF2 (100k iterations)

### `db.ts` (Dexie Schema)
**Tables**:
- `apiKeys`: Encrypted API keys and vault config

**Schema**:
```typescript
{
  provider: string;           // Primary key ('gemini', 'openai', etc.)
  key?: string;               // Legacy (deprecated)
  encryptedKey?: string;      // Encrypted with master key
  updatedAt: number;          // Timestamp
}
```

## 🎨 UI Libraries Supported

| Key | Library | Template Type | CDN |
|-----|---------|--------------|-----|
| V | Vanilla | None | N/A |
| M | Material UI | React | unpkg.com |
| C | Chakra UI | React | unpkg.com |
| I | AI Image | Image | N/A |

**Adding New Library**:
1. Add to `LIBRARY_TOOLTIPS` constant
2. Implement in `wrapCodeInLibraryTemplate()`
3. Update `UILibrary` type
4. Add button to library selector

## 🔐 Security

### Encryption Flow
```
User Passphrase
    ↓ (PBKDF2, 100k iterations)
Master Key (random 32 bytes)
    ↓ (AES-256-GCM)
API Keys (encrypted)
    ↓ (Store in IndexedDB)
```

### Sandbox Attributes
```html
<iframe 
  sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin"
/>
```

**Why each**:
- `allow-scripts`: Run generated JS
- `allow-forms`: Submit forms
- `allow-modals`: alert/confirm dialogs
- `allow-popups`: window.open()
- `allow-presentation`: Fullscreen API
- `allow-same-origin`: Access Storage APIs (isolated)

## 🐛 Common Issues

### Issue: Generation Fails
**Check**:
```javascript
// 1. API Key configured?
const db = await Dexie.open('FlashUIDatabase');
const keys = await db.table('apiKeys').toArray();
console.log(keys);

// 2. Network working?
await fetch('https://generativelanguage.googleapis.com/v1beta/models')
  .then(r => r.json())
  .then(console.log);
```

### Issue: Vault Won't Unlock
**Debug**:
```javascript
// Check if config exists
const config = await db.table('apiKeys').get('__vault_config__');
console.log('Vault exists:', !!config);

// Try recovery
const cache = await caches.open('flash-recovery');
const response = await cache.match('recovery-payload.bin');
console.log('Recovery available:', !!response);
```

### Issue: Service Worker Not Updating
**Fix**:
```javascript
// Unregister manually
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
// Then hard refresh
```

## 🧪 Testing (Future)

### Unit Test Example
```typescript
// Test crypto functions
import { encrypt, decrypt } from './utils/crypto';

test('encrypt/decrypt round-trip', async () => {
  const plaintext = 'secret';
  const passphrase = 'password';
  const encrypted = await encrypt(plaintext, passphrase);
  const decrypted = await decrypt(encrypted, passphrase);
  expect(decrypted).toBe(plaintext);
});
```

### E2E Test Example
```typescript
// Playwright
test('generate artifacts', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('input', 'Create a login form');
  await page.click('[aria-label*="Generate"]');
  await page.waitForSelector('.artifact-card');
  expect(await page.locator('.artifact-card').count()).toBe(3);
});
```

## 🔧 Development Tips

### Debug Mode
```typescript
// Add to index.tsx (dev only)
if (process.env.NODE_ENV === 'development') {
  window.DEBUG = true;
  window.db = db; // Expose for console access
}
```

### Console Helpers
```javascript
// List all sessions
JSON.parse(localStorage.getItem('flash_ui_sessions_v1'))

// Count artifacts
JSON.parse(localStorage.getItem('flash_ui_sessions_v1'))
  .reduce((sum, s) => sum + s.artifacts.length, 0)

// Clear everything
localStorage.clear();
await db.delete();
window.location.reload();
```

### Performance Monitoring
```typescript
// Monitor re-renders
const withRenderCount = (Component) => {
  let count = 0;
  return (props) => {
    count++;
    console.log(`${Component.name} rendered ${count} times`);
    return <Component {...props} />;
  };
};
```

## 📝 Code Style

### Naming Conventions
- **Components**: PascalCase (`ArtifactCard`)
- **Functions**: camelCase (`generateId`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINT`)
- **Types**: PascalCase (`UILibrary`)

### React Patterns
```typescript
// ✅ Good - Functional component with types
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  const handleAction = useCallback(() => {
    // Logic
  }, [dependencies]);
  
  return <div>{/* JSX */}</div>;
};

// ✅ Good - Memoize expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexVisualization data={data} />;
});

// ❌ Bad - Class components (avoid for new code)
class MyComponent extends React.Component { }
```

### TypeScript
```typescript
// ✅ Good - Explicit types
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// ❌ Bad - Using 'any'
function handleClick(data: any) { }
```

## 🌐 API Reference

### Gemini API
```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Generate content (streaming)
const stream = await ai.models.generateContentStream({
  model: 'gemini-3-flash-preview',
  contents: [{ parts: [{ text: 'Your prompt' }], role: 'user' }]
});

for await (const chunk of stream) {
  console.log(chunk.text);
}

// Generate image
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash-image',
  contents: { parts: [{ text: 'Your prompt' }] },
  config: { imageConfig: { aspectRatio: "1:1" } }
});
```

### IndexedDB (Dexie)
```typescript
import { db } from './db';

// Add
await db.apiKeys.put({ provider: 'test', encryptedKey: '...', updatedAt: Date.now() });

// Get
const key = await db.apiKeys.get('test');

// List
const allKeys = await db.apiKeys.toArray();

// Delete
await db.apiKeys.delete('test');

// Clear table
await db.apiKeys.clear();
```

### LocalStorage
```typescript
// Save sessions
localStorage.setItem('flash_ui_sessions_v1', JSON.stringify(sessions));

// Load sessions
const sessions = JSON.parse(localStorage.getItem('flash_ui_sessions_v1') || '[]');

// Clear all
localStorage.clear();
```

### Service Worker
```typescript
// Register
navigator.serviceWorker.register('/sw.js');

// Check status
const registration = await navigator.serviceWorker.getRegistration();
console.log('Active:', registration?.active?.state);

// Unregister
const registrations = await navigator.serviceWorker.getRegistrations();
await Promise.all(registrations.map(reg => reg.unregister()));
```

## 📊 Performance Budgets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Bundle Size | < 300KB | ~450KB | ⚠️ |
| First Load | < 2s | ~2.5s | ⚠️ |
| TTI | < 2s | ~3s | ⚠️ |
| Lighthouse | > 90 | 85 | ⚠️ |

## 🔗 Useful Links

- **Repo**: https://github.com/Krosebrook/Flash-UI
- **Issues**: https://github.com/Krosebrook/Flash-UI/issues
- **Gemini API Docs**: https://ai.google.dev/docs
- **React Docs**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/

## 🆘 Getting Help

1. **Check DEBUGGING_GUIDE.md** for troubleshooting
2. **Search existing issues** on GitHub
3. **Open new issue** with:
   - Browser version
   - Steps to reproduce
   - Console errors
   - Expected vs actual behavior
4. **Community**: Join discussions for questions

## 📚 Documentation Map

- **README.md** - Setup, features, architecture overview
- **CONTRIBUTING.md** - Contribution guidelines, code standards
- **ARCHITECTURE_DEEP_DIVE.md** - Detailed technical analysis
- **AUDIT_REPORT.md** - Complete codebase audit findings
- **CHANGELOG.md** - Version history
- **ROADMAP.md** - Future plans
- **DEBUGGING_GUIDE.md** - Troubleshooting
- **QUICK_REFERENCE.md** - This document

---

**Keep this guide updated as the codebase evolves!**

**Last Updated**: 2025-01-XX  
**Version**: 1.3.0  
**Maintainer**: [@ammaar](https://x.com/ammaar)
