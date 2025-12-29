# Flash UI

[![CI](https://github.com/Krosebrook/Flash-UI/actions/workflows/ci.yml/badge.svg)](https://github.com/Krosebrook/Flash-UI/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Krosebrook/Flash-UI/actions/workflows/codeql.yml/badge.svg)](https://github.com/Krosebrook/Flash-UI/actions/workflows/codeql.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

> A high-performance generative interface builder powered by Google Gemini

Flash UI is a Progressive Web App that lets you generate beautiful, production-ready UI components using natural language. Choose from vanilla HTML/CSS, Material UI, Chakra UI, or even generate high-fidelity images.

## ✨ Features

### 🎨 Multi-Library Generation
Choose between three code-generation modes and one asset-generation mode:
- **F (Vanilla)**: Standard HTML/CSS with modern layouts (Flexbox/Grid).
- **M (Material UI)**: Production-ready React components using MUI v5.
- **C (Chakra UI)**: Accessible and themeable React components.
- **I (AI Image)**: High-fidelity visual asset generation (720p to 1K resolution).

### 🔄 Design Variations Engine
The Variations engine allows you to iterate on a concept without losing your progress:
- **Radical Conceptualization**: Gemini generates three distinct design archetypes (e.g., Brutalist vs. Glassmorphic) for your prompt.
- **Aesthetic Steering**: Add keywords like "Neo-Retro," "Bento Grid," or "Cyberpunk" to steer the variations towards a specific look.

### 📦 Artifact Management
- **Streaming Previews**: Watch code being written in real-time.
- **Focus Mode**: Click any artifact to see it full-screen and access the Variations and Source Code tools.
- **Retry Logic**: If a generation fails or is blocked by safety filters, use the "Regenerate" button to re-trigger the engine with adjusted parameters.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or compatible package manager
- Modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/Krosebrook/Flash-UI.git
cd Flash-UI

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## 📖 Documentation

- **[Architecture Guide](ARCHITECTURE.md)** - Technical architecture and design decisions
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[Security Policy](SECURITY.md)** - Security practices and reporting vulnerabilities
- **[Audit & Recommendations](AUDIT_AND_RECOMMENDATIONS.md)** - Comprehensive codebase analysis

## 🛠️ Tech Stack

- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite 6
- **Storage:** IndexedDB (Dexie.js) + LocalStorage
- **AI Provider:** Google Gemini API
- **PWA:** Service Worker + Web App Manifest

## 📁 Project Structure

```
Flash-UI/
├── components/          # React components
├── contexts/            # React contexts (StorageContext, etc.)
├── utils/               # Utility functions
├── public/              # Static assets
├── .github/             # GitHub configuration
├── README.md            # This file
├── ARCHITECTURE.md      # Architecture documentation
└── package.json         # Project dependencies
```

---

## 🎯 Component Reference

### ArtifactCard
Manages the lifecycle of a design result.
- **Iframe Sandboxing**: Ensures generated code cannot interfere with the main app's DOM or styles.
- **Automatic Code Streaming**: Proxies the model's text output into a syntax-highlighted terminal overlay.

### SideDrawer
Used for high-density tools:
- **Code Mode**: Raw source code with one-click copy.
- **Variations Mode**: Live design playground to swap archetypes.

### DottedGlowBackground
A high-performance HTML5 Canvas background.
- **DPI Aware**: Automatically scales for Retina displays.
- **Physics Sim**: Dots pulse based on an internal clock, creating a living "AI heartbeat" atmosphere.

## 🐛 Troubleshooting
If you find the output quality is not meeting expectations:
1. **Be Specific**: Instead of "Make a button," try "Generate a high-contrast 'Purchase' button with a glowing border and a hover animation using CSS transitions."
2. **Steer the Aesthetics**: Use the Variations tool and input keywords like "Industrial Minimalist" or "Modern SaaS Dashboard."
3. **HQ Mode (Images)**: For Image generation, ensure HQ is enabled to use the Pro model for sharper details.
4. **Safety Blocks**: If you see a "Safety Filter" error, try rephrasing technical terms that might be misinterpreted by the model's filters.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Code style and conventions
- Submitting pull requests
- Reporting bugs and requesting features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** - AI-powered generation engine
- **React Team** - For the amazing React framework
- **Vite Team** - For the blazing-fast build tool
- **Open Source Community** - For the countless libraries that make this possible

## 📞 Support

- **Documentation:** Check our [docs](ARCHITECTURE.md)
- **Issues:** [GitHub Issues](https://github.com/Krosebrook/Flash-UI/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Krosebrook/Flash-UI/discussions)

## 🗺️ Roadmap

- [ ] Testing infrastructure (Vitest + React Testing Library)
- [ ] Component test coverage >80%
- [ ] Feature-based directory structure
- [ ] Storybook integration
- [ ] Theme customization
- [ ] Export to CodeSandbox/StackBlitz
- [ ] Plugin system for custom generators

---

**Built with ❤️ by the Flash UI Team**