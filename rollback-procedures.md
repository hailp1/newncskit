# Workflow Restructure - Rollback Procedures

## Overview
This document outlines the procedures for rolling back the workflow restructure deployment in case of critical issues or failures.

## Rollback Scenarios

### Scenario 1: Critical Database Issues
**Triggers:**
- Data corruption detected
- Migration failures causing data loss
- Performance degradation > 50%
- Database connection failures

**Actions:**
1. **Immediate Response (< 5 minutes)**
   ```sql
   -- Disable all new features immediately
   UPDATE feature_flags SET is_enabled = false;
   
   -- Check database health
   SELECT * FROM workflow_health_check();
   ```

2. **Database Rollback (< 15 minutes)**
   ```sql
   -- Execute rollback function
   SELECT rollback_workflow_migration();
   
   -- Verify rollback success
   SELECT COUNT(*) FROM projects_backup;
   SELECT COUNT(*) FROM projects;
   ```

3. **Restore from Backup (if needed)**
   ```bash
   # Stop application
   systemctl stop ncskit-app
   
   # Restore database from backup
   psql -h localhost -U ncskit_user -d ncskit < backup_pre_workflow_YYYYMMDD_HHMMSS.sql
   
   # Restart application
   systemctl start ncskit-app
   ```

### Scenario 2: Application Performance Issues
**Triggers:**
- Response times > 5 seconds
- Memory usage > 90%
- CPU usage > 80% sustained
- High error rates (> 5%)

**Actions:**
1. **Immediate Feature Disable**
   ```sql
   -- Disable resource-intensive features
   UPDATE feature_flags SET is_enabled = false 
   WHERE flag_name IN ('intelligent_survey_builder', 'survey_campaigns');
   ```

2. **Scale Down New Features**
   ```sql
   -- Reduce feature rollout percentage
   UPDATE feature_flags SET target_percentage = 0 
   WHERE is_enabled = true;
   ```

3. **Monitor and Assess**
   - Check system resources
   - Review application logs
   - Assess if partial rollback is sufficient

### Scenario 3: User Experience Issues
**Triggers:**
- User complaints > 10% of active users
- Workflow completion rate < 50%
- Critical UI/UX bugs
- Data loss in user workflows

**Actions:**
1. **Selective Feature Disable**
   ```sql
   -- Disable problematic workflow steps
   UPDATE feature_flags SET is_enabled = false 
   WHERE flag_name = 'enhanced_project_creation';
   ```

2. **Revert to Legacy Workflow**
   ```sql
   -- Enable legacy project creation
   UPDATE feature_flags SET is_enabled = true, target_percentage = 100
   WHERE flag_name = 'legacy_project_creation';
   ```

## Rollback Procedures

### Full System Rollback

#### Step 1: Preparation (5 minutes)
```bash
# 1. Enable maintenance mode
echo "MAINTENANCE_MODE=true" >> .env

# 2. Notify users
curl -X POST /api/notifications/system \
  -d '{"message": "System maintenance in progress", "type": "warning"}'

# 3. Stop background jobs
systemctl stop ncskit-workers
```

#### Step 2: Database Rollback (15 minutes)
```sql
-- 1. Disable all new features
UPDATE feature_flags SET is_enabled = false;

-- 2. Execute database rollback
SELECT rollback_workflow_migration();

-- 3. Verify rollback
SELECT * FROM workflow_health_check();

-- 4. Check data integrity
SELECT COUNT(*) as total_projects FROM projects;
SELECT COUNT(*) as projects_with_old_schema FROM projects 
WHERE research_design IS NULL;
```

#### Step 3: Application Rollback (10 minutes)
```bash
# 1. Revert code to previous version
git checkout previous-stable-version

# 2. Rebuild application
npm run build

# 3. Deploy previous version
./deploy-previous-version.sh

# 4. Restart services
systemctl restart ncskit-app
systemctl restart ncskit-workers
```

#### Step 4: Verification (10 minutes)
```bash
# 1. Health check
curl -f http://localhost:3000/api/health

# 2. Test critical functionality
curl -f http://localhost:3000/api/projects
curl -f http://localhost:3000/api/analysis

# 3. Verify user access
curl -f http://localhost:3000/api/auth/session
```

#### Step 5: Cleanup (5 minutes)
```bash
# 1. Disable maintenance mode
sed -i '/MAINTENANCE_MODE=true/d' .env

# 2. Notify users
curl -X POST /api/notifications/system \
  -d '{"message": "System maintenance completed", "type": "success"}'

# 3. Log rollback
echo "$(date): Full rollback completed" >> /var/log/ncskit/rollback.log
```

### Partial Rollback

#### Feature-Specific Rollback
```sql
-- Disable specific problematic feature
UPDATE feature_flags SET is_enabled = false 
WHERE flag_name = 'problematic_feature_name';

-- Log the action
INSERT INTO deployment_history (version, deployment_type, description, executed_by) 
VALUES ('1.0.0-workflow-restructure', 'partial_rollback', 
        'Disabled problematic_feature_name due to issues', 'admin');
```

#### Gradual Rollback
```sql
-- Reduce rollout percentage gradually
UPDATE feature_flags SET target_percentage = 50 
WHERE flag_name = 'enhanced_project_creation';

-- Wait 30 minutes, then reduce further if needed
UPDATE feature_flags SET target_percentage = 25;

-- Final disable if issues persist
UPDATE feature_flags SET target_percentage = 0;
```

