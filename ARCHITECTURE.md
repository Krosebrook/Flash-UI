# AI Integration Map — Architecture

## Overview

AI Integration Map is a static documentation platform built as a single-page application (SPA) with client-side routing. It provides enterprise AI operations documentation without backend dependencies.

---

## Design Principles

### 1. Configuration-Driven Content

All documentation content is centralized in `src/data/config.ts`. This enables:

- Single source of truth for all ecosystems, workflows, tools, and governance rules
- Type-safe content with TypeScript interfaces
- Easy updates without modifying component code
- Consistent data structures across the application

### 2. Component Composition

The UI follows a layered component architecture:

```
AppShell (layout)
└── Page Component (route-specific)
    └── Shared Components (Card, Badge, Callout, etc.)
        └── Utility Functions (cn, formatters, etc.)
```

### 3. Zero Backend Dependencies

- No API calls or external data fetching
- All content compiled into the JavaScript bundle
- Works offline once loaded
- No authentication or user accounts required

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    React Router                          │   │
│  │  /  /foh  /boh  /ecosystems  /tools  /governance  ...   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────┐     │
│  │                      App.tsx                           │     │
│  │              (Route Configuration)                     │     │
│  └───────────────────────────────────────────────────────┘     │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────┐     │
│  │                    AppShell                            │     │
│  │  ┌─────────────┐  ┌─────────────────────────────┐    │     │
│  │  │  Sidebar    │  │       Page Content           │    │     │
│  │  │  (Nav)      │  │  ┌─────────────────────┐    │    │     │
│  │  │             │  │  │   Page Component    │    │    │     │
│  │  │  - Overview │  │  │                     │    │    │     │
│  │  │  - FOH      │  │  │  ┌───────────────┐ │    │    │     │
│  │  │  - BOH      │  │  │  │ Shared Comps  │ │    │    │     │
│  │  │  - ...      │  │  │  │ Card, Badge   │ │    │    │     │
│  │  │             │  │  │  │ Callout, etc  │ │    │    │     │
│  │  └─────────────┘  │  │  └───────────────┘ │    │    │     │
│  │                    │  └─────────────────────┘    │    │     │
│  │                    └─────────────────────────────┘    │     │
│  └───────────────────────────────────────────────────────┘     │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────┐     │
│  │                   Data Layer                           │     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │     │
│  │  │ config.ts   │  │  types/     │  │  hooks/     │   │     │
│  │  │ (content)   │  │ (interfaces)│  │ (state)     │   │     │
│  │  └─────────────┘  └─────────────┘  └─────────────┘   │     │
│  └───────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx      # Main layout with sidebar + content area
│   │   └── index.ts          # Layout exports
│   ├── shared/
│   │   ├── ArtifactCard.tsx  # Content card component
│   │   ├── Badge.tsx         # Status/category badges
│   │   ├── Callout.tsx       # Info/warning callouts
│   │   ├── Card.tsx          # Generic card wrapper
│   │   ├── EmptyState.tsx    # Zero-content placeholder
│   │   ├── FloatingActionBar.tsx  # Contextual actions
│   │   └── index.ts          # Shared component exports
│   ├── DottedGlowBackground.tsx   # Canvas background animation
│   ├── Icons.tsx             # SVG icon components
│   └── index.ts              # All component exports
│
├── pages/
│   ├── OverviewPage.tsx      # /
│   ├── FOHPage.tsx           # /foh
│   ├── BOHPage.tsx           # /boh
│   ├── EcosystemsPage.tsx    # /ecosystems
│   ├── ToolsPage.tsx         # /tools
│   ├── GovernancePage.tsx    # /governance
│   ├── ObservabilityPage.tsx # /observability
│   ├── RunbooksPage.tsx      # /runbooks
│   └── DiagnosticsPage.tsx   # /diagnostics
│
├── hooks/
│   ├── useFilter.ts          # Filtering, search, pagination
│   ├── useLocalStorage.ts    # Persistent state
│   ├── useMobileNav.ts       # Responsive navigation
│   └── index.ts              # Hook exports
│
├── data/
│   ├── config.ts             # Central configuration object
│   └── index.ts              # Data exports
│
├── types/
│   └── index.ts              # TypeScript interfaces
│
├── utils/
│   ├── cn.ts                 # Class name concatenation
│   ├── copyToClipboard.ts    # Clipboard API wrapper
│   ├── escapeHtml.ts         # XSS prevention
│   ├── formatters.ts         # Date, number, badge formatting
│   └── index.ts              # Utility exports
│
├── App.tsx                   # Route configuration
├── index.tsx                 # Application entry point
└── index.css                 # Global styles
```

---

## Data Model

### Configuration Schema

```typescript
interface AppConfig {
  site: {
    title: string;
    subtitle: string;
    version: string;
    lastUpdatedISO: string;
    principles: string[];
    fourEcosystems: string[];
  };

