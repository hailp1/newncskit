# 🏗️ NCSKIT Database Architecture

## 📊 **Tổng quan Database Schema**

### 🎯 **Mục tiêu thiết kế:**
- **Quản lý user** đầy đủ với roles và permissions
- **Quản lý dự án** từ planning đến publication
- **Collaboration** real-time giữa researchers
- **Document management** với version control
- **Reference management** tích hợp
- **Analytics và tracking** chi tiết
- **Security** với Row Level Security (RLS)

## 📋 **Database Tables (20+ tables)**

### 👥 **User Management**
```sql
users                 -- Core user profiles
institutions          -- Universities, research institutes
user_institutions     -- User-institution relationships
user_sessions         -- Session tracking
```

### 📊 **Project Management**
```sql
projects              -- Research projects
project_collaborators -- Team collaboration
milestones           -- Project milestones
tasks                -- Individual tasks
```

### 📝 **Document System**
```sql
documents            -- Research documents
document_versions    -- Version control
document_comments    -- Collaborative comments
document_citations   -- Reference citations
```

### 📚 **Reference Management**
```sql
references           -- Research references
journals             -- Journal database
journal_submissions  -- Submission tracking
```

### 🔔 **Communication & Analytics**
```sql
activities           -- User activity tracking
notifications        -- System notifications
files                -- File management
```

## 🔐 **Security Features**

### **Row Level Security (RLS)**
- ✅ Users can only access their own data
- ✅ Project-based access control
- ✅ Role-based permissions
- ✅ Institution-level access

### **User Roles**
```sql
user_role ENUM:
- 'student'           -- PhD/Master students
- 'researcher'        -- Research staff
- 'professor'         -- Faculty members
- 'admin'            -- System administrators
- 'institution_admin' -- Institution managers
```

### **Project Roles**
```sql
collaborator_role ENUM:
- 'owner'            -- Project owner
- 'co_investigator'  -- Co-PI
- 'researcher'       -- Research team member
- 'analyst'          -- Data analyst
- 'writer'           -- Writing contributor
- 'reviewer'         -- Reviewer only
- 'viewer'           -- Read-only access
```

## 📈 **Advanced Features**

### **Project Lifecycle Management**
```sql
project_status ENUM:
- 'planning'         -- Initial planning phase
- 'active'           -- Active research
- 'paused'           -- Temporarily paused
- 'completed'        -- Research completed
- 'archived'         -- Archived project
- 'cancelled'        -- Cancelled project

project_phase ENUM:
- 'conception'       -- Idea development
- 'planning'         -- Detailed planning
- 'execution'        -- Data collection/analysis
- 'analysis'         -- Data analysis
- 'writing'          -- Manuscript writing
- 'submission'       -- Journal submission
- 'published'        -- Published work
```

### **Document Management**
```sql
document_type ENUM:
- 'manuscript'       -- Research papers
- 'proposal'         -- Grant proposals
- 'methodology'      -- Method descriptions
- 'data_analysis'    -- Analysis reports
- 'presentation'     -- Conference presentations
- 'notes'            -- Research notes
- 'report'           -- Progress reports
```

### **Reference System**
```sql
reference_type ENUM:
- 'journal_article'  -- Peer-reviewed articles
- 'book'             -- Books
- 'book_chapter'     -- Book chapters
- 'conference_paper' -- Conference proceedings
- 'thesis'           -- PhD/Master theses
- 'report'           -- Technical reports
- 'website'          -- Web resources
- 'dataset'          -- Research datasets
```

## 🎯 **Sample Data Included**

### **Demo Users (4 accounts)**
| Email | Role | Institution | Subscription |
|-------|------|-------------|--------------|
| demo@ncskit.com | Researcher | NCSKIT University | Premium |
| researcher@ncskit.com | Professor | Tech Research Institute | Institutional |
| student@ncskit.com | Student | State University | Free |
| admin@ncskit.com | Admin | NCSKIT University | Enterprise |

### **Sample Projects (3 projects)**
1. **AI-Powered Healthcare Diagnosis System**
   - Owner: Demo User
   - Status: Active (65% complete)
   - Collaborators: 2 team members
   - Milestones: 3 (2 completed)

