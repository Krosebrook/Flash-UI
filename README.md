# Flash UI

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Version](https://img.shields.io/badge/version-1.3.0-green.svg)](https://github.com/Krosebrook/Flash-UI)

> **A high-performance, AI-powered generative interface builder that creates production-ready UI components in seconds.**

Flash UI is a Progressive Web Application (PWA) that leverages Google's Gemini AI to generate functional, beautiful UI components across multiple frameworks. Built with React 19, TypeScript, and modern web standards, it provides a secure, offline-capable design studio in your browser.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/Krosebrook/Flash-UI.git
cd Flash-UI

# Install dependencies
npm install

# Set your Gemini API key (optional - can also be set via Vault UI)
echo "GEMINI_API_KEY=your_key_here" > .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

---

## ✨ Core Features

### 1. Multi-Framework Code Generation
Generate production-ready components in your preferred framework:

- **🔧 Vanilla** - Pure HTML/CSS with modern layouts (Flexbox/Grid). Zero dependencies.
- **🎨 Material UI** - React components using Material-UI v5. Google's design system.
- **💫 Chakra UI** - Accessible, themeable React components with excellent DX.
- **🖼️ AI Images** - High-fidelity visual assets (720p to 1K resolution) using Gemini's imaging models.

### 2. Design Variations System
Every prompt generates **3 distinct design concepts** automatically:
- Gemini analyzes your prompt and creates diverse aesthetic interpretations
- Compare approaches side-by-side (e.g., Minimalist vs. Maximalist vs. Glassmorphic)
- Regenerate individual variations or all at once
- Focus mode for detailed inspection

### 3. Real-Time Streaming
Watch your UI come to life as the AI writes code:
- Live syntax-highlighted code preview during generation
- Immediate iframe rendering with sandboxed execution
- Progress indicators and status updates

### 4. Secure Key Management (Vault)
Enterprise-grade security for your API keys:
- **AES-256-GCM encryption** with PBKDF2 key derivation (100k iterations)
- **Client-side only** - keys never leave your device
- **Recovery system** - 16-character recovery codes stored in Cache API
- **IndexedDB storage** - encrypted at rest, never in localStorage

### 5. PWA & Offline Support
Install as a native app on any platform:
- Full offline functionality with Service Worker caching
- Install prompt for desktop and mobile
- Background updates without disrupting workflow
- Offline fallback page

### 6. Developer Terminal
Powerful CLI interface for advanced users:
- Manage API keys programmatically
- Query local databases
- System diagnostics and debugging
- Command history and tab completion

---

## 🏗️ Architecture

Flash UI follows a **local-first, edge-optimized** architecture that prioritizes privacy and performance.

### Technology Stack
- **Frontend**: React 19, TypeScript 5.8
- **Build**: Vite 6.2 with Hot Module Replacement
- **AI**: Google Generative AI SDK (@google/genai)
- **Storage**: Dexie.js (IndexedDB) + LocalStorage
- **Crypto**: Web Crypto API (SubtleCrypto)
- **PWA**: Service Worker with intelligent caching strategies

### Core Design Principles

#### 1. **Privacy-First**
- All data processing happens client-side
- API keys encrypted locally, never transmitted in plaintext
- No telemetry or analytics
- No server-side storage or logging

#### 2. **Modular Component Architecture**
- Isolated components with clear responsibilities
- Context API for global state (StorageContext)
- Custom hooks for reusable logic
- Type-safe interfaces throughout

#### 3. **Progressive Enhancement**
- Works without JavaScript (offline page)
- Graceful degradation of features
- Responsive design from mobile to 4K displays
- Accessibility built-in (ARIA labels, keyboard navigation)

### Data Flow

```
User Input → App.handleSendMessage()
    ↓
Gemini API (Style Generation)
    ↓
3 Parallel generateArtifact() calls
    ↓
Streaming → updateArtifact() → StorageContext
    ↓
LocalStorage Persistence + ArtifactCard Render
```

### Storage Architecture

**IndexedDB (via Dexie.js)**
- API keys (encrypted with user's master passphrase)
- Vault configuration
- Recovery data

**LocalStorage**
- Session history (`flash_ui_sessions_v1`)
- User preferences (`flash_ui_config_v1`)
- UI library selection, HQ mode toggle

**Cache API**
- Service Worker assets (app shell)
- Recovery key backup
- External dependencies (CDN resources)

---

## 📦 Component Documentation

### Core Components

#### `<App />` & `<AppContent />`
**Purpose**: Root application component and main orchestrator.

**Key Responsibilities**:
- Manages session lifecycle and artifact generation
- Coordinates AI API calls and streaming
- Handles PWA installation prompts
- Routing between different UI states

**State Management**:
- `currentSessionIndex`: Active session in history
- `focusedArtifactIndex`: Which artifact is in focus mode (null = grid view)
- `isLoading`: Global generation state
- `drawerState`: Side drawer visibility and content

#### `<ArtifactCard />`
**Purpose**: Displays a single generated UI component.

**Features**:
- Sandboxed iframe rendering (prevents XSS and style leakage)
- Error state handling with actionable solutions
- Real-time code streaming preview
- Retry/regeneration controls

**Props**:
```typescript
interface ArtifactCardProps {
  artifact: Artifact;          // The generated content
  isFocused: boolean;          // Is this card in focus mode?
  onClick: () => void;         // Focus handler
  onRetry?: (id: string) => void;  // Regeneration callback
}
```

#### `<KeyManager />` (Vault)
**Purpose**: Secure API key management interface.

**Security Features**:
- AES-256-GCM encryption
- PBKDF2 key derivation (100,000 iterations)
- Master passphrase protection
- Recovery code system

**States**:
- `uninitialized` - First-time setup
- `locked` - Requires passphrase to unlock
- `unlocked` - Active vault access
- `recovering` - Recovery mode
- `setup_recovery` - Display recovery code after initialization

#### `<Terminal />`
**Purpose**: Developer command-line interface.

**Available Commands**:
```
GENERAL: help, clear, whoami, exit
VAULT: listkeys, setkey, getkey, rmkey
SYSTEM: tables, getdb, cleardb, reset
```

**Features**:
- Command history (Arrow Up/Down)
- Tab completion
- Async command execution

#### `<StorageContext />`
**Purpose**: Global state management for sessions and configuration.

**Provides**:
- `sessions`: Array of all generation sessions
- `config`: User preferences (library, HQ mode)
- `addSession()`: Create new session
- `updateArtifact()`: Update specific artifact
- `setLibrary()`, `setHqMode()`: Config updates
- `clearAll()`: Full reset

#### `<DottedGlowBackground />`
**Purpose**: Animated canvas background.

**Implementation**:
- 30x30 grid of animated dots
- DPI-aware rendering (handles Retina displays)
- Pulsing glow effect with physics simulation
- Performance optimized with requestAnimationFrame

---

## 🔐 Security

### Threat Model
Flash UI assumes:
- The user's browser is trusted
- The local device storage is secure
- Network connections may be monitored (TLS required for API calls)

### Security Measures

#### 1. **Encryption**
- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key Derivation**: PBKDF2 with SHA-256, 100,000 iterations
- **Salt**: 16 bytes, randomly generated per encryption
- **IV**: 12 bytes, randomly generated per encryption

#### 2. **Key Storage**
- Master key encrypted with user passphrase
- API keys encrypted with master key
- Recovery code provides secondary access path
- No keys ever stored in plaintext

#### 3. **Content Security**
- Generated code runs in sandboxed iframes
- `sandbox` attribute restricts capabilities
- No access to parent document or cookies

#### 4. **Input Validation**
- Passphrase minimum length: 8 characters
- Command input sanitization in Terminal
- JSON parsing with try-catch blocks

### Known Limitations
- **No server-side auth**: Keys stored client-side only
- **Browser security**: Vulnerable if device is compromised
- **Recovery dependency**: Loss of both passphrase and recovery code = permanent lockout
- **No key rotation**: Keys must be manually updated in Vault

---

## 🐛 Debugging & Troubleshooting

### Common Issues

#### "API Key Invalid" Error
**Cause**: Missing or incorrect Gemini API key.

**Solution**:
1. Click "Vault" in bottom-left corner
2. Initialize vault with a secure passphrase
3. Add your Gemini API key
4. Try generation again

#### "Rate Limit Exceeded"
**Cause**: Too many requests in a short time (free tier limitation).

**Solution**:
- Wait 60 seconds before retrying
- Consider upgrading to paid tier for higher limits
- Use HQ mode sparingly (requires paid API key)

#### "Content Blocked" (Safety Filter)
**Cause**: Gemini's safety filters flagged the prompt.

**Solution**:
- Rephrase prompt to be more technical/specific
- Avoid ambiguous terms that could be misinterpreted
- Try a different design direction

#### Service Worker Not Updating
**Cause**: Browser cache or SW lifecycle issue.

**Solution**:
1. Open DevTools → Application → Service Workers
2. Click "Unregister"
3. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
4. Reload page

#### Generated Code Not Rendering
**Cause**: Framework template mismatch or syntax error.

**Solution**:
1. Click "Source" button to view raw code
2. Check browser console for errors
3. Try regenerating with clearer prompt
4. Switch to Vanilla mode for debugging

---

## 🛠️ Development

### Project Structure
```
Flash-UI/
├── components/           # React components
│   ├── ArtifactCard.tsx    # Generated UI display
│   ├── DottedGlowBackground.tsx  # Canvas background
│   ├── GlobalLoading.tsx   # Loading overlay
│   ├── Icons.tsx           # SVG icon components
│   ├── KeyManager.tsx      # Vault UI
│   ├── SideDrawer.tsx      # Side panel
│   └── Terminal.tsx        # CLI interface
├── contexts/
│   └── StorageContext.tsx  # Global state
├── utils/
│   └── crypto.ts           # Encryption utilities
├── constants.ts          # App constants
├── db.ts                 # Dexie database schema
├── index.tsx             # App entry point
├── types.ts              # TypeScript interfaces
├── utils.ts              # Utility functions
├── sw.js                 # Service Worker
├── index.css             # Global styles
├── manifest.json         # PWA manifest
├── vite.config.ts        # Build configuration
└── tsconfig.json         # TypeScript config
```

### Code Style
- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **Formatting**: 2-space indentation
- **License**: Apache 2.0 headers in all source files

### Available Scripts
```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Production build
npm run preview  # Preview production build
```

### Adding a New UI Library

1. Add library button to `LIBRARY_TOOLTIPS` in `index.tsx`
2. Implement template wrapper in `wrapCodeInLibraryTemplate()`
3. Update `generateArtifact()` to handle new library
4. Add CDN links for client-side rendering

Example:
```typescript
if (library === 'tailwind') {
  return `<!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>${cleanCode}</body>
    </html>`;
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly (dev server + production build)
5. Commit with clear messages: `git commit -m 'Add amazing feature'`
6. Push to your fork: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Contribution Guidelines
- Follow existing code style and patterns
- Add TypeScript types for all new code
- Test on multiple browsers (Chrome, Firefox, Safari)
- Update documentation for user-facing changes
- Keep commits atomic and well-described

### Priority Areas
- [ ] Unit tests (Jest + React Testing Library)
- [ ] E2E tests (Playwright)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Additional UI frameworks (Tailwind, Bootstrap, Ant Design)
- [ ] Export/import sessions
- [ ] Theme customization
- [ ] Code diff viewer for variations

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the LICENSE file for details.

**SPDX-License-Identifier: Apache-2.0**

---

## 🙏 Acknowledgments

- **Google Gemini** - AI model powering generation
- **React Team** - React 19 and hooks architecture
- **Dexie.js** - Elegant IndexedDB wrapper
- **Vite** - Lightning-fast build tool
- Creator: [@ammaar](https://x.com/ammaar)

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Krosebrook/Flash-UI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Krosebrook/Flash-UI/discussions)
- **Creator**: [@ammaar on X](https://x.com/ammaar)

---

**Made with ⚡ by the Flash UI team**