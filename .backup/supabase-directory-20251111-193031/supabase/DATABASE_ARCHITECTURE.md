# NCSKIT Database Architecture

## Overview

Complete database schema for NCSKIT research platform with comprehensive features for user management, analysis workflows, blog system, payments, and AI assistance.

## Migration Files

### 1. `20240107_complete_database_schema.sql`
**Core System Foundation**
- User profiles and authentication
- Admin roles and permissions
- Business domains and marketing models
- Projects and datasets
- Token system (packages, transactions, pricing)
- Feature permissions and usage tracking
- Referral system
- Blog posts (basic structure)
- CSV analysis tables (basic)
- Cache and performance tables

### 2. `20240108_blog_permissions_enhancement.sql`
**Blog & Content Management System**
- Enhanced post permissions (granular access control)
- Post activity logging and audit trail
- Categories and tags with hierarchy
- Comments system with moderation
- Likes and bookmarks
- Admin/moderator role-based access
- RLS policies for content management

### 3. `20240109_analysis_workflow_enhancements.sql`
**Advanced Analysis Features**
- Data health reports and quality tracking
- Variable grouping suggestions (AI-powered)
- Analysis job tracking and progress
- Export history (Excel, PDF, CSV)
- Analysis templates for common scenarios
- Activity logging and audit trail
- Correlation caching for performance
- Analysis notes and annotations
- Project sharing and collaboration
- Industry benchmarks

### 4. `20240110_complete_system_features.sql`
**Additional System Features**
- Notifications system
- Payment and subscription management
- AI assistant and chat conversations
- Research outline generation
- Literature sources and references
- Project collaboration (comments, activity)
- System settings and configuration
- Feature flags for gradual rollout
- User analytics and metrics

## Database Structure

### Total Tables: 60+

## Core Modules

### 1. User Management (8 tables)
```
profiles
├── admin_roles
├── admin_permissions
├── admin_logs
├── permissions
├── referrals
├── referral_rewards
└── user_feature_usage
```

**Key Features:**
- Role-based access control (user, admin, moderator)
- Token balance and tier system
- Referral tracking and rewards
- Activity and login tracking
- Preferences and privacy settings

### 2. Blog & Content (10 tables)
```
posts
├── post_permissions
├── post_activity_log
├── post_categories
├── post_tags
├── post_category_mapping
├── post_tag_mapping
├── post_comments
├── post_likes
└── post_bookmarks
```

**Key Features:**
- Granular permission system
- Category hierarchy support
- Comment moderation workflow
- Activity audit trail
- User engagement tracking

### 3. Analysis Workflow (15 tables)
```
analysis_projects
├── analysis_variables
├── variable_groups
├── demographic_ranks
├── ordinal_categories
├── analysis_configurations
├── analysis_results
├── data_health_reports
├── variable_group_suggestions
├── analysis_jobs
├── analysis_exports
├── analysis_templates
├── analysis_activity_log
├── variable_correlations
├── analysis_notes
└── analysis_project_shares
```

**Key Features:**
- CSV upload and parsing
- Automatic data health checks
- AI-powered variable grouping
- Demographic configuration with custom ranks
- Multiple analysis types (descriptive, EFA, CFA, SEM, etc.)
- Export to Excel/PDF
- Project sharing and collaboration
- Template-based workflows

### 4. Projects & Research (8 tables)
```
projects
├── datasets
├── project_collaborators
├── research_outlines
├── outline_versions
├── project_references
├── project_comments
└── project_activity
```

**Key Features:**
- Multi-user collaboration
- Research outline generation
- Version control for outlines
- Literature reference management
- Activity tracking

### 5. Token & Payment System (5 tables)
```
token_packages
├── token_transactions
├── token_pricing
├── payment_transactions
└── subscription_history
```

**Key Features:**
- Token purchase and spending
- Subscription management
- Transaction history
- Pricing configuration
- Referral rewards

### 6. AI & Assistance (3 tables)
```
ai_conversations
├── ai_messages
└── literature_sources
```

**Key Features:**
- Context-aware conversations
- Token usage tracking
- Literature search integration

### 7. Notifications & Analytics (4 tables)
```
notifications
├── user_analytics
├── system_metrics
└── analysis_benchmarks
```

**Key Features:**
- Multi-type notifications
- User behavior tracking
- System performance metrics
- Industry benchmarks

### 8. System Configuration (3 tables)
```
system_settings
├── feature_flags
└── analytics_cache
```

**Key Features:**
- Dynamic configuration
- Feature rollout control
- Performance caching

## Key Design Patterns

### 1. Row Level Security (RLS)
All tables have RLS enabled with policies ensuring:
- Users can only access their own data
- Admins have elevated permissions
- Shared resources respect permission levels
- Public data is accessible to all

### 2. Audit Trails
Activity logging for:
- Post modifications
- Analysis executions
- Project changes
- User actions

### 3. Soft Deletes & Status Tracking
Most entities use status fields instead of hard deletes:
- `posts.status`: draft, published, archived
- `analysis_projects.status`: draft, configured, analyzing, completed
- `notifications.is_read`: tracking read status

### 4. JSONB for Flexibility
Used for:
- Configuration storage
- Analysis results
- Metadata and preferences
- Dynamic settings

### 5. Caching Strategy
- `analytics_cache`: R Analytics results
- `variable_correlations`: Correlation calculations
- Expires_at timestamps for automatic cleanup

