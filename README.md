# 🚀 NCSKIT - Academic Research Collaboration Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Django](https://img.shields.io/badge/Django-4.2+-green.svg)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)](https://ncskit.org)

## 🎯 Overview

NCSKit is a comprehensive academic research collaboration platform featuring survey management, data analytics, professional blogging, and advanced administrative tools. Built with modern web technologies and designed for scalability, security, and user experience.

### 🌟 **FINAL RELEASE - Version 1.0.0**

This is the **production-ready final release** of NCSKit with all core features implemented, tested, and documented. Ready for immediate deployment and use.

### ✨ Core Features

- **🔐 Complete Authentication System**: JWT + OAuth (Google, LinkedIn, ORCID) with secure session management
- **� Prâofessional Blog Platform**: SEO-optimized blog system with rich text editor and admin management
- **� Advuanced Survey Builder**: Drag-and-drop survey creation with campaign management and analytics
- **� BAdmin Management System**: Comprehensive user management, system configuration, and monitoring tools
- **� Datla Analytics Platform**: R-powered statistical analysis with advanced visualization and reporting
- **🏦 Question Bank System**: Reusable survey components and template gallery
- **🛡️ Enterprise Security**: CSRF protection, rate limiting, input validation, and secure deployment

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                Frontend (Next.js 14 + TypeScript)               │
├─────────────────────────────────────────────────────────────────┤
│  Auth System │ Blog Platform │ Survey Builder │ Admin Panel     │
│  OAuth Flow  │ SEO Features  │ Campaign Mgmt  │ User Management │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Backend API (Django 4.2 + DRF)                │
├─────────────────────────────────────────────────────────────────┤
│  JWT Auth    │  Blog API     │  Survey API    │  Analytics API  │
│  OAuth Views │  CRUD Ops     │  Campaigns     │  R Integration  │
└─────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   PostgreSQL    │ │   R Analytics   │ │   File Storage  │
│   Database      │ │   Engine        │ │   Static Assets │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **Django 4.2**: Web framework with REST API
- **Django REST Framework**: API development
- **PostgreSQL**: Primary database
- **R**: Statistical computing engine
- **JWT**: Authentication with refresh tokens
- **OAuth 2.0**: Google, LinkedIn, ORCID integration

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **NextAuth.js**: Authentication management
- **Zustand**: State management
- **Custom UI Components**: Accessible component library

### Infrastructure & Security
- **Docker**: Containerization and deployment
- **Nginx**: Web server and reverse proxy
- **Cloudflare**: SSL, CDN, and tunnel services
- **CSRF Protection**: Cross-site request forgery prevention
- **Rate Limiting**: API abuse prevention
- **Input Validation**: XSS and injection protection

## 🚀 Quick Start

### System Requirements
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (for production)
- R 4.3+ (for statistical analysis)

### Development Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd ncskit
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Database Configuration**
```bash
# Create PostgreSQL database
createdb ncskit_db

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials
```

4. **Run Migrations**
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic
```

5. **Frontend Setup**
```bash
cd ../frontend
npm install
cp .env.local.example .env.local
# Configure API endpoints in .env.local
```

6. **Start Development Servers**
```bash
# Terminal 1: Backend
cd backend
python manage.py runserver

# Terminal 2: Frontend  
cd frontend
npm run dev
```

### Production Deployment

For production deployment, use the automated deployment scripts:

```bash
# Quick production deployment
./deployment/start-ncskit-production.bat

# Setup Cloudflare tunnel
./deployment/setup-cloudflare-tunnel.bat