  nav: NavItem[];
  ecosystems: Ecosystem[];
  governance: GovernanceConfig;
  observability: ObservabilityConfig;
  workflows: {
    foh: Workflow[];
    boh: Workflow[];
  };
  toolAtlas: Tool[];
}
```

### Key Interfaces

```typescript
interface Ecosystem {
  id: string;
  name: string;
  summary: string;
  coreSurfaces: string[];
  auditLogSources: string[];
  apiSurfaces: string[];
  approvalHotspots: string[];
  integrationBridge: string[];
}

interface Workflow {
  id: string;
  name: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  goal: string;
  intakeChannels: string[];
  dataSources: string[];
  automations: string[];
  approvals: string[];
  auditEvents: string[];
  slo: string;
}

interface Tool {
  name: string;
  category: string;
  ecosystems: string[];
  notes: string;
}
```

---

## Routing

React Router 7 handles client-side routing:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | OverviewPage | System principles, quick nav |
| `/foh` | FOHPage | Front-of-House workflows |
| `/boh` | BOHPage | Back-of-House workflows |
| `/ecosystems` | EcosystemsPage | Ecosystem deep-dives |
| `/tools` | ToolsPage | Tool Atlas |
| `/governance` | GovernancePage | Risk levels, approvals |
| `/observability` | ObservabilityPage | Audit schemas, logging |
| `/runbooks` | RunbooksPage | Operational procedures |
| `/diagnostics` | DiagnosticsPage | Health checks |

---

## State Management

The application uses minimal state:

1. **Route State**: Managed by React Router
2. **UI State**: Component-local `useState` hooks
3. **Filter State**: `useFilter` hook for search/filter/pagination
4. **Persistent State**: `useLocalStorage` for user preferences

No global state management library (Redux, Zustand) is required due to the static nature of the content.

---

## Styling

### CSS Architecture

- **CSS Variables**: Theme colors, spacing, typography in `:root`
- **Component Styles**: Scoped CSS classes per component
- **Utility Classes**: Common patterns (flex, grid, spacing)
- **Responsive Design**: Mobile-first with breakpoint utilities

### CSS Variable Reference

```css
:root {
  --bg: #09090b;
  --text: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.6);
  --accent: #f472b6;
  --accent-glow: rgba(244, 114, 182, 0.3);
  --border: rgba(255, 255, 255, 0.1);
  --card-bg: rgba(255, 255, 255, 0.03);
}
```

---

## Build Pipeline

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild'
  }
});
```

### Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js    # Application bundle
│   └── index-[hash].css   # Compiled styles
└── manifest.json          # PWA manifest
```

---

## Performance Considerations

### Bundle Size

- React 19 + React Router: ~45KB gzipped
- Application code: ~15KB gzipped
- Total: ~60KB gzipped

### Optimization Strategies

1. **Code Splitting**: Route-based lazy loading (future enhancement)
2. **Tree Shaking**: Vite eliminates unused exports
3. **Minification**: esbuild for fast, efficient minification
4. **Static Content**: No runtime data fetching overhead

---

## Extension Points

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/data/config.ts` nav array

### Adding New Content

1. Define TypeScript interface in `src/types/`
2. Add data to appropriate section in `src/data/config.ts`
3. Create or update page component to render new content

### Adding New Components

1. Create component in `src/components/shared/`
2. Export from `src/components/shared/index.ts`
3. Add styles to `index.css` or component-scoped CSS
