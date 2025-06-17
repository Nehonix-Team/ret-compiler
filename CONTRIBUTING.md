# Contributing to Fortify Schema

Thank you for your interest in contributing to Fortify Schema. This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Guidelines](#development-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes) 
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn package manager
- TypeScript knowledge
- Git version control

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/fortify-schema.git
   cd fortify-schema
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run tests to ensure everything works:
   ```bash
   npm test
   ```

5. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Project Structure

```
src/core/schema/
├── src/
│   ├── core/
│   │   ├── schema/mode/interfaces/    # Core schema interfaces
│   │   ├── utils/                     # Utility functions
│   │   └── compiler/                  # TypeScript compiler integration
│   ├── types/                         # Type definitions
│   └── index.ts                       # Main exports
├── tests/                             # Test files
├── docs/                              # Documentation
├── examples/                          # Usage examples
├── TODO.md                            # Development roadmap
└── CONTRIBUTING.md                    # This file
```

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow existing code formatting
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep files under 500 lines (break into modules if needed)

### Architecture Principles

- **Modular Design**: Break functionality into focused modules
- **Type Safety**: Leverage TypeScript's type system fully
- **Performance**: Optimize for validation speed and bundle size
- **Backward Compatibility**: Avoid breaking changes
- **Clean APIs**: Keep public interfaces simple and intuitive

### File Organization

- **Core Logic**: Place in `src/core/schema/`
- **Utilities**: Place in `src/core/utils/`
- **Types**: Place in `src/types/`
- **Tests**: Mirror source structure in `tests/`
- **Examples**: Place in `examples/`

### Naming Conventions

- **Files**: Use PascalCase for classes, camelCase for utilities
- **Functions**: Use camelCase
- **Classes**: Use PascalCase
- **Constants**: Use UPPER_SNAKE_CASE
- **Types/Interfaces**: Use PascalCase

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --grep "Interface"

# Run tests in watch mode
npm run test:watch

# Run performance benchmarks
npm run benchmark
```

### Writing Tests

- Write tests for all new functionality
- Include both success and failure cases
- Test edge cases and error conditions
- Use descriptive test names
- Follow existing test patterns

### Test Structure

```typescript
describe('Feature Name', () => {
  describe('when condition', () => {
    it('should behave correctly', () => {
      // Arrange
      const input = createTestInput();
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

## Submitting Changes

### Pull Request Process

1. **Update Documentation**: Ensure README and docs reflect your changes
2. **Add Tests**: Include comprehensive tests for new functionality
3. **Update Examples**: Add or update examples if applicable
4. **Check TODO.md**: Update if your changes affect planned features
5. **Run Full Test Suite**: Ensure all tests pass
6. **Create Pull Request**: Use the provided template

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
```

### Commit Message Format

Use clear, descriptive commit messages:

```
type(scope): brief description

Longer description if needed.

Fixes #issue-number
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

## Issue Reporting

### Bug Reports

When reporting bugs, include:

1. **Clear Title**: Descriptive summary of the issue
2. **Environment**: Node.js version, OS, package version
3. **Steps to Reproduce**: Minimal code example
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Additional Context**: Screenshots, error messages, etc.

### Bug Report Template

```markdown
**Environment**
- Node.js version:
- Package version:
- Operating System:

**Description**
Clear description of the bug.

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Code Example**
```typescript
// Minimal reproducible example
```

**Additional Context**
Any other relevant information.
```

## Feature Requests

### Before Requesting

- Check existing issues and TODO.md
- Consider if the feature fits the project scope
- Think about backward compatibility
- Consider implementation complexity

### Feature Request Template

```markdown
**Feature Description**
Clear description of the proposed feature.

**Use Case**
Why is this feature needed? What problem does it solve?

**Proposed API**
```typescript
// Example of how the feature would be used
```

**Alternatives Considered**
Other approaches you've considered.

**Additional Context**
Any other relevant information.
```

## Development Workflow

### Working on Issues

1. **Comment on Issue**: Let others know you're working on it
2. **Create Branch**: Use descriptive branch names
3. **Make Changes**: Follow development guidelines
4. **Test Thoroughly**: Ensure quality and compatibility
5. **Submit PR**: Use the pull request template

### Code Review Process

- All changes require review before merging
- Address reviewer feedback promptly
- Maintain professional and constructive dialogue
- Be open to suggestions and improvements

### Release Process

- Releases follow semantic versioning
- Breaking changes require major version bump
- New features increment minor version
- Bug fixes increment patch version

## Getting Help

### Resources

- **Documentation**: Check the docs/ folder
- **Examples**: See examples/ folder
- **TODO.md**: Current development priorities
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions

### Contact

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Pull Requests**: For code contributions

## Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor graphs

Thank you for contributing to Fortify Schema and helping make TypeScript validation better for everyone.
