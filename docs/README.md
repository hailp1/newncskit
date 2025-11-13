# NCSKit Documentation

Welcome to the NCSKit documentation. This directory contains all project documentation organized by topic.

## Quick Links

### Setup & Deployment
- [Local Setup Guide](./setup/local-setup.md) - Get started with local development
- [Deployment Guide](../DEPLOYMENT.md) - Deploy to production

### Troubleshooting
- [Admin Issues](./troubleshooting/admin-issues.md) - Common admin panel problems
- [Authentication Issues](./troubleshooting/authentication.md) - Login and auth problems
- [Performance Issues](./troubleshooting/performance.md) - Slow pages and optimization

### Migration Guides
- [Django to Node.js](./migration/django-to-nodejs.md) - Backend migration guide
- [Supabase to NextAuth](./migration/supabase-to-nextauth.md) - Auth migration guide

### Testing
- [Testing Guide](./testing/testing-guide.md) - How to run and write tests

### API Documentation
- [API Documentation](./api/api-documentation.md) - API endpoints and usage

## Project Structure

```
docs/
├── README.md (this file)
├── setup/
│   ├── local-setup.md
│   └── deployment.md
├── troubleshooting/
│   ├── admin-issues.md
│   ├── authentication.md
│   └── performance.md
├── migration/
│   ├── django-to-nodejs.md
│   └── supabase-to-nextauth.md
├── testing/
│   └── testing-guide.md
└── api/
    └── api-documentation.md
```

## Contributing to Documentation

When adding new documentation:
1. Place it in the appropriate subdirectory
2. Update this README with a link
3. Use clear, concise language
4. Include code examples where helpful
5. Keep it up to date as the project evolves

## Getting Help

- Check [Known Issues](../KNOWN_ISSUES.md) for common problems
- Review troubleshooting guides in `troubleshooting/`
- Ask in the project's communication channels
