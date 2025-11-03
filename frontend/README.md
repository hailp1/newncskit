# NCSKIT Frontend - Research Management Platform

A modern, responsive web application built with Next.js and TypeScript for managing academic research workflows.

## 🚀 Features

- **Dashboard**: Comprehensive overview of research projects and activities
- **Project Management**: Create, track, and collaborate on research projects
- **Reference Manager**: Organize and manage research references with advanced search
- **Smart Editor**: AI-powered writing assistant with academic formatting
- **Journal Matcher**: Find suitable journals for paper submissions
- **Review Manager**: Handle peer review processes efficiently
- **Analytics**: Track productivity and research progress

## 🛠 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Icons**: Heroicons
- **UI Components**: Custom components with Headless UI

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── projects/      # Project management
│   │   ├── references/    # Reference manager
│   │   └── editor/        # Smart editor
│   ├── login/             # Authentication
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   ├── auth/             # Authentication components
│   └── dashboard/        # Dashboard-specific components
├── store/                # Zustand state management
├── types/                # TypeScript type definitions
└── lib/                  # Utility functions
```

## 🎨 Design System

The application uses a consistent design system with:

- **Colors**: Blue primary theme with semantic color tokens
- **Typography**: Inter font family for readability
- **Spacing**: Consistent spacing scale using Tailwind
- **Components**: Reusable UI components following accessibility best practices

## 🔧 Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 Authentication

The application includes a complete authentication system with:

- Login/logout functionality
- Protected routes with middleware
- User session management
- Role-based access control (planned)

## 📱 Responsive Design

The interface is fully responsive and optimized for:

- Desktop computers (1024px+)
- Tablets (768px - 1023px)
- Mobile devices (320px - 767px)

## 🎯 Key Components

### Dashboard
- Project overview cards
- Recent activity feed
- Upcoming deadlines
- Productivity metrics

### Project Management
- Project creation and editing
- Phase tracking (Planning → Execution → Writing → Submission → Management)
- Collaboration features
- Progress visualization

### Reference Manager
- Import references from various sources
- Advanced search and filtering
- Citation formatting
- Tag-based organization

### Smart Editor
- Rich text editing with academic formatting
- AI-powered writing suggestions
- Real-time grammar and style checking
- Citation management integration

## 🔮 Future Enhancements

- Real-time collaboration
- Advanced AI features
- Integration with external databases
- Mobile app companion
- Offline capabilities

## 🤝 Contributing

This is part of a larger research management platform. The frontend connects to:

- **Backend**: Django REST API with Python
- **Data Analysis**: R microservices
- **Database**: PostgreSQL
- **Desktop App**: Tauri with Rust

## 📄 License

This project is part of the NCSKIT research management platform.