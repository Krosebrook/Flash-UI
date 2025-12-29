
# Flash UI Architecture

## Core Design Principles
Flash UI is a **Local-First, Edge-Optimized** application. It prioritizes user privacy and performance by offloading all state management to the client's browser.

### 1. Persistence Tier (Local-First)
- **Sessions**: Stored in `localStorage` under `flash_ui_sessions_v1`. Large component code is kept in the browser's persistent store.
- **Config**: Library preferences and quality toggles are synced locally.
- **API Keys**: Keys for the Terminal (other LLMs) are never sent to our backend; they remain strictly in the user's `localStorage`.

### 2. PWA Layer
- **Service Worker**: Caches the application shell (`sw.js`) for offline access.
- **Manifest**: Allows "Add to Home Screen" on mobile/desktop for a native-like experience.

### 3. API Terminal
The Terminal acts as a "Developer Console" for the app. It provides a CLI interface to manage environment variables without needing complex UI forms.
- `setkey`: Securely write to local storage.
- `reset`: Full purge of local state (Factory Reset).

### 4. Generation Pipeline
- **Orchestrator**: `App.handleSendMessage`
- **Generators**: Specific logic for Vanilla, MUI, Chakra, and Images.
- **Templates**: Code is injected into framework-specific HTML wrappers before being rendered in a sandboxed `iframe`.
