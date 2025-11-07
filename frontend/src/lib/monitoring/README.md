# Error Logging and Monitoring System

This directory contains the error logging and monitoring infrastructure for the NCSKIT application.

## Overview

The monitoring system provides:
- Centralized error logging
- Automatic error capture (global error handlers)
- Severity-based categorization
- Context-rich error information
- Integration with external monitoring services (Sentry, Vercel Analytics)
- Real-time error notifications for critical issues

## Components

### 1. Error Logger (`error-logger.ts`)

The core error logging utility that captures and manages errors throughout the application.

#### Features:
- **Automatic Error Capture**: Global error and unhandled promise rejection handlers
- **Severity Levels**: LOW, MEDIUM, HIGH, CRITICAL
- **Error Categories**: API, DATABASE, AUTHENTICATION, ANALYTICS, HEALTH_CHECK, NETWORK, VALIDATION, UNKNOWN
- **Context Tracking**: URL, method, status code, user info, additional data
- **In-Memory Storage**: Keeps recent errors in memory (max 100)
- **LocalStorage Persistence**: Stores errors in browser for debugging
- **Notification Callbacks**: Subscribe to error events
- **External Service Integration**: Sends critical errors to monitoring endpoints

#### Usage:

```typescript
import { logError, logApiError, logHealthCheckFailure, ErrorSeverity, ErrorCategory } from '@/lib/monitoring/error-logger'

// Basic error logging
logError('Something went wrong', {
  severity: ErrorSeverity.HIGH,
  category: ErrorCategory.API
})

// API error logging
logApiError(error, {
  endpoint: '/api/users',
  method: 'POST',
  statusCode: 500,
  requestData: { userId: '123' },
  responseData: { error: 'Internal server error' }
})

// Health check failure logging
logHealthCheckFailure('supabase', 'Connection timeout', {
  additionalData: { latency: 5000 }
})

// Subscribe to errors
const unsubscribe = errorLogger.onError((error) => {
  console.log('New error:', error)
  // Send notification, update UI, etc.
})

// Later: unsubscribe
unsubscribe()
```

### 2. Monitoring API Endpoint (`/api/monitoring/error`)

Server-side endpoint that receives error logs from the frontend and can forward them to external services.

#### Features:
- Receives error logs via POST requests
- Forwards critical errors to external monitoring services
- Sends notifications for critical errors
- Can store errors in database for analysis

#### Integration Examples:

**Sentry Integration:**
```typescript
if (process.env.SENTRY_DSN) {
  await fetch('https://sentry.io/api/...', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SENTRY_AUTH_TOKEN}`
    },
    body: JSON.stringify(errorLog)
  })
}
```

**Slack Notifications:**
```typescript
if (process.env.SLACK_WEBHOOK_URL) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Critical Error: ${errorLog.message}`,
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Category', value: errorLog.category },
          { title: 'Severity', value: errorLog.severity },
          { title: 'URL', value: errorLog.context.url }
        ]
      }]
    })
  })
}
```

**Email Notifications:**
```typescript
if (process.env.ADMIN_EMAIL) {
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `Critical Error: ${errorLog.message}`,
    body: `
      A critical error has occurred:
      
      Message: ${errorLog.message}
      Category: ${errorLog.category}
      Timestamp: ${errorLog.timestamp}
      URL: ${errorLog.context.url}
    `
  })
}
```

## Health Check Integration

The error logger is integrated with all health check endpoints:

- `/api/health/vercel` - Vercel frontend health
- `/api/health/supabase` - Supabase backend health
- `/api/health/docker` - Docker analytics health

Health check failures are automatically logged with CRITICAL severity and HEALTH_CHECK category.

## Analytics Integration

The analytics API gateway (`/api/analytics`) uses error logging for:
- Failed analytics requests
- Circuit breaker trips
- Timeout errors
- Service unavailability

## Monitoring Dashboards

### 1. Health Monitoring Dashboard (`/admin/health`)

Real-time monitoring of all system services:
- Vercel frontend status
- Supabase backend status (database, auth, storage)
- Docker analytics status
- Auto-refresh every 30 seconds
- Response time tracking
- Service-specific details

### 2. Error Monitoring Dashboard (`/admin/monitoring`)

View and manage application errors:
- Filter by severity and category
- View error details, stack traces, and context
- Auto-refresh every 5 seconds
- Summary statistics
- Clear logs functionality

## Environment Variables

Add these to your `.env.local` or Vercel environment variables:

```bash
# Optional: Sentry Integration
SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Optional: Slack Notifications
SLACK_WEBHOOK_URL=your-slack-webhook-url

# Optional: Email Notifications
ADMIN_EMAIL=admin@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

## Best Practices

1. **Use Appropriate Severity Levels**:
   - CRITICAL: System-wide failures, data loss, security breaches
   - HIGH: Service unavailability, failed critical operations
   - MEDIUM: Recoverable errors, degraded performance
   - LOW: Minor issues, warnings

2. **Provide Context**:
   - Always include relevant context (URL, method, user info)
   - Add additional data for debugging
   - Include request/response data for API errors

3. **Don't Over-Log**:
   - Only log actual errors, not expected conditions
   - Use appropriate severity levels
   - Avoid logging sensitive information (passwords, tokens)

4. **Monitor Regularly**:
   - Check the monitoring dashboard daily
   - Set up notifications for critical errors
   - Review error trends and patterns

5. **Clean Up**:
   - Clear old logs periodically
   - Archive important errors for analysis
   - Remove resolved errors from monitoring

## Future Enhancements

- [ ] Database storage for error logs
- [ ] Advanced analytics and reporting
- [ ] Error grouping and deduplication
- [ ] Automatic error resolution tracking
- [ ] Integration with more monitoring services
- [ ] Custom notification rules
- [ ] Error rate limiting
- [ ] Performance metrics tracking

## Troubleshooting

**Errors not appearing in dashboard:**
- Check browser console for JavaScript errors
- Verify error logger is initialized
- Check localStorage for stored errors

**Notifications not working:**
- Verify environment variables are set
- Check monitoring API endpoint logs
- Test webhook URLs manually

**High memory usage:**
- Reduce maxLogs limit in error-logger.ts
- Clear logs more frequently
- Disable localStorage persistence

## Support

For issues or questions about the monitoring system, contact the development team or check the project documentation.
