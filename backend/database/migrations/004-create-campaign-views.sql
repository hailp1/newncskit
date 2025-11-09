-- Migration: Create Campaign Materialized Views
-- Description: Creates materialized views for fast dashboard queries
-- Author: Kiro AI
-- Date: 2024-01-09

-- ============================================================================
-- 1. Create materialized view for user campaign stats
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS campaign_stats AS
SELECT 
  created_by as user_id,
  COUNT(*) as total_campaigns,
  COUNT(*) FILTER (WHERE status = 'draft') as draft_count,
  COUNT(*) FILTER (WHERE status = 'active') as active_count,
  COUNT(*) FILTER (WHERE status = 'paused') as paused_count,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
  SUM(current_participants) as total_participants,
  SUM(completed_responses) as total_responses,
  SUM(total_tokens_awarded) as total_tokens_spent,
  SUM(admin_fees_collected) as total_admin_fees,
  MAX(updated_at) as last_activity_at
FROM survey_campaigns
GROUP BY created_by;

-- Add indexes
CREATE UNIQUE INDEX idx_campaign_stats_user ON campaign_stats(user_id);

-- Add comment
COMMENT ON MATERIALIZED VIEW campaign_stats IS 'Aggregated campaign statistics per user for fast dashboard queries';

-- ============================================================================
-- 2. Create materialized view for campaign performance metrics
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS campaign_performance AS
SELECT 
  c.id as campaign_id,
  c.title,
  c.status,
  c.created_by,
  c.target_participants,
  c.current_participants,
  c.completed_responses,
  
  -- Participation Metrics
  CASE 
    WHEN c.target_participants > 0 
    THEN ROUND((c.current_participants::DECIMAL / c.target_participants) * 100, 2)
    ELSE 0
  END as participation_rate,
  
  CASE 
    WHEN c.current_participants > 0 
    THEN ROUND((c.completed_responses::DECIMAL / c.current_participants) * 100, 2)
    ELSE 0
  END as completion_rate,
  
  -- Time Metrics
  c.launched_at,
  c.duration_days,
  CASE 
    WHEN c.launched_at IS NOT NULL 
    THEN GREATEST(0, c.duration_days - EXTRACT(DAY FROM (NOW() - c.launched_at))::INTEGER)
    ELSE c.duration_days
  END as days_remaining,
  
  -- Financial Metrics
  c.total_tokens_awarded,
  c.admin_fees_collected,
  CASE 
    WHEN c.completed_responses > 0 
    THEN ROUND(c.total_tokens_awarded / c.completed_responses, 2)
    ELSE 0
  END as cost_per_response,
  
  -- Quality Metrics (from participants)
  COALESCE(AVG(p.response_quality_score), 0) as avg_quality_score,
  COALESCE(AVG(p.completion_time_minutes), 0) as avg_completion_time,
  
  -- Participant Counts by Status
  COUNT(p.id) FILTER (WHERE p.status = 'invited') as invited_count,
  COUNT(p.id) FILTER (WHERE p.status = 'started') as started_count,
  COUNT(p.id) FILTER (WHERE p.status = 'completed') as completed_count,
  COUNT(p.id) FILTER (WHERE p.status = 'dropped_out') as dropped_out_count,
  
  c.created_at,
  c.updated_at
FROM survey_campaigns c
LEFT JOIN campaign_participants p ON c.id = p.campaign_id
GROUP BY c.id, c.title, c.status, c.created_by, c.target_participants, 
         c.current_participants, c.completed_responses, c.launched_at, 
         c.duration_days, c.total_tokens_awarded, c.admin_fees_collected,
         c.created_at, c.updated_at;

-- Add indexes
CREATE UNIQUE INDEX idx_campaign_performance_id ON campaign_performance(campaign_id);
CREATE INDEX idx_campaign_performance_user ON campaign_performance(created_by);
CREATE INDEX idx_campaign_performance_status ON campaign_performance(status);

-- Add comment
COMMENT ON MATERIALIZED VIEW campaign_performance IS 'Detailed performance metrics for each campaign';

-- ============================================================================
-- 3. Create function to refresh materialized views
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_campaign_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY campaign_performance;
  RAISE NOTICE 'Campaign materialized views refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION refresh_campaign_views() IS 'Refreshes all campaign-related materialized views';

