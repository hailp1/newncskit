# 🚀 NCSKit - Academic Research Collaboration Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![R](https://img.shields.io/badge/R-4.3+-blue.svg)](https://www.r-project.org/)

## 🎯 Overview

NCSKit is a comprehensive academic research collaboration platform featuring survey management, R-powered statistical analytics, professional blogging, and advanced administrative tools. Built with Next.js, TypeScript, and R for modern research workflows.

### ✨ Key Features

- **🔐 Authentication**: NextAuth with OAuth (Google, LinkedIn, ORCID)
- **📝 Blog Platform**: SEO-optimized blog with rich text editor
- **📊 Survey Builder**: Drag-and-drop survey creation and campaign management
- **📈 R Analytics**: Statistical analysis with SEM, Factor Analysis, and advanced visualizations
- **👨‍💼 Admin Panel**: User management and system configuration
- **🛡️ Security**: CSRF protection, rate limiting, and secure deployment

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│           Frontend (Next.js 14 + TypeScript + Prisma)           │
├─────────────────────────────────────────────────────────────────┤
│  NextAuth    │ Blog Platform │ Survey Builder │ Admin Panel     │
│  OAuth Flow  │ SEO Features  │ Campaign Mgmt  │ User Management │
└─────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   PostgreSQL    │ │   R Analytics   │ │   File Storage  │
│   (via Prisma)  │ │   Service       │ │   Static Assets │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 🛠️ Technology Stack

- **Next.js 14**: React framework with App Router and Server Components
- **TypeScript**: Type-safe development
- **Prisma**: Type-safe database ORM
- **PostgreSQL**: Primary database
- **NextAuth.js**: Authentication with OAuth support
- **R**: Statistical computing and analytics engine
- **Tailwind CSS**: Utility-first styling
- **Docker**: Containerization for R analytics service

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (for R analytics service)

### Local Development

1. **Clone and Install**
```bash
git clone <repository-url>
cd ncskit/frontend
npm install
```

2. **Setup Database**
```bash
# Create PostgreSQL database
createdb ncskit_db

# Configure environment
cp .env.example .env.local
# Edit .env.local with your database URL and OAuth credentials
```

3. **Initialize Database**
```bash
npx prisma migrate dev
npx prisma db seed
```

4. **Start Development Server**
```bash
npm run dev
```

5. **Start R Analytics Service** (optional)
```bash
cd ../r-analytics
docker-compose up
```

Visit http://localhost:3000 to see the application.

For detailed setup instructions, see [Local Setup Guide](docs/setup/local-setup.md).

## 📚 Documentation

All documentation is organized in the [docs/](docs/) directory:

### Getting Started
- **[Local Setup Guide](docs/setup/local-setup.md)** - Complete local development setup
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[API Documentation](docs/api/api-documentation.md)** - API endpoints and usage

### Troubleshooting
- **[Admin Issues](docs/troubleshooting/admin-issues.md)** - Admin panel problems and solutions
- **[Authentication Issues](docs/troubleshooting/authentication.md)** - Login and OAuth troubleshooting
- **[Performance Issues](docs/troubleshooting/performance.md)** - Performance optimization tips
- **[Known Issues](KNOWN_ISSUES.md)** - Current known issues and workarounds

### Migration & Testing
- **[Django to Node.js Migration](docs/migration/django-to-nodejs.md)** - Backend migration guide
- **[Supabase to NextAuth Migration](docs/migration/supabase-to-nextauth.md)** - Auth migration guide
- **[Testing Guide](docs/testing/testing-guide.md)** - Running and writing tests

### Additional Resources
- **[System Architecture](docs/SYSTEM_ARCHITECTURE.md)** - Technical architecture overview
- **[OAuth Setup](docs/OAUTH_SETUP.md)** - OAuth provider configuration
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project

## 🧪 Testing

```bash
cd frontend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Build verification
npm run build
```

See [Testing Guide](docs/testing/testing-guide.md) for detailed testing instructions.

## 🔧 Common Issues

Having trouble? Check these resources:

- **[Troubleshooting Guides](docs/troubleshooting/)** - Solutions to common problems
- **[Known Issues](KNOWN_ISSUES.md)** - Current known issues and workarounds
- **[Admin Issues](docs/troubleshooting/admin-issues.md)** - Admin panel specific problems
- **[Authentication Issues](docs/troubleshooting/authentication.md)** - Login and OAuth problems

If you can't find a solution, check the [GitHub Issues](https://github.com/your-org/ncskit/issues) or create a new one.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built with Next.js, TypeScript, Prisma, and R</strong><br>
  <em>Modern academic research collaboration platform</em>
</div>
