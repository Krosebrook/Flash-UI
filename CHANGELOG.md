# Changelog

All notable changes to Flash UI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- Unit test suite (Jest + React Testing Library)
- End-to-end tests (Playwright)
- CI/CD pipeline with GitHub Actions
- Export/import session functionality
- Theme customization system
- Additional UI framework support (Tailwind, Bootstrap, Ant Design)
- Code diff viewer for comparing variations
- Collaborative features (share sessions via URL)
- Dark/light mode toggle
- Keyboard shortcuts reference modal

### Known Issues
- Service Worker may require manual unregister on some updates
- HQ image mode requires paid Gemini API tier
- Recovery code must be saved manually (no cloud backup)
- Large session histories may impact performance

---

## [1.3.0] - 2025-01-XX (Current)

### Added
- **Secure Vault System**: Complete API key management with AES-256-GCM encryption
  - Master passphrase protection with PBKDF2 (100k iterations)
  - Recovery code system using 16-character codes
  - Client-side encryption/decryption (Web Crypto API)
  - IndexedDB storage via Dexie.js v2 schema
- **PWA Installation**: Native app-like experience
  - Installation banner with dismiss functionality
  - Service Worker auto-update detection
  - Offline fallback page
  - Desktop and mobile support
- **Enhanced Error Handling**: Actionable error messages with solutions
  - Auth errors with direct Vault access
  - Rate limit guidance
  - Safety filter suggestions
  - Network diagnostics
- **Terminal Enhancements**: New commands and features
  - `whoami` - Display environment info
  - `tables` - List database tables
  - `getdb` / `cleardb` - Inspect and manage data
  - Command history with Arrow key navigation
  - Tab completion for commands

### Changed
- **Service Worker**: Improved caching strategy
  - Stale-while-revalidate for CDN resources
  - Cache-first for local assets
  - Intelligent offline handling
  - Version-based cache invalidation
- **React 19 Upgrade**: Performance and stability improvements
  - New concurrent features
  - Improved hydration
  - Better TypeScript support
- **Storage Architecture**: Multi-layer storage strategy
  - IndexedDB for sensitive data (API keys)
  - LocalStorage for sessions and config
  - Cache API for recovery data
- **UI Polish**: Visual consistency improvements
  - Refined loading states
  - Better focus indicators
  - Improved mobile responsiveness
  - Consistent spacing and typography

### Fixed
- Service Worker registration origin mismatch errors
- Recovery code not persisting across sessions
- Artifacts not updating during streaming
- Focus mode navigation edge cases
- Install banner showing after dismissal
- Terminal scroll behavior on new output

### Security
- Implemented AES-256-GCM authenticated encryption
- Added PBKDF2 key derivation with 100k iterations
- Removed plaintext key storage
- Added recovery system for lost passphrases
- Sandboxed iframe execution for generated code

---

## [1.2.1] - 2024-12-XX

### Added
- Image generation with Gemini imaging models
- HQ mode toggle for high-resolution images (720p → 1K)
- Model selection based on quality setting
  - `gemini-2.5-flash-image` (standard)
  - `gemini-3-pro-image-preview` (HQ mode)

### Changed
- Improved prompt engineering for better variation diversity
- Enhanced code streaming visualization
- Updated library selector with tooltips

### Fixed
- Generation failing for complex Material UI components
- Chakra UI template rendering errors
- Streaming preview auto-scroll issues

---

## [1.2.0] - 2024-11-XX

### Added
- **Multi-Framework Support**
  - Vanilla HTML/CSS generation
  - Material UI (React) components
  - Chakra UI (React) components
- **Design Variations System**
  - Automatic generation of 3 design concepts
  - Style diversity through prompt engineering
  - Individual artifact regeneration
- **Focus Mode**
  - Full-screen artifact viewing
  - Source code inspection
  - Navigation between artifacts
- **Terminal Interface**
  - Basic command set (help, clear, exit)
  - Key management commands
  - System reset functionality

### Changed
- Migrated to React 18.x
- Improved state management with Context API
- Enhanced TypeScript types and interfaces

---

## [1.1.0] - 2024-10-XX

### Added
- Real-time code streaming during generation
- Session history management
- LocalStorage persistence for sessions
- Retry/regeneration for failed artifacts
- Loading states and progress indicators

### Changed
- Updated to Gemini Flash 3 model
- Improved prompt templates
- Better error messages

### Fixed
- Session state synchronization
- Memory leaks in streaming
- Artifact card rendering performance

---

## [1.0.0] - 2024-09-XX

### Added
- Initial release of Flash UI
- Basic prompt-to-code generation
- Vanilla HTML/CSS support
- Simple UI with artifact cards
- Gemini API integration
- Basic error handling

### Architecture
- React application with Vite
- TypeScript for type safety
- LocalStorage for basic persistence
- Service Worker for offline capability

---

## Version History Summary

| Version | Date | Key Features |
|---------|------|--------------|
| 1.3.0 | 2025-01 | Vault encryption, PWA installation, enhanced security |
| 1.2.1 | 2024-12 | Image generation, HQ mode |
| 1.2.0 | 2024-11 | Multi-framework, variations, terminal |
| 1.1.0 | 2024-10 | Streaming, history, persistence |
| 1.0.0 | 2024-09 | Initial release |

---

## Upgrade Guide

### From 1.2.x to 1.3.0

**Breaking Changes:**
- API key storage moved from LocalStorage to IndexedDB
- Keys now require encryption via Vault
- Old keys need to be re-entered in Vault UI

**Migration Steps:**
1. Note your current API keys before upgrading
2. Pull latest code and run `npm install`
3. Open application and initialize Vault
4. **Important**: Save your recovery code
5. Re-enter API keys in Vault
6. Verify generation works correctly

**Database Schema:**
```typescript
// Old (v1)
{ provider: string, key: string }

// New (v2)
{ 
  provider: string, 
  key?: string,              // Legacy support
  encryptedKey?: string,     // New encrypted format
  updatedAt: number 
}
```

### From 1.1.x to 1.2.0

**No breaking changes**. New features are additive:
- Library selector automatically defaults to 'vanilla'
- Existing sessions remain compatible
- Terminal commands are optional

---

## Future Roadmap

### v1.4.0 - Testing & Quality (Q1 2025)
- Jest + React Testing Library setup
- Unit tests for core components
- Integration tests for generation flow
- E2E tests with Playwright
- Code coverage reporting

### v1.5.0 - Developer Experience (Q2 2025)
- Session export/import (JSON format)
- Shareable session URLs
- Code diff viewer for variations
- Keyboard shortcuts system
- Command palette (Cmd+K)

### v1.6.0 - Framework Expansion (Q2 2025)
- Tailwind CSS support
- Bootstrap 5 components
- Ant Design integration
- Svelte component generation
- Vue 3 component support

### v2.0.0 - Ecosystem & Scale (Q3 2025)
- Multi-model support (Claude, GPT-4)
- Plugin system for custom generators
- Component library publishing
- Performance optimizations (virtualization)
- Advanced caching strategies
- Analytics dashboard (privacy-preserving)

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

For changelog entries:
- Use present tense ("Add feature" not "Added feature")
- Reference issue numbers when applicable
- Group changes by type (Added, Changed, Fixed, Security)
- Keep descriptions concise but informative

---

**[Unreleased]**: https://github.com/Krosebrook/Flash-UI/compare/v1.3.0...HEAD
**[1.3.0]**: https://github.com/Krosebrook/Flash-UI/compare/v1.2.1...v1.3.0
