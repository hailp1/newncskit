# 🚀 NCSKit - Complete Research Platform

<div align="center">

![NCSKit Logo](https://img.shields.io/badge/NCSKit-Research%20Platform-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

**A comprehensive integrated system for scientific research - from design to analysis**

[🎯 Features](#-features) • [🚀 Quick Start](#-quick-start) • [📚 Documentation](#-documentation) • [🛠️ Tech Stack](#️-tech-stack)

</div>

---

## 🎯 Features

### ✅ Complete Research Workflow
- **Project Management** - Full lifecycle research project management
- **Survey Builder** - Intelligent survey creation with question banks
- **Campaign System** - Community-driven data collection with token rewards
- **Statistical Analysis** - Integrated R analysis server
- **Admin Dashboard** - Comprehensive system management
- **Blog System** - Built-in CMS with SEO optimization

### 🔥 Key Highlights
- **Token Economy** - Reward participants with configurable admin fees
- **Multi-language** - Vietnamese and English support
- **Docker Ready** - Containerized deployment
- **Production Ready** - Enterprise-grade security and performance
- **Comprehensive Docs** - 15+ detailed guides

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Docker Desktop
- Git

### One-Command Setup
```bash
# Clone and setup
git clone https://github.com/yourusername/ncskit.git
cd ncskit

# Auto setup (Windows)
setup-new-machine.bat

# Auto setup (Linux/Mac)
chmod +x setup-new-machine.sh && ./setup-new-machine.sh
```

### Manual Setup
```bash
# 1. Install dependencies
cd frontend && npm install
cd ../backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# 2. Start services
docker-compose up -d                    # Database
python backend/manage.py runserver      # Backend API
npm run dev --prefix frontend           # Frontend

# 3. Access application
# Frontend: http://localhost:3000
# Admin: http://localhost:8000/admin
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **UI**: Custom components + Headless UI

### Backend
- **Framework**: Django 4.2 + Django REST Framework
- **Database**: PostgreSQL 15
- **Cache**: Redis
- **Auth**: JWT tokens

### Analysis
- **Engine**: R 4.3 with Plumber
- **Libraries**: dplyr, ggplot2, psych, lavaan
- **Endpoints**: Statistical analysis APIs

### DevOps
- **Containers**: Docker + Docker Compose
- **Database**: PostgreSQL with migrations
- **Deployment**: Production-ready configuration

## 📊 Project Structure

```
ncskit/
├── 📁 frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/                # App router pages
│   │   ├── components/         # React components
│   │   └── services/          # API services
│   └── package.json
├── 📁 backend/                 # Django application
│   ├── apps/
│   │   ├── authentication/    # User management
│   │   ├── projects/         # Project management
│   │   ├── surveys/          # Survey campaigns
│   │   └── analytics/        # Data analysis
│   ├── ncskit_backend/       # Django settings
│   └── requirements.txt
├── 📁 docs/                   # Documentation
├── 🐳 docker-compose.yml      # Docker configuration
└── 📋 README.md               # This file
```

## 📚 Documentation

### Quick References
- [🚀 Quick Start Guide](QUICK_START_GUIDE.md) - Get up and running in 5 minutes
- [📋 Transfer Checklist](TRANSFER_CHECKLIST.md) - Complete migration guide
- [🔧 Troubleshooting](TROUBLESHOOTING_COMMANDS.md) - Fix common issues

### Comprehensive Guides
- [📖 User Guide](docs/USER_GUIDE.md) - Complete user manual
- [🏗️ System Architecture](docs/SYSTEM_ARCHITECTURE.md) - Technical overview
- [🔌 API Documentation](docs/API_DOCUMENTATION.md) - API reference
- [🚀 Deployment Guide](DEPLOYMENT_INSTRUCTIONS.md) - Production deployment

## 🎯 Use Cases

### For Researchers
- Design and manage research projects
- Create surveys with theoretical frameworks
- Collect data from community participants
- Perform statistical analysis with R

### For Institutions
- Manage multiple research projects
- Track progress and milestones
- Generate reports and publications
- Administer token-based rewards

### For Participants
- Participate in research surveys
- Earn token rewards
- Track participation history
- Access research results

## 🔒 Security Features

- JWT-based authentication
- CORS protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Rate limiting
- Audit logging

## 📈 Performance

- Optimized database queries
- Redis caching
- CDN-ready static assets
- Docker containerization
- Horizontal scaling ready

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/yourusername/ncskit.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git commit -m "Add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by research workflow needs
- Community-driven development
- Open source contributions welcome

## 📞 Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/yourusername/ncskit/issues)
- 💬 [Discussions](https://github.com/yourusername/ncskit/discussions)

---

<div align="center">

**Made with ❤️ for the research community**

[⭐ Star this repo](https://github.com/yourusername/ncskit) • [🍴 Fork it](https://github.com/yourusername/ncskit/fork) • [📢 Share it](https://twitter.com/intent/tweet?text=Check%20out%20NCSKit%20-%20Complete%20Research%20Platform)

</div>