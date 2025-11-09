# API Overview

## Introduction

The NCSKIT API provides programmatic access to all platform features including analysis, projects, surveys, and more.

## Base URL

```
Production: https://app.ncskit.org/api
```

## Authentication

All API requests require authentication using Bearer tokens:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://app.ncskit.org/api/analysis/projects
```

See [Authentication](authentication.md) for details.

## API Endpoints

### Analysis API
- `POST /api/analysis/upload` - Upload CSV file
- `POST /api/analysis/health` - Run health check
- `POST /api/analysis/execute` - Execute analysis
- `GET /api/analysis/results/:id` - Get results
- `GET /api/analysis/recent` - Get recent projects

### Projects API
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Surveys API
- `GET /api/surveys` - List surveys
- `POST /api/surveys` - Create survey
- `GET /api/surveys/:id` - Get survey
- `PUT /api/surveys/:id` - Update survey
- `POST /api/surveys/:id/responses` - Submit response

### Blog API
- `GET /api/blog/posts` - List posts
- `GET /api/blog/posts/:slug` - Get post
- `POST /api/blog/posts` - Create post (admin)
- `PUT /api/blog/posts/:id` - Update post (admin)

### Admin API
- `GET /api/admin/users` - List users
- `GET /api/admin/stats` - Get statistics
- `GET /api/admin/logs` - Get audit logs

## Rate Limiting

- **Free tier**: 100 requests/hour
- **Pro tier**: 1000 requests/hour
- **Enterprise**: Unlimited

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699564800
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Project Name"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid project ID",
    "details": {}
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `INVALID_INPUT` | Invalid request parameters |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SERVER_ERROR` | Internal server error |

## Pagination

List endpoints support pagination:

```bash
GET /api/projects?page=1&limit=20
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Filtering & Sorting

```bash
# Filter by status
GET /api/projects?status=active

# Sort by date
GET /api/projects?sort=created_at&order=desc

# Multiple filters
GET /api/projects?status=active&sort=name&order=asc
```

## Webhooks

Subscribe to events:
- `analysis.completed`
- `project.created`
- `survey.response`

See [Webhooks](webhooks.md) for details.

## SDKs

Official SDKs:
- **JavaScript/TypeScript**: `npm install @ncskit/sdk`
- **Python**: `pip install ncskit`
- **R**: `install.packages("ncskit")`

## Support

- **Documentation**: https://docs.ncskit.org/api
- **Email**: api@ncskit.org
- **Status**: https://status.ncskit.org

---

**Next**: [Authentication](authentication.md)