-- ============================================================================
-- 4. Create scheduled job to refresh views (if pg_cron is available)
-- ============================================================================

-- Uncomment if pg_cron extension is available:
-- SELECT cron.schedule(
--   'refresh-campaign-views',
--   '*/5 * * * *', -- Every 5 minutes
--   'SELECT refresh_campaign_views();'
-- );

-- ============================================================================
-- 5. Create view for campaign analytics summary
-- ============================================================================

CREATE OR REPLACE VIEW campaign_analytics_summary AS
SELECT 
  ca.campaign_id,
  c.title as campaign_title,
  c.status as campaign_status,
  
  -- Aggregate metrics across all days
  SUM(ca.views) as total_views,
  SUM(ca.clicks) as total_clicks,
  SUM(ca.starts) as total_starts,
  SUM(ca.completions) as total_completions,
  SUM(ca.dropouts) as total_dropouts,
  
  -- Conversion rates
  CASE 
    WHEN SUM(ca.views) > 0 
    THEN ROUND((SUM(ca.clicks)::DECIMAL / SUM(ca.views)) * 100, 2)
    ELSE 0
  END as click_through_rate,
  
  CASE 
    WHEN SUM(ca.clicks) > 0 
    THEN ROUND((SUM(ca.starts)::DECIMAL / SUM(ca.clicks)) * 100, 2)
    ELSE 0
  END as start_rate,
  
  CASE 
    WHEN SUM(ca.starts) > 0 
    THEN ROUND((SUM(ca.completions)::DECIMAL / SUM(ca.starts)) * 100, 2)
    ELSE 0
  END as completion_rate,
  
  -- Quality metrics
  AVG(ca.avg_completion_time_minutes) as avg_completion_time,
  AVG(ca.avg_response_quality) as avg_quality_score,
  
  -- Financial
  SUM(ca.tokens_distributed) as total_tokens_distributed,
  
  -- Device breakdown
  SUM(ca.desktop_count) as total_desktop,
  SUM(ca.mobile_count) as total_mobile,
  SUM(ca.tablet_count) as total_tablet,
  
  -- Time range
  MIN(ca.date) as first_activity_date,
  MAX(ca.date) as last_activity_date,
  COUNT(DISTINCT ca.date) as active_days
  
FROM campaign_analytics ca
JOIN survey_campaigns c ON ca.campaign_id = c.id
GROUP BY ca.campaign_id, c.title, c.status;

-- Add comment
COMMENT ON VIEW campaign_analytics_summary IS 'Aggregated analytics summary for each campaign';

-- ============================================================================
-- 6. Create view for recent campaign activity
-- ============================================================================

CREATE OR REPLACE VIEW recent_campaign_activity AS
SELECT 
  c.id as campaign_id,
  c.title,
  c.status,
  c.created_by,
  'campaign_created' as activity_type,
  c.created_at as activity_at
FROM survey_campaigns c

UNION ALL

SELECT 
  c.id as campaign_id,
  c.title,
  c.status,
  c.created_by,
  'campaign_launched' as activity_type,
  c.launched_at as activity_at
FROM survey_campaigns c
WHERE c.launched_at IS NOT NULL

UNION ALL

SELECT 
  c.id as campaign_id,
  c.title,
  c.status,
  c.created_by,
  'campaign_completed' as activity_type,
  c.completed_at as activity_at
FROM survey_campaigns c
WHERE c.completed_at IS NOT NULL

UNION ALL

SELECT 
  c.id as campaign_id,
  c.title,
  c.status,
  c.created_by,
  'participant_completed' as activity_type,
  p.completed_at as activity_at
FROM campaign_participants p
JOIN survey_campaigns c ON p.campaign_id = c.id
WHERE p.completed_at IS NOT NULL

ORDER BY activity_at DESC
LIMIT 100;

-- Add comment
COMMENT ON VIEW recent_campaign_activity IS 'Recent activity feed for campaigns and participants';

-- ============================================================================
-- Migration Complete
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 004 completed successfully';
  RAISE NOTICE 'Created materialized views: campaign_stats, campaign_performance';
  RAISE NOTICE 'Created views: campaign_analytics_summary, recent_campaign_activity';
  RAISE NOTICE 'Created function: refresh_campaign_views()';
  RAISE NOTICE 'Remember to refresh materialized views periodically!';
END $$;
