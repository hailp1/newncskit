# Workflow Restructure - Production Deployment Checklist

## Pre-Deployment Checklist

### Database Preparation
- [ ] **Run Migration Scripts**
  ```bash
  psql -h localhost -U ncskit_user -d ncskit -f frontend/database/migrations/run-all-migrations.sql
  psql -h localhost -U ncskit_user -d ncskit -f frontend/database/migrations/production-deployment.sql
  ```

- [ ] **Backup Current Database**
  ```bash
  pg_dump -h localhost -U ncskit_user ncskit > backup_pre_workflow_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] **Verify Migration Success**
  ```sql
  SELECT * FROM workflow_health_check();
  SELECT * FROM deployment_status;
  ```

### Code Deployment
- [ ] **Build and Test Frontend**
  ```bash
  cd frontend
  npm run build
  npm run test
  ```

- [ ] **Verify TypeScript Compilation**
  ```bash
  npx tsc --noEmit
  ```

- [ ] **Check for Linting Issues**
  ```bash
  npm run lint
  ```

### Feature Flag Configuration
- [ ] **Configure Feature Flags for Gradual Rollout**
  ```sql
  -- Start with 10% rollout for new features
  UPDATE feature_flags SET is_enabled = true, target_percentage = 10 
  WHERE flag_name IN ('enhanced_project_creation', 'progress_tracking');
  
  -- Keep advanced features disabled initially
  UPDATE feature_flags SET is_enabled = false, target_percentage = 0 
  WHERE flag_name IN ('intelligent_survey_builder', 'survey_campaigns');
  ```

### Environment Configuration
- [ ] **Update Environment Variables**
  ```bash
  # Add to .env
  WORKFLOW_RESTRUCTURE_ENABLED=true
  FEATURE_FLAGS_ENABLED=true
  MIGRATION_MODE=production
  ```

- [ ] **Configure Database Connection Pool**
  - Increase connection pool size for new workflow features
  - Set appropriate timeout values

### Monitoring Setup
- [ ] **Database Monitoring**
  - Monitor query performance on new tables
  - Set up alerts for migration failures
  - Track feature flag usage

- [ ] **Application Monitoring**
  - Monitor new API endpoints
  - Track workflow completion rates
  - Set up error tracking for new features

## Deployment Steps

### Phase 1: Database Migration (Maintenance Window)
1. [ ] **Enable Maintenance Mode**
   ```bash
   # Put application in maintenance mode
   echo "MAINTENANCE_MODE=true" >> .env
   ```

2. [ ] **Run Database Migrations**
   ```bash
   # Execute migration scripts
   ./run-migrations.sh
   ```

3. [ ] **Verify Migration Success**
   ```sql
   SELECT * FROM workflow_health_check();
   ```

4. [ ] **Migrate Existing Data**
   ```sql
   SELECT * FROM migrate_existing_projects();
   SELECT * FROM create_default_milestones_for_existing_projects();
   ```

### Phase 2: Application Deployment
1. [ ] **Deploy New Code**
   ```bash
   # Deploy frontend
   npm run build
   # Deploy to production server
   ```

2. [ ] **Update API Endpoints**
   - Deploy new workflow API endpoints
   - Update existing endpoints with new fields

3. [ ] **Disable Maintenance Mode**
   ```bash
   # Remove maintenance mode
   sed -i '/MAINTENANCE_MODE=true/d' .env
   ```

### Phase 3: Gradual Feature Rollout
1. [ ] **Enable Core Features (10% of users)**
   ```sql
   UPDATE feature_flags SET is_enabled = true, target_percentage = 10 
   WHERE flag_name = 'enhanced_project_creation';
   ```

2. [ ] **Monitor Performance and Errors**
   - Check application logs
   - Monitor database performance
   - Track user feedback

3. [ ] **Increase Rollout Percentage**
   ```sql
   -- After 24 hours of stable operation
   UPDATE feature_flags SET target_percentage = 25 
   WHERE flag_name = 'enhanced_project_creation';
   
   -- After 48 hours
   UPDATE feature_flags SET target_percentage = 50;
   
   -- After 72 hours
   UPDATE feature_flags SET target_percentage = 100;
   ```

## Post-Deployment Verification

### Functional Testing
- [ ] **Test New Project Creation Workflow**
  - Create project with 3-step workflow
  - Verify research design step
  - Test data collection configuration

- [ ] **Test Progress Tracking**
  - Create milestones
  - Update milestone status
  - Verify timeline events

- [ ] **Test Analysis Workflow**
  - Upload data files
  - Run analysis pipeline
  - Export results

### Performance Testing
- [ ] **Database Performance**
  ```sql
  -- Check query performance on new tables
  EXPLAIN ANALYZE SELECT * FROM survey_campaigns WHERE status = 'active';
  EXPLAIN ANALYZE SELECT * FROM progress_tracking WHERE project_id = 'test-id';
  ```

- [ ] **API Response Times**
  - Test new API endpoints
  - Verify response times under load
  - Check memory usage

### User Acceptance Testing
- [ ] **Test with Real Users**
  - Select beta users for testing
  - Gather feedback on new workflow
  - Document any issues

- [ ] **Verify Backward Compatibility**
  - Ensure existing projects still work
  - Test old API endpoints
  - Verify data integrity

## Rollback Procedures

### Emergency Rollback
If critical issues are discovered:

1. [ ] **Immediate Actions**
   ```sql
   -- Disable all new features
   UPDATE feature_flags SET is_enabled = false;
   ```

2. [ ] **Database Rollback**
   ```sql
   -- Rollback database changes if necessary
   SELECT rollback_workflow_migration();
   ```

3. [ ] **Code Rollback**
   ```bash
   # Revert to previous version
   git revert <commit-hash>
   npm run build
   # Deploy previous version
   ```

### Partial Rollback
For specific feature issues:

1. [ ] **Disable Specific Features**
   ```sql
   UPDATE feature_flags SET is_enabled = false 
   WHERE flag_name = 'problematic_feature';
   ```

2. [ ] **Monitor and Fix**
   - Identify and fix issues
   - Test fixes in staging
   - Re-enable features gradually

## Success Criteria

### Technical Metrics
- [ ] **Database Performance**
  - Query response times < 100ms for 95th percentile
  - No migration failures
  - All health checks passing

- [ ] **Application Performance**
  - Page load times < 2 seconds
  - API response times < 500ms
  - Error rate < 0.1%

### User Experience Metrics
- [ ] **Workflow Completion**
  - >80% of users complete new project creation workflow
  - <5% abandonment rate in research design step
  - >90% user satisfaction with new interface

- [ ] **Feature Adoption**
  - >50% of new projects use enhanced workflow
  - >30% of users engage with progress tracking
  - Positive user feedback scores

## Monitoring and Alerts

### Database Monitoring
```sql
-- Set up monitoring queries
SELECT * FROM deployment_status;
SELECT * FROM feature_rollout_status;
SELECT * FROM workflow_health_check();
```

### Application Monitoring
- Monitor new API endpoints
- Track feature flag usage
- Monitor error rates and performance

### User Behavior Monitoring
- Track workflow completion rates
- Monitor user engagement with new features
- Collect user feedback and satisfaction scores

## Documentation Updates

- [ ] **Update User Documentation**
  - New project creation workflow guide
  - Progress tracking user manual
  - FAQ for new features

- [ ] **Update Developer Documentation**
  - API documentation for new endpoints
  - Database schema documentation
  - Feature flag usage guide

- [ ] **Update Admin Documentation**
  - Feature flag management guide
  - Monitoring and troubleshooting guide
  - Rollback procedures

## Communication Plan

### Internal Team
- [ ] Notify development team of deployment schedule
- [ ] Brief support team on new features
- [ ] Update operations team on monitoring requirements

### Users
- [ ] Announce new features via in-app notifications
- [ ] Send email updates to active users
- [ ] Update help documentation and tutorials

### Stakeholders
- [ ] Report deployment success to management
- [ ] Share user adoption metrics
- [ ] Plan next phase of feature rollout

---

## Deployment Sign-off

- [ ] **Technical Lead Approval**: _________________ Date: _______
- [ ] **Product Manager Approval**: _________________ Date: _______
- [ ] **QA Lead Approval**: _________________ Date: _______
- [ ] **DevOps Lead Approval**: _________________ Date: _______

**Deployment Date**: _________________
**Deployed By**: _________________
**Rollback Plan Confirmed**: [ ] Yes [ ] No