# Test deployment
./deployment/test-live-urls.bat
```

### Access Points
- **Application**: https://ncskit.org (production) / http://localhost:3000 (dev)
- **Admin Panel**: https://ncskit.org/admin
- **API Documentation**: https://api.ncskit.org/docs
- **Blog**: https://ncskit.org/blog

## 📚 Documentation

### Complete Documentation
- [📖 User Guide](docs/USER_GUIDE.md) - Complete user manual
- [🔧 Development Guide](DEVELOPMENT_GUIDE.md) - Developer instructions  
- [🏗️ System Architecture](docs/SYSTEM_ARCHITECTURE.md) - Technical architecture
- [🔌 API Documentation](docs/API_DOCUMENTATION.md) - API reference
- [🚀 Final Release Guide](FINAL_RELEASE_GUIDE.md) - Production deployment guide
- [✅ Release Checklist](RELEASE_CHECKLIST.md) - Pre-deployment verification

### Setup Guides
- [🔐 OAuth Setup](docs/OAUTH_SETUP.md) - OAuth provider configuration
- [🌐 OAuth Deployment](docs/OAUTH_DEPLOYMENT.md) - Production OAuth setup
- [☁️ Cloudflare Tunnel](docs/CLOUDFLARE_TUNNEL_GUIDE.md) - Secure tunnel setup

### Quick Links
- [🚀 Quick Start](#-quick-start)
- [🛡️ Security Features](#-security)
- [📊 Analytics Platform](#-analytics-platform)
- [🎯 Survey Management](#-survey-management)

## 📊 Analytics Platform

### Statistical Analysis Engine
- **R Integration**: Full R statistical computing environment
- **Advanced Analytics**: SEM, Factor Analysis, Reliability Analysis
- **Data Processing**: Large dataset handling with optimization
- **Reproducible Research**: Version control for analysis workflows
- **Export Capabilities**: Publication-ready reports and visualizations

### Survey Management
- **Drag-Drop Builder**: Intuitive survey creation interface
- **Campaign Management**: Multi-survey campaign orchestration
- **Template Gallery**: Pre-built survey templates
- **Response Analytics**: Real-time response monitoring
- **Question Bank**: Reusable survey components

### Visualization & Reporting
- **Interactive Dashboards**: Real-time data exploration
- **Custom Charts**: Publication-ready visualizations
- **Statistical Plots**: Advanced statistical visualizations
- **Export Options**: Multiple format support (PDF, PNG, SVG)
- **Automated Reports**: Scheduled report generation

## � ️ Security

### Authentication & Authorization
- **JWT Tokens**: Secure authentication with refresh mechanism
- **OAuth Integration**: Google, LinkedIn, ORCID providers
- **Role-Based Access**: Admin, user, and guest permissions
- **Session Management**: Secure session handling with HTTP-only cookies

### Security Measures
- **CSRF Protection**: Cross-site request forgery prevention
- **Rate Limiting**: API abuse prevention and DDoS protection
- **Input Validation**: XSS and SQL injection prevention
- **Secure Headers**: HSTS, CSP, and other security headers
- **Data Encryption**: At-rest and in-transit encryption

### Compliance & Monitoring
- **Audit Logging**: Comprehensive activity tracking
- **Security Monitoring**: Real-time threat detection
- **Data Privacy**: GDPR-compliant data handling
- **Vulnerability Management**: Regular security updates

## 🧪 Testing

### Automated Testing
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
npm run test:integration
npm run test:e2e

# Coverage reports
npm run test:coverage
```

### Testing Strategy
- **Unit Tests**: Core functionality testing
- **Integration Tests**: API and workflow testing
- **E2E Tests**: Complete user journey testing
- **Performance Tests**: Load and stress testing
- **Security Tests**: Vulnerability and penetration testing

## 📈 Performance & Scalability

### Performance Metrics
- **API Response Time**: < 500ms for most endpoints
- **Page Load Time**: < 2 seconds for initial load
- **Database Queries**: Optimized with indexing and caching
- **Static Assets**: CDN delivery via Cloudflare
- **Concurrent Users**: Supports 1000+ simultaneous users

### Optimization Features
- **Caching Strategy**: Multi-layer caching implementation
- **Database Optimization**: Query optimization and connection pooling
- **Asset Optimization**: Compressed and minified static assets
- **CDN Integration**: Global content delivery network
- **Load Balancing**: Horizontal scaling capabilities

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow TypeScript and Python coding standards
- Write comprehensive tests for new features
- Update documentation for any API changes
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🆘 Support & Resources

### Documentation & Help
- **Complete Documentation**: [docs/](docs/) directory
- **Final Release Guide**: [FINAL_RELEASE_GUIDE.md](FINAL_RELEASE_GUIDE.md)
- **Development Guide**: [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)
- **Release Checklist**: [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)

### Community & Issues
- **Issues**: [GitHub Issues](https://github.com/your-org/ncskit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/ncskit/discussions)
- **Email Support**: support@ncskit.org

## 🎉 Acknowledgments

- **Django Community**: Robust framework and rich ecosystem
- **Next.js Team**: Modern React framework with excellent performance
- **R Community**: Powerful statistical computing packages
- **Open Source Contributors**: All contributors who made this project possible

## 🚀 Production Status

### ✅ Ready for Production
- **Version**: 1.0.0 Final Release
- **Status**: Production Ready
- **Deployment**: Automated deployment scripts included
- **Documentation**: Complete setup and user guides
- **Security**: Enterprise-grade security implementation
- **Testing**: Comprehensive test coverage

### 🌐 Live Demo
- **Production Site**: https://ncskit.org
- **Admin Panel**: https://ncskit.org/admin
- **Blog Platform**: https://ncskit.org/blog
- **API Documentation**: https://api.ncskit.org/docs

---

<div align="center">
  <strong>🚀 NCSKit v1.0.0 - Production Ready Academic Research Platform</strong><br>
  <em>Built with modern technologies for scalability, security, and performance</em>
</div>