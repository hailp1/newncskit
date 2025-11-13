# Django Backend Archive

## What is this?

This directory contains the archived Django backend that was previously used for the NCSKit project.

## Why was it archived?

The Django backend has been completely replaced with Next.js API routes. The migration was completed to:
- Simplify the tech stack (single framework instead of Django + Next.js)
- Reduce deployment complexity
- Improve development experience
- Better integration with Next.js frontend

## What was archived?

The entire `/backend` directory containing:
- Django application code
- Database models and migrations
- API endpoints
- Admin interface
- Configuration files
- Dependencies (requirements.txt)

## Archive Date

November 11, 2025

## Can it be restored?

Yes, if needed, the Django backend can be restored from this backup. However, note that:
- The frontend no longer calls Django API endpoints
- Database schema may have changed
- Environment variables have been updated
- Some features have been reimplemented in Next.js

## Migration Status

All Django functionality has been migrated to:
- Next.js API routes (`/frontend/src/app/api`)
- Prisma ORM for database operations
- NextAuth for authentication

## Backup Location

The Django backend is backed up in: `.backup/django-backend-{timestamp}/`

## Contact

If you need to restore or reference the Django backend, please review:
- This README
- The backup directory
- Migration documentation in `/docs/migration/`