2. **Climate Change Impact Analysis**
   - Owner: Research Scientist
   - Status: Active (80% complete)
   - Focus: Big data analytics
   - Milestones: 2 (both completed)

3. **Genetic Markers in Cancer Research**
   - Owner: Graduate Student
   - Status: Planning (25% complete)
   - Focus: Biomarker discovery
   - Milestones: 1 (in progress)

### **Sample Content**
- ✅ **Documents**: Research proposals, methodologies, literature reviews
- ✅ **References**: High-impact journal articles with full metadata
- ✅ **Journals**: Q1/Q2 journals with impact factors
- ✅ **Activities**: User actions and project updates
- ✅ **Notifications**: Reminders and collaboration invites

## 🔧 **Technical Specifications**

### **Database Engine**
- **PostgreSQL** via Supabase
- **UUID** primary keys for all tables
- **JSONB** for flexible metadata storage
- **Arrays** for tags, keywords, permissions
- **Timestamps** with timezone support

### **Performance Optimizations**
- **Indexes** on frequently queried columns
- **GIN indexes** for array and JSONB columns
- **Composite indexes** for complex queries
- **Triggers** for automatic timestamp updates

### **Data Integrity**
- **Foreign key constraints** with CASCADE options
- **Check constraints** for data validation
- **Unique constraints** for business rules
- **Enum types** for controlled vocabularies

## 🚀 **Setup Instructions**

### **Method 1: Automated Setup**
```powershell
# Run the setup script
.\setup-complete-database.ps1
```

### **Method 2: Manual Setup**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run `frontend/database/complete-schema.sql`
4. Run `frontend/database/seed-data.sql`

### **Method 3: CLI Setup**
```bash
# Using Supabase CLI
supabase db reset
supabase db push
```

## 🧪 **Testing & Validation**

### **Connection Tests**
```bash
# Test database connection
cd frontend && node test-supabase-connection.js

# Test via web interface
http://localhost:3000/test-supabase
```

### **Data Validation**
- ✅ All tables created successfully
- ✅ Sample data inserted correctly
- ✅ RLS policies working
- ✅ Relationships established
- ✅ Indexes created

## 📊 **Database Statistics**

| Component | Count | Description |
|-----------|-------|-------------|
| **Tables** | 20+ | Core application tables |
| **Enums** | 15+ | Controlled vocabularies |
| **Indexes** | 30+ | Performance optimization |
| **Policies** | 25+ | Row Level Security |
| **Triggers** | 10+ | Automated updates |
| **Views** | 2+ | Common query patterns |

## 🎯 **Next Development Steps**

1. ✅ **Database Schema** - Complete
2. ⏳ **Frontend Integration** - Connect React components
3. ⏳ **API Development** - Build REST/GraphQL APIs
4. ⏳ **Authentication** - Integrate with Supabase Auth
5. ⏳ **Real-time Features** - WebSocket connections
6. ⏳ **Analytics Dashboard** - Data visualization
7. ⏳ **AI Integration** - Smart recommendations
8. ⏳ **Mobile App** - React Native/Flutter
9. ⏳ **Deployment** - Production environment

## 🏆 **Benefits of This Architecture**

### **For Researchers**
- 📊 Complete project lifecycle management
- 👥 Seamless collaboration tools
- 📝 Integrated document editing
- 📚 Comprehensive reference management
- 📈 Progress tracking and analytics

### **For Institutions**
- 🏢 Multi-project oversight
- 👨‍💼 Role-based access control
- 📊 Institutional analytics
- 🔒 Data security and compliance
- 💰 Resource allocation tracking

### **For Developers**
- 🏗️ Scalable architecture
- 🔐 Built-in security
- 📈 Performance optimized
- 🔧 Easy to extend
- 🧪 Well-tested foundation

---

**🎉 Kết luận:** Database architecture này cung cấp foundation hoàn chỉnh cho NCSKIT Research Management Platform, hỗ trợ tất cả các tính năng từ cơ bản đến nâng cao cho quản lý nghiên cứu khoa học.