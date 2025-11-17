# Database Migrations Guide - IndiDate

> Complete guide for managing database schema changes using migrations in the IndiDate application.

## 📋 Table of Contents

- [Overview](#overview)
- [Migration System Structure](#migration-system-structure)
- [Quick Start](#quick-start)
- [Creating Migrations](#creating-migrations)
- [Running Migrations](#running-migrations)
- [Migration Commands](#migration-commands)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Database migrations are version control for your database schema. They allow you to:

- **Track Changes**: Keep a history of all database modifications
- **Team Collaboration**: Share schema changes across development teams
- **Environment Sync**: Keep development, staging, and production databases in sync
- **Rollback Support**: Safely revert problematic changes
- **Automated Deployment**: Apply database changes automatically during deployments

## 📁 Migration System Structure

```
server/database/
├── migrations/                    # Migration files directory
│   ├── 001_initial_schema.sql   # Initial database setup
│   ├── 002_add_user_verification.sql
│   └── 003_add_notifications.sql
├── migrate.js                    # Migration runner script
├── create-migration.js          # Migration generator
└── init.js                      # Database initialization
```

### Migration Files

- **Naming Convention**: `XXX_migration_name.sql`
- **Sequential Numbers**: 001, 002, 003, etc.
- **Descriptive Names**: Use clear, descriptive names
- **SQL Format**: Pure SQL files with comments

### Migration Tracking

The system uses a `migrations` table to track applied migrations:

```sql
CREATE TABLE migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Quick Start

### 1. Check Migration Status

```bash
npm run migrate:status
```

### 2. Run Pending Migrations

```bash
npm run migrate
```

### 3. Create New Migration

```bash
npm run migrate:create add_user_preferences "Add user preference settings"
```

### 4. Rollback Last Migration

```bash
npm run migrate:rollback
```

## 🔧 Creating Migrations

### Using the Generator

```bash
# Basic migration
npm run migrate:create migration_name

# With description
npm run migrate:create add_notifications "Add notification system"

# Examples
npm run migrate:create add_user_bio
npm run migrate:create update_message_schema "Add message reactions"
npm run migrate:create create_admin_panel "Create admin user management"
```

### Manual Creation

1. **Create File**: `server/database/migrations/XXX_migration_name.sql`
2. **Add Content**: Use the template below
3. **Test Migration**: Run on development database first

### Migration Template

```sql
-- Migration: 003_migration_name
-- Description: Brief description of changes
-- Created: 2024-11-17
-- Author: Your Name

-- Add your SQL statements here
ALTER TABLE users ADD COLUMN new_field VARCHAR(255);

-- Create indexes if needed
CREATE INDEX IF NOT EXISTS idx_users_new_field ON users(new_field);

-- Insert sample data if needed
-- INSERT INTO table_name (column) VALUES ('value');

-- Record this migration as applied
INSERT INTO migrations (migration_name) VALUES ('003_migration_name') ON CONFLICT (migration_name) DO NOTHING;
```

## ▶️ Running Migrations

### Apply All Pending Migrations

```bash
npm run migrate
# or
npm run migrate:up
```

**Output Example:**
```
🚀 Starting database migrations...

📋 Found 2 pending migration(s):
   - 002_add_user_verification.sql
   - 003_add_notifications.sql

🔄 Running migration: 002_add_user_verification.sql
✅ Migration completed: 002_add_user_verification.sql
🔄 Running migration: 003_add_notifications.sql
✅ Migration completed: 003_add_notifications.sql

🎉 Successfully applied 2/2 migrations!
```

### Check Status

```bash
npm run migrate:status
```

**Output Example:**
```
📊 Migration Status

Migration Files:
   ✅ Applied - 001_initial_schema.sql
   ✅ Applied - 002_add_user_verification.sql
   ⏳ Pending - 003_add_notifications.sql

📈 Summary: 2 applied, 1 pending
```

### Rollback Last Migration

```bash
npm run migrate:rollback
```

**Note**: This only removes the migration record. You may need to manually undo schema changes.

## 📝 Migration Commands

### Available NPM Scripts

| Command | Description | Example |
|---------|-------------|---------|
| `npm run migrate` | Run all pending migrations | `npm run migrate` |
| `npm run migrate:status` | Show migration status | `npm run migrate:status` |
| `npm run migrate:rollback` | Rollback last migration | `npm run migrate:rollback` |
| `npm run migrate:create` | Create new migration | `npm run migrate:create add_feature` |

### Direct Node Commands

```bash
# Run migrations
node server/database/migrate.js up

# Check status
node server/database/migrate.js status

# Rollback
node server/database/migrate.js rollback

# Create migration
node server/database/create-migration.js migration_name "Description"
```

## ✅ Best Practices

### 1. **Migration Naming**

```bash
# Good
npm run migrate:create add_user_email_verification
npm run migrate:create update_message_table_indexes
npm run migrate:create create_notification_system

# Avoid
npm run migrate:create fix
npm run migrate:create update
npm run migrate:create new_stuff
```

### 2. **Migration Content**

```sql
-- ✅ Good: Use IF NOT EXISTS
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- ❌ Avoid: Direct alterations
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;

-- ✅ Good: Add indexes
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- ✅ Good: Add comments
-- Add email verification to support account security
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
```

### 3. **Testing Migrations**

```bash
# 1. Test on development database
npm run migrate:status
npm run migrate

# 2. Verify changes
psql -d indidate -c "\d users"

# 3. Test rollback if needed
npm run migrate:rollback
```

### 4. **Production Deployment**

```bash
# 1. Backup database
pg_dump indidate > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migrations
npm run migrate

# 3. Verify application works
# 4. Monitor for issues
```

## 📚 Examples

### Example 1: Add User Bio Field

```bash
# Create migration
npm run migrate:create add_user_bio "Add bio field to user profiles"
```

**File**: `004_add_user_bio.sql`
```sql
-- Migration: 004_add_user_bio
-- Description: Add bio field to user profiles
-- Created: 2024-11-17
-- Author: IndiDate Team

-- Add bio column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add index for bio searches (optional)
CREATE INDEX IF NOT EXISTS idx_users_bio ON users USING gin(to_tsvector('english', bio));

-- Record this migration as applied
INSERT INTO migrations (migration_name) VALUES ('004_add_user_bio') ON CONFLICT (migration_name) DO NOTHING;
```

### Example 2: Create Notifications Table

```bash
# Create migration
npm run migrate:create create_notifications "Add notification system"
```

**File**: `005_create_notifications.sql`
```sql
-- Migration: 005_create_notifications
-- Description: Add notification system
-- Created: 2024-11-17
-- Author: IndiDate Team

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Record this migration as applied
INSERT INTO migrations (migration_name) VALUES ('005_create_notifications') ON CONFLICT (migration_name) DO NOTHING;
```

### Example 3: Update Existing Table

```bash
# Create migration
npm run migrate:create update_messages_add_reactions "Add reaction support to messages"
```

**File**: `006_update_messages_add_reactions.sql`
```sql
-- Migration: 006_update_messages_add_reactions
-- Description: Add reaction support to messages
-- Created: 2024-11-17
-- Author: IndiDate Team

-- Add reactions column to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '[]';

-- Create message reactions table for detailed tracking
CREATE TABLE IF NOT EXISTS message_reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(50) NOT NULL, -- 'like', 'love', 'laugh', 'angry', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id, reaction_type)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_type ON message_reactions(reaction_type);

-- Record this migration as applied
INSERT INTO migrations (migration_name) VALUES ('006_update_messages_add_reactions') ON CONFLICT (migration_name) DO NOTHING;
```

## 🔍 Troubleshooting

### Common Issues

#### 1. **Migration Already Applied**

```
Error: duplicate key value violates unique constraint "migrations_migration_name_key"
```

**Solution**: The migration was already applied. Check status:
```bash
npm run migrate:status
```

#### 2. **Database Connection Error**

```
Error: Connection refused
```

**Solutions**:
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Test connection: `psql $DATABASE_URL`

#### 3. **Migration Syntax Error**

```
Error: syntax error at or near "COLUMN"
```

**Solutions**:
- Check SQL syntax in migration file
- Test SQL in psql first
- Use `IF NOT EXISTS` clauses

#### 4. **Permission Denied**

```
Error: permission denied for table users
```

**Solutions**:
- Check database user permissions
- Ensure user has CREATE/ALTER privileges
- Use superuser for schema changes

### Recovery Steps

#### If Migration Fails Partially

1. **Check what was applied**:
   ```bash
   npm run migrate:status
   psql -d indidate -c "\d users"
   ```

2. **Manual cleanup if needed**:
   ```sql
   -- Remove failed migration record
   DELETE FROM migrations WHERE migration_name = 'failed_migration_name';
   
   -- Undo partial changes manually
   ALTER TABLE users DROP COLUMN IF EXISTS problematic_column;
   ```

3. **Fix migration file and retry**:
   ```bash
   npm run migrate
   ```

#### Database Backup and Restore

```bash
# Create backup
pg_dump indidate > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
dropdb indidate
createdb indidate
psql indidate < backup_20241117_143000.sql
```

## 🚀 Advanced Usage

### Environment-Specific Migrations

```bash
# Development
NODE_ENV=development npm run migrate

# Production
NODE_ENV=production npm run migrate
```

### Custom Migration Runner

```javascript
import MigrationRunner from './server/database/migrate.js';

const runner = new MigrationRunner();
await runner.runPendingMigrations();
```

### Integration with CI/CD

```yaml
# .github/workflows/deploy.yml
- name: Run Database Migrations
  run: |
    npm run migrate
    npm run migrate:status
```

## 📞 Support

For migration issues:

1. **Check Status**: `npm run migrate:status`
2. **Review Logs**: Check console output for errors
3. **Test Locally**: Always test migrations on development first
4. **Backup First**: Create database backup before production migrations

---

**Happy Migrating! 🚀**

*This migration system helps keep your IndiDate database schema organized and deployable across all environments.*