## Rollback Decision Matrix

| Issue Severity | Response Time | Action Required |
|---------------|---------------|-----------------|
| **Critical** (Data loss, system down) | < 5 minutes | Full rollback |
| **High** (Major functionality broken) | < 15 minutes | Partial rollback |
| **Medium** (Performance issues) | < 30 minutes | Feature disable |
| **Low** (Minor UI issues) | < 2 hours | Gradual rollback |

## Rollback Validation

### Database Validation
```sql
-- Check data integrity after rollback
SELECT 
    COUNT(*) as total_projects,
    COUNT(CASE WHEN research_design IS NOT NULL THEN 1 END) as enhanced_projects,
    COUNT(CASE WHEN research_design IS NULL THEN 1 END) as legacy_projects
FROM projects;

-- Verify no data corruption
SELECT * FROM workflow_health_check();

-- Check migration status
SELECT * FROM data_migrations WHERE status = 'failed';
```

### Application Validation
```bash
# Test critical endpoints
curl -f http://localhost:3000/api/projects
curl -f http://localhost:3000/api/analysis
curl -f http://localhost:3000/api/auth/login

# Check application logs
tail -n 100 /var/log/ncskit/application.log | grep ERROR

# Verify service status
systemctl status ncskit-app
systemctl status ncskit-workers
```

### User Experience Validation
```bash
# Test user workflows
# 1. User registration/login
# 2. Project creation
# 3. Data analysis
# 4. Results export

# Monitor error rates
curl http://localhost:3000/api/metrics/errors

# Check user feedback
curl http://localhost:3000/api/feedback/recent
```

## Post-Rollback Actions

### Immediate Actions (< 1 hour)
1. **Incident Documentation**
   ```bash
   # Create incident report
   echo "Rollback executed at $(date)" > incident-report-$(date +%Y%m%d).md
   echo "Reason: [DESCRIBE ISSUE]" >> incident-report-$(date +%Y%m%d).md
   echo "Actions taken: [LIST ACTIONS]" >> incident-report-$(date +%Y%m%d).md
   ```

2. **Stakeholder Notification**
   - Notify development team
   - Update management on status
   - Communicate with users if needed

3. **System Monitoring**
   - Monitor system performance
   - Watch for any residual issues
   - Track user activity and feedback

### Short-term Actions (< 24 hours)
1. **Root Cause Analysis**
   - Analyze logs and error reports
   - Identify the cause of the issue
   - Document findings

2. **Fix Development**
   - Develop fixes for identified issues
   - Test fixes in staging environment
   - Prepare for re-deployment

3. **Process Review**
   - Review deployment procedures
   - Update rollback procedures if needed
   - Improve monitoring and alerts

### Long-term Actions (< 1 week)
1. **Re-deployment Planning**
   - Plan phased re-deployment
   - Implement additional safeguards
   - Update testing procedures

2. **Process Improvement**
   - Update deployment checklist
   - Enhance monitoring capabilities
   - Improve rollback automation

## Rollback Automation Scripts

### Quick Rollback Script
```bash
#!/bin/bash
# quick-rollback.sh

set -e

echo "Starting emergency rollback..."

# Disable all features
psql -h localhost -U ncskit_user -d ncskit -c "UPDATE feature_flags SET is_enabled = false;"

# Execute database rollback
psql -h localhost -U ncskit_user -d ncskit -c "SELECT rollback_workflow_migration();"

# Revert application
git checkout previous-stable-version
npm run build
systemctl restart ncskit-app

echo "Emergency rollback completed"
```

### Gradual Rollback Script
```bash
#!/bin/bash
# gradual-rollback.sh

FEATURE_NAME=$1
PERCENTAGE=$2

if [ -z "$FEATURE_NAME" ] || [ -z "$PERCENTAGE" ]; then
    echo "Usage: $0 <feature_name> <percentage>"
    exit 1
fi

echo "Rolling back $FEATURE_NAME to $PERCENTAGE%..."

psql -h localhost -U ncskit_user -d ncskit -c \
  "UPDATE feature_flags SET target_percentage = $PERCENTAGE WHERE flag_name = '$FEATURE_NAME';"

echo "Rollback completed. Monitoring for 30 minutes..."
sleep 1800

echo "Monitoring period completed."
```

## Emergency Contacts

### Technical Team
- **Lead Developer**: [Contact Info]
- **DevOps Engineer**: [Contact Info]
- **Database Administrator**: [Contact Info]

### Management Team
- **Product Manager**: [Contact Info]
- **Engineering Manager**: [Contact Info]
- **CTO**: [Contact Info]

### External Support
- **Hosting Provider**: [Contact Info]
- **Database Support**: [Contact Info]
- **Monitoring Service**: [Contact Info]

---

## Rollback Checklist

### Pre-Rollback
- [ ] Assess severity and impact
- [ ] Notify stakeholders
- [ ] Enable maintenance mode
- [ ] Backup current state

### During Rollback
- [ ] Execute rollback procedures
- [ ] Monitor system status
- [ ] Validate rollback success
- [ ] Test critical functionality

### Post-Rollback
- [ ] Disable maintenance mode
- [ ] Notify users of resolution
- [ ] Document incident
- [ ] Plan remediation

**Remember**: Always prioritize data integrity and user experience during rollback procedures.