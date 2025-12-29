
# Flash UI Architecture

## Core Design Principles
Flash UI is a **Local-First, Edge-Optimized** application. It prioritizes user privacy and performance by offloading all state management to the client's browser.

### 1. Persistence Tier (Multi-Layer Storage)
To optimize for both speed and security, the application uses a tiered storage strategy:

- **IndexedDB (via Dexie.js)**: 
  - **API Keys**: Sensitive credentials for third-party providers (OpenAI, Anthropic, etc.) are stored in a structured IndexedDB table. This is more secure and performant than localStorage for binary/large data and prevents issues with size limits.
  - **Schema**: Managed via Dexie versions for reliable migrations.
  
- **LocalStorage**:
  - **Sessions**: Stored under `flash_ui_sessions_v1`. Contains recent prompts and generated artifact history.
  - **Config**: UI preferences, library selection (Vanilla, MUI, Chakra), and quality settings.

### 2. PWA Layer
- **Service Worker**: Caches the application shell (`sw.js`) for offline access. Implements a "cache-first" strategy for static assets.
- **Manifest**: Declares the app as a standalone entity, enabling installation on mobile and desktop OS.

### 3. API Terminal
The Terminal acts as a "Developer Console" for the app. It provides a CLI interface to manage sensitive environment variables without needing complex UI forms or risking cloud exposure.
- `setkey`: Asynchronously write to IndexedDB.
- `listkeys`: Query local database for configured providers.
- `reset`: Atomic wipe of all storage layers (LocalStorage + IndexedDB).

### 4. Generation Pipeline
- **Orchestrator**: `App.handleSendMessage`. Handles the state machine for multi-artifact generation.
- **Generators**: Specialized prompts for Vanilla HTML, MUI (React), Chakra UI (React), and Gemini Imaging models.
- **Templates**: Code is dynamically injected into framework-specific HTML wrappers and rendered inside sandboxed `iframes` to prevent XSS and style leakage.
