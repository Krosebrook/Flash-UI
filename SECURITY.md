# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < 1.0   | :x:                |

**Note:** Flash UI is currently in active development. Once v1.0 is released, we will support the latest major version and one prior major version.

## Reporting a Vulnerability

The Flash UI team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:

**[INSERT SECURITY EMAIL HERE]**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include

Please include the following information in your report:

1. **Type of vulnerability** (e.g., XSS, CSRF, SQL injection, etc.)
2. **Full paths of source file(s)** related to the vulnerability
3. **Location of the affected source code** (tag/branch/commit or direct URL)
4. **Step-by-step instructions** to reproduce the issue
5. **Proof-of-concept or exploit code** (if possible)
6. **Impact of the issue**, including how an attacker might exploit it

This information will help us triage your report more quickly.

## Response Timeline

1. **Initial Response** - Within 48 hours
2. **Triage** - Within 1 week
3. **Fix Development** - Depends on severity and complexity
4. **Public Disclosure** - After fix is deployed

## Disclosure Policy

- We will coordinate the disclosure timeline with you
- We will credit you in the security advisory (unless you prefer to remain anonymous)
- We aim to disclose vulnerabilities within 90 days of initial report
- We will notify you when the vulnerability is fixed

## Security Best Practices for Contributors

When contributing to Flash UI, please follow these security best practices:

### 1. API Keys and Secrets

- **Never commit API keys** or secrets to the repository
- API keys should only be stored in IndexedDB (user's local storage)
- Use environment variables for build-time secrets (if any)
- Review code for accidentally committed credentials

### 2. Data Validation

- **Validate and sanitize all user inputs**
- Use TypeScript types for compile-time validation
- Implement runtime validation for external data
- Be cautious with `eval()` or `Function()` constructors

### 3. Dependencies

- **Keep dependencies up to date**
- Review dependency security advisories regularly
- Use `npm audit` to check for vulnerabilities
- Consider alternatives for packages with known issues

### 4. XSS Prevention

- **Avoid `dangerouslySetInnerHTML`** when possible
- Sanitize HTML content before rendering
- Use Content Security Policy headers
- Be careful with user-generated content

### 5. Iframe Security

Flash UI renders generated code in iframes:

- Always use `sandbox` attribute
- Restrict iframe permissions appropriately
- Validate content before injection
- Use `srcdoc` instead of `src` for inline content

### 6. Service Worker Security

- Implement proper HTTPS checks
- Validate cached content
- Use appropriate cache strategies
- Clear caches when necessary

### 7. Local Storage Security

- Store sensitive data in IndexedDB (already implemented)
- Encrypt sensitive data if needed
- Implement proper cleanup on logout
- Don't store credentials in localStorage

## Known Security Considerations

### Current Architecture

Flash UI is a **client-side application** with the following security model:

1. **API Keys** - Stored locally in user's IndexedDB
   - Not transmitted to any server
   - Remain on user's device
   - Cleared when user resets storage

2. **Generated Code** - Sandboxed in iframes
   - Limited permissions via `sandbox` attribute
   - Cannot access parent window
   - Isolated from main application

3. **No Backend** - No server-side storage
   - Reduces attack surface
   - No central point of compromise
   - User is responsible for their data

### Potential Risks

Users should be aware of:

1. **Local Storage** - Data stored locally can be accessed if device is compromised
2. **API Key Protection** - Users must protect their own API keys
3. **Generated Code** - AI-generated code should be reviewed before production use
4. **Browser Security** - Depends on browser security features

## Security Updates

- Security fixes will be released as soon as possible
- Users will be notified via GitHub Security Advisories
- Critical vulnerabilities will be highlighted in release notes
- We recommend watching this repository for security updates

## Security Features

Flash UI implements several security features:

- ✅ Sandboxed iframe execution for generated code
- ✅ IndexedDB for sensitive data storage
- ✅ No server-side data transmission
- ✅ Local-first architecture
- ✅ TypeScript for type safety
- ✅ Content Security Policy (planned)
- ✅ Regular dependency updates via Dependabot

## Contact

For security-related questions or concerns:

- **Security Issues:** [INSERT SECURITY EMAIL]
- **General Questions:** Open a GitHub issue with the `security` label

## Acknowledgments

We appreciate the security research community's efforts in keeping Flash UI and its users safe. Security researchers who responsibly disclose vulnerabilities will be acknowledged in our security advisories (with their permission).

---

**Last Updated:** 2024-12-29
