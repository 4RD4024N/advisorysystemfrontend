# Advisory System Frontend

A comprehensive web application for managing student-advisor relationships in university settings.

## Features

- **Role-Based Access Control**: Separate interfaces for Students, Advisors, and Administrators
- **Course Management**: View and manage course schedules, enrollment, and academic planning
- **Document Sharing**: Upload, share, and manage academic documents
- **Real-time Notifications**: Stay updated with system announcements and deadlines
- **Student Tracking**: Advisors can monitor their assigned students' progress
- **Statistics & Analytics**: Visual insights into academic performance
- **Responsive Design**: Optimized for desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Backend API running (see [backend repository](https://github.com/yourusername/advisory-system-backend))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/advisorysystemfrontend.git
cd advisorysystemfrontend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Check TypeScript types
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate coverage report
```

### Code Quality

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for Git hooks
- **lint-staged** for pre-commit checks

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx
│   └── RoleBasedRoute.tsx
├── pages/           # Page components
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Students.tsx
│   └── ...
├── services/        # API service layer
│   ├── api.ts
│   ├── authService.ts
│   ├── courseService.ts
│   └── ...
├── utils/           # Utility functions
│   ├── logger.ts
│   └── fileValidation.js
├── test/            # Test utilities
│   └── setup.ts
├── App.tsx          # Root component
└── main.tsx         # Application entry point
```

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_URL=https://localhost:44375/api
VITE_APP_NAME=Advisory System
VITE_ENABLE_DEBUG_LOGS=false
```

### API Integration

The application connects to a REST API. Configure the base URL in `.env` or it defaults to `https://localhost:44375/api`.

All API calls are authenticated using JWT tokens stored in `localStorage`.

## Testing

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

Tests are written using:
- **Vitest** as the test runner
- **React Testing Library** for component testing
- **jsdom** for DOM simulation

## Building for Production

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

The optimized production files will be in the `dist/` directory.

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## User Roles

### Student
- View course schedules
- Submit assignments
- Access shared documents
- View notifications

### Advisor
- Monitor assigned students
- Review submissions
- Share documents
- Manage course schedules

### Administrator
- Manage user accounts
- Assign advisors to students
- System-wide configuration
- Access all features

## Security

- JWT-based authentication
- Role-based authorization
- Secure HTTP-only storage recommendations
- Input validation and sanitization

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite 5
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios
- **Routing**: React Router 6
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Support

For support, please open an issue on GitHub or contact the development team.

## Acknowledgments

- Built as a capstone project
- Thanks to all contributors

---

Made by the Advisory System Team

