# Contributing to Advisory System Frontend

Thank you for your interest in contributing! 🎉

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)

## 📜 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inspiring community for everyone.

### Our Standards
- ✅ Be respectful and inclusive
- ✅ Welcome newcomers
- ✅ Accept constructive criticism
- ✅ Focus on what is best for the community
- ❌ No harassment or trolling
- ❌ No political or offensive content

## 🤝 How to Contribute

### Reporting Bugs
1. Check if the bug has already been reported
2. Use the GitHub issue tracker
3. Provide detailed information:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Browser/OS information

### Suggesting Features
1. Check if the feature has already been requested
2. Create a new issue with the label "enhancement"
3. Describe the feature and its benefits
4. Provide examples or mockups if possible

### Code Contributions
1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeature`)
3. Make your changes
4. Write/update tests if applicable
5. Update documentation
6. Commit your changes
7. Push to your fork
8. Create a Pull Request

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)

### Setup Steps
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/advisorysystemfrontend.git
cd advisorysystemfrontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure
```
src/
├── components/   # Reusable UI components
├── pages/        # Page components
├── services/     # API service layer
├── App.jsx       # Root component
└── index.css     # Global styles
```

## 🔄 Pull Request Process

### Before Submitting
1. ✅ Update README.md if needed
2. ✅ Update CHANGELOG.md
3. ✅ Test your changes thoroughly
4. ✅ Ensure no console errors
5. ✅ Follow coding standards

### PR Guidelines
- Use a clear, descriptive title
- Reference related issues
- Provide a detailed description
- Include screenshots for UI changes
- Keep PRs focused (one feature/fix per PR)

### Review Process
1. Automated checks will run
2. Maintainers will review
3. Address feedback
4. Once approved, PR will be merged

## 💻 Coding Standards

### JavaScript/React
```javascript
// ✅ Good
const handleClick = async () => {
  try {
    const data = await fetchData();
    setData(data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// ❌ Bad
const handleClick=()=>{fetchData().then(d=>setData(d))}
```

### File Naming
- Components: PascalCase (`MyComponent.jsx`)
- Services: camelCase (`myService.js`)
- CSS: Match component name (`MyComponent.css`)

### Component Structure
```javascript
import React, { useState, useEffect } from 'react';
import { serviceName } from '../services';

const ComponentName = () => {
  // State
  const [data, setData] = useState(null);
  
  // Effects
  useEffect(() => {
    loadData();
  }, []);
  
  // Functions
  const loadData = async () => {
    // Implementation
  };
  
  // Render
  return (
    <div>
      {/* Content */}
    </div>
  );
};

export default ComponentName;
```

### CSS Guidelines
- Use CSS variables for colors
- Mobile-first responsive design
- Use utility classes when available
- Keep styles modular

## 📝 Commit Messages

### Format
```
type(scope): subject

body (optional)

footer (optional)
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(documents): add file preview functionality

fix(auth): resolve token expiration issue

docs(readme): update installation instructions

style(dashboard): improve card layout spacing
```

## 🧪 Testing

### Manual Testing
1. Test in multiple browsers
2. Test responsive design
3. Test all user flows
4. Check for console errors

### Future: Automated Testing
- Unit tests with Jest
- Component tests with React Testing Library
- E2E tests with Cypress

## 📚 Documentation

### Code Comments
```javascript
// ✅ Good: Explain why, not what
// Fetch data on mount to populate the dashboard
useEffect(() => {
  fetchData();
}, []);

// ❌ Bad: States the obvious
// This is a useEffect hook
useEffect(() => {
  fetchData();
}, []);
```

### README Updates
- Keep instructions clear and concise
- Update examples when APIs change
- Add screenshots for new features

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the project

## 💬 Questions?

- Open a GitHub issue
- Check existing documentation
- Contact the maintainers

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🚀
