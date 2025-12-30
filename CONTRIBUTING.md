# Contributing to Flash UI

Thank you for your interest in contributing to Flash UI! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, background, or identity.

### Expected Behavior
- Be respectful and considerate in communication
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

### Unacceptable Behavior
- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Unprofessional conduct

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: v2.0.0 or higher
- **Browser**: Chrome/Firefox/Safari (latest versions)
- **Gemini API Key**: For testing generation features

### Initial Setup

1. **Fork the Repository**
   ```bash
   # Navigate to https://github.com/Krosebrook/Flash-UI
   # Click "Fork" button in top-right corner
   ```

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Flash-UI.git
   cd Flash-UI
   ```

3. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/Krosebrook/Flash-UI.git
   git remote -v  # Verify remotes
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Set Up Environment**
   ```bash
   # Create .env file
   echo "GEMINI_API_KEY=your_test_key_here" > .env
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

### Keeping Your Fork Updated
```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## Development Workflow

### Branch Strategy
We use a feature-branch workflow:

```
main (protected)
  ├─ feature/add-tailwind-support
  ├─ fix/service-worker-cache
  ├─ docs/update-readme
  └─ refactor/storage-context
```

### Creating a Feature Branch

```bash
# Always branch from latest main
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

### Branch Naming Convention
- `feature/` - New features (e.g., `feature/add-dark-mode`)
- `fix/` - Bug fixes (e.g., `fix/streaming-crash`)
- `docs/` - Documentation only (e.g., `docs/api-reference`)
- `refactor/` - Code refactoring (e.g., `refactor/extract-utils`)
- `test/` - Adding tests (e.g., `test/artifact-card`)
- `perf/` - Performance improvements (e.g., `perf/optimize-render`)

---

## Code Standards

### TypeScript Guidelines

**Type Safety**
```typescript
// ✅ Good - Explicit types
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// ❌ Bad - Using 'any'
function handleClick(data: any) { }

// ✅ Good - Proper typing
function handleClick(data: Artifact) { }
```

**Interfaces vs Types**
- Use `interface` for object shapes that may be extended
- Use `type` for unions, intersections, or primitives

```typescript
// Interfaces for component props
interface CardProps extends BaseProps {
  title: string;
}

// Types for unions
type Status = 'idle' | 'loading' | 'success' | 'error';
```

### React Best Practices

**Functional Components**
```typescript
// ✅ Good - Arrow function with types
const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact }) => {
  return <div>{artifact.styleName}</div>;
};

// ❌ Bad - Class components (avoid for new code)
class ArtifactCard extends React.Component { }
```

**Hooks Usage**
```typescript
// ✅ Good - Meaningful hook dependencies
useEffect(() => {
  loadData();
}, [dataId, config]);

// ❌ Bad - Missing dependencies or empty array when not needed
useEffect(() => {
  loadData();
}, []); // Missing dataId, config
```

**Memoization**
```typescript
// Use React.memo for expensive components
const ExpensiveCard = React.memo(({ data }) => {
  return <ComplexVisualization data={data} />;
});

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return expensiveProcessing(rawData);
}, [rawData]);
```

### Code Style

**Formatting**
- **Indentation**: 2 spaces (no tabs)
- **Line Length**: Soft limit of 100 characters
- **Quotes**: Single quotes for strings (except JSX uses double)
- **Semicolons**: Required
- **Trailing Commas**: Use for multiline

```typescript
// ✅ Good
const config = {
  library: 'vanilla',
  hq: false,
};

// ❌ Bad
const config = {
  library: "vanilla",
  hq: false
}
```

**Naming Conventions**
- **Components**: PascalCase (`ArtifactCard`, `KeyManager`)
- **Functions**: camelCase (`generateId`, `handleClick`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINT`, `MAX_RETRIES`)
- **Interfaces/Types**: PascalCase (`Artifact`, `Session`)
- **Files**: Match component name (`ArtifactCard.tsx`)

**Comments**
```typescript
// ✅ Good - Explains WHY, not WHAT
// Force resolution against window.location to ignore <base> tags
// that cause origin mismatches in Service Worker registration
const swUrl = new URL('sw.js', window.location.href).href;

// ❌ Bad - Obvious comment
// Set the URL to sw.js
const swUrl = 'sw.js';
```

**File Headers**
All source files should include the Apache 2.0 license header:
```typescript
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
```

### Security Guidelines

**Input Validation**
```typescript
// Always validate user input
const handlePassphrase = (input: string) => {
  if (input.length < 8) {
    throw new Error("Passphrase must be at least 8 characters");
  }
  // ... process
};
```

**Secret Handling**
```typescript
// ✅ Good - Clear sensitive data after use
setPassphrase(''); // SECURITY: Clear passphrase immediately

// ❌ Bad - Leaving secrets in memory
const passphrase = input; // Still accessible
```

**XSS Prevention**
```typescript
// ✅ Good - Sandboxed iframe
<iframe 
  srcDoc={code} 
  sandbox="allow-scripts allow-forms"
/>

// ❌ Bad - Direct DOM injection
<div dangerouslySetInnerHTML={{ __html: code }} />
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Build process, dependencies

### Examples

```bash
# Feature
git commit -m "feat(vault): add recovery code system"

# Bug fix
git commit -m "fix(sw): resolve cache invalidation on update"

# Documentation
git commit -m "docs(readme): add architecture diagrams"

# Breaking change
git commit -m "feat(storage)!: migrate to IndexedDB

BREAKING CHANGE: LocalStorage keys are no longer supported.
Users must migrate to Vault system."
```

### Commit Best Practices
- **Atomic commits**: One logical change per commit
- **Present tense**: "Add feature" not "Added feature"
- **Imperative mood**: "Fix bug" not "Fixes bug"
- **Reference issues**: "fix(auth): resolve #42"
- **Keep subject under 50 chars**
- **Body wraps at 72 chars**

---

## Pull Request Process

### Before Submitting

**1. Update Your Branch**
```bash
git fetch upstream
git rebase upstream/main
```

**2. Run Tests** (when available)
```bash
npm run test
npm run lint
```

**3. Build Successfully**
```bash
npm run build
```

**4. Test Locally**
- Verify feature works as expected
- Test on multiple browsers (Chrome, Firefox, Safari)
- Check mobile responsiveness
- Verify no console errors

### Creating the PR

**1. Push to Your Fork**
```bash
git push origin feature/your-feature-name
```

**2. Open PR on GitHub**
- Navigate to your fork on GitHub
- Click "Compare & pull request"
- Select base: `Krosebrook/Flash-UI:main`
- Select compare: `your-fork:feature/your-feature-name`

**3. Fill Out PR Template**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature)
- [ ] Documentation update

## Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on mobile
- [ ] Added/updated tests

## Screenshots (if applicable)
![Before/After comparison]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex sections
- [ ] Updated documentation
- [ ] No breaking changes (or documented)
- [ ] Tests pass locally
```

### PR Requirements

**Must Have:**
- Clear description of changes
- Reference to related issue (if applicable)
- No merge conflicts
- All checks passing (when CI is set up)

**Nice to Have:**
- Screenshots/GIFs for UI changes
- Performance benchmarks for optimizations
- Before/after comparisons

### Review Process

1. **Automated Checks** (future): Linting, tests, build
2. **Code Review**: Maintainer reviews code quality
3. **Testing**: Functionality verification
4. **Approval**: At least one maintainer approval required
5. **Merge**: Squash and merge by maintainer

### After Merge

```bash
# Update your local main
git checkout main
git pull upstream main

# Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## Testing

### Current State
⚠️ **Tests not yet implemented** - this is a high-priority contribution area!

### Testing Roadmap

**Unit Tests (Jest + React Testing Library)**
```typescript
// Example test structure (future)
describe('ArtifactCard', () => {
  it('should render artifact content', () => {
    const artifact = { id: '1', html: '<div>Test</div>', status: 'complete' };
    render(<ArtifactCard artifact={artifact} />);
    expect(screen.getByTestId('artifact-1')).toBeInTheDocument();
  });
});
```

**Integration Tests**
- Component interaction flows
- Context provider behavior
- Storage persistence

**E2E Tests (Playwright)**
- Full generation workflow
- Vault unlock/lock cycle
- Session navigation

### Manual Testing Checklist

When making changes, verify:

**Core Functionality**
- [ ] Generate artifacts in all 4 modes (Vanilla, MUI, Chakra, Image)
- [ ] Streaming works correctly
- [ ] Focus mode enters/exits properly
- [ ] Navigation between sessions works
- [ ] Regeneration functions

**Vault**
- [ ] Initialize new vault with passphrase
- [ ] Add/view/delete API keys
- [ ] Unlock with correct passphrase
- [ ] Recovery code works
- [ ] Incorrect passphrase shows error

**Terminal**
- [ ] All commands execute correctly
- [ ] Command history works (Arrow keys)
- [ ] Tab completion works
- [ ] Error messages display properly

**PWA**
- [ ] App installs correctly
- [ ] Offline mode works
- [ ] Service Worker updates properly
- [ ] Manifest loads correctly

**Browser Compatibility**
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Documentation

### Types of Documentation

**1. Code Comments**
- Use for complex logic that isn't self-explanatory
- Explain WHY, not WHAT
- Include references to issues/decisions

**2. README Updates**
- For new features visible to users
- Setup/installation changes
- Breaking changes

**3. API Documentation**
- For new components or hooks
- Props interfaces with descriptions
- Usage examples

**4. Architecture Docs**
- Major structural changes
- New design patterns
- Performance considerations

### Documentation Standards

**Component Documentation**
```typescript
/**
 * ArtifactCard displays a generated UI component in a sandboxed iframe.
 * 
 * @component
 * @example
 * ```tsx
 * <ArtifactCard 
 *   artifact={myArtifact} 
 *   isFocused={false}
 *   onClick={() => setFocus()} 
 * />
 * ```
 */
interface ArtifactCardProps {
  /** The artifact data to display */
  artifact: Artifact;
  /** Whether this card is currently focused */
  isFocused: boolean;
  /** Callback when card is clicked */
  onClick: () => void;
}
```

---

## Getting Help

### Resources
- **Documentation**: Check README.md and ARCHITECTURE.md first
- **Issues**: Search existing issues for similar problems
- **Discussions**: Use GitHub Discussions for questions

### Asking Questions

**Good Question:**
```
Title: How to add a new UI framework?

I want to add support for Tailwind CSS. I've reviewed `wrapCodeInLibraryTemplate()` 
and see how MUI/Chakra are implemented. 

Questions:
1. Should Tailwind use CDN or local bundling?
2. Does it need a template wrapper like React frameworks?
3. Where should I add the library icon?

Context: I've tested locally with CDN approach and it works.
```

**Not Helpful:**
```
Title: Help
My code doesn't work. What do I do?
```

---

## Recognition

Contributors will be recognized in:
- GitHub Contributors page
- CHANGELOG.md for significant contributions
- README.md acknowledgments section

---

## License

By contributing to Flash UI, you agree that your contributions will be licensed under the Apache License 2.0.

---

**Questions?** Open a [GitHub Discussion](https://github.com/Krosebrook/Flash-UI/discussions) or reach out to [@ammaar](https://x.com/ammaar).

**Thank you for contributing! 🚀**
