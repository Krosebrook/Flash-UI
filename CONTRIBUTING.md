# Contributing to Flash UI

First off, thank you for considering contributing to Flash UI! It's people like you that make Flash UI such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How Can I Contribute?](#how-can-i-contribute)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a branch** for your changes
4. **Make your changes** following our guidelines
5. **Test your changes** thoroughly
6. **Submit a pull request**

## Development Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or compatible package manager
- Git
- A modern browser (Chrome, Firefox, Safari, or Edge)

### Setup Instructions

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Flash-UI.git
cd Flash-UI

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Project Structure

```
/Flash-UI
├── components/       # React components
├── contexts/         # React contexts
├── utils/            # Utility functions
├── public/           # Static assets
├── .github/          # GitHub configuration
└── docs/             # Documentation
```

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check the existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (browser, OS, device)
- Console errors if any

Use the bug report template provided in the repository.

### Suggesting Enhancements

Enhancement suggestions are welcome! When suggesting an enhancement:

- Use a clear and descriptive title
- Provide a detailed description of the proposed feature
- Explain why this enhancement would be useful
- Include mockups or examples if possible

Use the feature request template provided in the repository.

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `documentation` - Improvements to docs

### Pull Requests

1. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes** following our style guidelines

3. **Test your changes** thoroughly

4. **Commit your changes** with descriptive messages
   ```bash
   git commit -m "feat: add new component for X"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/my-new-feature
   ```

6. **Open a Pull Request** on GitHub

## Style Guidelines

### TypeScript/React

- **Use TypeScript** - Always provide proper types
- **No `any` types** - Use `unknown` or proper types
- **Component naming** - Use PascalCase for components
- **File naming** - Match component names (e.g., `MyComponent.tsx`)
- **Props interface** - Name as `ComponentNameProps`
- **Export style** - Use named exports for components

Example component:

```typescript
import React, { useState } from 'react';

interface MyComponentProps {
  title: string;
  onAction?: (value: string) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onAction 
}) => {
  const [state, setState] = useState<string>('');
  
  return (
    <div>
      <h2>{title}</h2>
      {/* Component implementation */}
    </div>
  );
};
```

### Code Style

- **Indentation** - 2 spaces
- **Semicolons** - Use them
- **Quotes** - Single quotes for strings
- **Arrow functions** - Prefer over function declarations
- **Async/await** - Prefer over promises when possible

### Comments

- Write self-documenting code when possible
- Add JSDoc comments for public APIs
- Explain "why" not "what" in comments
- Keep comments up-to-date with code changes

Example:

```typescript
/**
 * Generates a unique session ID using crypto API
 * @returns A cryptographically secure random string
 */
export function generateSessionId(): string {
  // Implementation
}
```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature change)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
feat(terminal): add command history navigation
fix(storage): resolve IndexedDB transaction race condition
docs(readme): update installation instructions
refactor(components): extract common hooks
```

### Guidelines

- Use imperative mood ("add" not "added")
- Keep subject line under 72 characters
- Reference issues and PRs in footer

## Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated if needed
- [ ] No new warnings or errors
- [ ] Tests added/updated (when applicable)
- [ ] All tests pass locally
- [ ] Accessibility checked
- [ ] Works in multiple browsers

### PR Requirements

1. **Descriptive title** - Clear and concise
2. **Description** - What and why
3. **Related issues** - Link related issues
4. **Testing** - How you tested the changes
5. **Screenshots** - For UI changes
6. **Breaking changes** - Document if any

### Review Process

1. At least one maintainer approval required
2. All CI checks must pass
3. No merge conflicts
4. Up-to-date with base branch

### After Approval

- Squash commits if requested
- Ensure CI still passes
- Maintainer will merge when ready

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

- Test behavior, not implementation
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

Example:

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render with title', () => {
    // Arrange
    const title = 'Test Title';
    
    // Act
    render(<MyComponent title={title} />);
    
    // Assert
    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
```

## Questions?

Feel free to:
- Open an issue with the `question` label
- Join our discussions
- Contact the maintainers

## Recognition

Contributors will be recognized in our README and release notes. Thank you for making Flash UI better!

---

**Happy Contributing! 🚀**
