# Contributing to AI Integration Map

Thank you for your interest in contributing. This document provides guidelines for contributing to the project.

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and considerate in communication
- Provide constructive feedback
- Focus on what is best for the project
- Show empathy towards other contributors

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git 2+
- Modern browser (Chrome, Firefox, Safari, Edge)

### Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/Flash-UI.git
cd Flash-UI

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Development Workflow

### Branch Naming

```
feature/description    # New features
fix/description        # Bug fixes
docs/description       # Documentation updates
refactor/description   # Code refactoring
```

### Making Changes

1. Create a branch from `main`
2. Make your changes
3. Test locally with `npm run dev`
4. Build to verify no errors: `npm run build`
5. Commit with clear messages
6. Open a Pull Request

---

## Code Standards

### TypeScript

- Strict mode enabled
- Explicit types for function parameters and return values
- Interfaces over type aliases for objects

### React

- Functional components with hooks
- PascalCase for component names
- Props interfaces named `ComponentNameProps`

### Formatting

- 2-space indentation
- Single quotes for strings
- No semicolons (unless required)
- Trailing commas in multiline structures

### File Organization

```
src/
├── components/     # UI components
│   ├── layout/     # Layout components
│   └── shared/     # Reusable components
├── pages/          # Route pages
├── hooks/          # Custom React hooks
├── data/           # Configuration and content
├── types/          # TypeScript interfaces
└── utils/          # Utility functions
```

---

## Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new ecosystem section
fix: correct navigation link
docs: update README
refactor: simplify filter hook
style: format CSS
chore: update dependencies
```

### Commit Message Structure

```
<type>: <description>

[optional body]

[optional footer]
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project standards
- [ ] Changes tested locally
- [ ] Build passes without errors
- [ ] Documentation updated if needed

### PR Description

Include:
- Summary of changes
- Motivation and context
- Testing performed
- Screenshots (for UI changes)

### Review Process

1. Submit PR against `main` branch
2. Maintainer reviews within 48 hours
3. Address feedback if requested
4. Maintainer merges when approved

---

## Adding Content

### New Ecosystem

1. Add interface to `src/types/index.ts` if needed
2. Add ecosystem data to `src/data/config.ts`
3. Update EcosystemsPage if display logic changes

### New Workflow

1. Add workflow object to `workflows.foh` or `workflows.boh` in config
2. Ensure all required fields are populated
3. FOHPage/BOHPage will automatically render new workflows

### New Tool

1. Add tool object to `toolAtlas` array in config
2. Include: name, category, ecosystems, notes

### New Page

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add nav item in `src/data/config.ts`

---

## Questions

For questions or discussions:

- Open a [GitHub Issue](https://github.com/Krosebrook/Flash-UI/issues)
- Start a [GitHub Discussion](https://github.com/Krosebrook/Flash-UI/discussions)

---

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