## Helper Functions

### Analysis Functions
- `calculate_data_quality_score()`: Calculate 0-100 quality score
- `get_project_statistics()`: Comprehensive project stats
- `log_analysis_activity()`: Auto-logging trigger
- `clean_expired_exports()`: Cleanup old exports
- `get_user_recent_projects()`: Recent project list

### Blog Functions
- `is_admin_or_moderator()`: Role checking
- `is_admin()`: Admin-only checking
- `has_post_permission()`: Permission verification
- `log_post_activity()`: Auto-logging for posts

### System Functions
- `mark_notification_read()`: Update notification status
- `get_unread_notification_count()`: Count unread
- `create_notification()`: Create new notification
- `is_feature_enabled()`: Feature flag checking
- `log_user_event()`: Analytics event logging
- `get_user_subscription_status()`: Subscription info

## Indexes Strategy

### Performance Indexes
- Foreign keys: All have indexes
- Timestamps: created_at, updated_at (DESC)
- Status fields: For filtering
- User lookups: user_id columns
- Full-text search: Using GIN indexes

### Composite Indexes
- `(project_id, user_id)`: For collaboration
- `(variable1_id, variable2_id, method)`: For correlations
- `(start_date, end_date)`: For subscriptions

## Data Types

### UUID
- Primary keys for most tables
- User references
- Project and resource IDs

### JSONB
- Flexible configuration storage
- Analysis results
- Metadata and preferences

### Arrays
- `TEXT[]`: Tags, keywords, permissions
- `INTEGER[]`: Selected models, analyses

### Enums (CHECK constraints)
- Status values
- Role types
- Analysis types
- Permission levels

## Security Features

### 1. Row Level Security
- Enabled on all user-facing tables
- Policies enforce data isolation
- Admin override capabilities

### 2. Function Security
- `SECURITY DEFINER` for privileged operations
- Input validation in functions
- SQL injection prevention

### 3. Audit Trails
- Activity logging for sensitive operations
- IP address and user agent tracking
- Timestamp tracking

### 4. Data Encryption
- At rest: Supabase default encryption
- In transit: SSL/TLS
- Sensitive fields: Application-level encryption

## Scalability Considerations

### 1. Partitioning Ready
Tables suitable for partitioning:
- `user_analytics`: By date
- `analysis_activity_log`: By date
- `post_activity_log`: By date

### 2. Archival Strategy
- Expired exports auto-cleanup
- Old analytics data archival
- Completed analysis results compression

### 3. Caching Layers
- Database-level: `analytics_cache`
- Application-level: Redis (future)
- CDN: Static assets

### 4. Read Replicas
- Analytics queries: Read replica
- Reporting: Separate replica
- Real-time: Primary database

## Backup & Recovery

### Backup Strategy
- Automated daily backups (Supabase)
- Point-in-time recovery
- Export functionality for user data

### Critical Tables (Priority 1)
- `profiles`
- `analysis_projects`
- `analysis_results`
- `payment_transactions`
- `token_transactions`

### Recoverable Tables (Priority 2)
- `posts`
- `projects`
- `research_outlines`
- `literature_sources`

### Regenerable Tables (Priority 3)
- `analytics_cache`
- `variable_correlations`
- `user_analytics`

## Migration Strategy

### Running Migrations
```bash
# Run all migrations in order
supabase db push

# Or individually
psql -f supabase/migrations/20240107_complete_database_schema.sql
psql -f supabase/migrations/20240108_blog_permissions_enhancement.sql
psql -f supabase/migrations/20240109_analysis_workflow_enhancements.sql
psql -f supabase/migrations/20240110_complete_system_features.sql
```

### Rollback Strategy
Each migration is designed to be:
- Idempotent: Can run multiple times safely
- Reversible: Can be rolled back if needed
- Independent: Minimal dependencies between migrations

## Performance Optimization

### Query Optimization
1. Use indexes effectively
2. Avoid N+1 queries
3. Use JSONB operators efficiently
4. Leverage materialized views (future)

### Connection Pooling
- PgBouncer for connection management
- Transaction pooling for short queries
- Session pooling for long transactions

### Monitoring
- Slow query log analysis
- Index usage statistics
- Table bloat monitoring
- Connection pool metrics

## Future Enhancements

### Planned Features
1. **Materialized Views**: For complex analytics
2. **Partitioning**: For large tables
3. **Full-Text Search**: Enhanced search capabilities
4. **Time-Series Data**: For metrics and analytics
5. **Graph Relationships**: For citation networks

### Schema Evolution
- Version control for schema changes
- Migration testing framework
- Backward compatibility checks
- Data migration scripts

## Documentation

### Table Documentation
Each table has:
- COMMENT describing purpose
- Column descriptions
- Relationship documentation
- Example queries

### Function Documentation
Each function has:
- COMMENT describing purpose
- Parameter descriptions
- Return value documentation
- Usage examples

## Support & Maintenance

### Regular Tasks
- [ ] Weekly: Review slow queries
- [ ] Monthly: Analyze table bloat
- [ ] Monthly: Review index usage
- [ ] Quarterly: Optimize queries
- [ ] Quarterly: Archive old data

### Monitoring Alerts
- High connection count
- Slow query threshold exceeded
- Disk space warnings
- Replication lag
- Failed backups

---

**Version**: 1.0.0  
**Last Updated**: 2024-01-10  
**Maintained By**: NCSKIT Development Team
