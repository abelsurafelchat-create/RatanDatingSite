import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, readdirSync } from 'fs';

dotenv.config();

const { Pool } = pg;

class MigrationRunner {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async ensureMigrationsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await this.pool.query(query);
  }

  async getAppliedMigrations() {
    try {
      const result = await this.pool.query('SELECT migration_name FROM migrations ORDER BY migration_name');
      return result.rows.map(row => row.migration_name);
    } catch (error) {
      // If migrations table doesn't exist, return empty array
      return [];
    }
  }

  async getMigrationFiles() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const migrationsDir = join(__dirname, 'migrations');
    
    try {
      const files = readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      return files;
    } catch (error) {
      console.log('📁 No migrations directory found. Creating it...');
      return [];
    }
  }

  async runMigration(migrationFile) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const migrationPath = join(__dirname, 'migrations', migrationFile);
    
    try {
      const migrationSQL = readFileSync(migrationPath, 'utf8');
      
      console.log(`🔄 Running migration: ${migrationFile}`);
      
      // Execute the migration in a transaction
      await this.pool.query('BEGIN');
      
      try {
        await this.pool.query(migrationSQL);
        await this.pool.query('COMMIT');
        console.log(`✅ Migration completed: ${migrationFile}`);
        return true;
      } catch (error) {
        await this.pool.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error(`❌ Migration failed: ${migrationFile}`);
      console.error('Error:', error.message);
      return false;
    }
  }

  async runPendingMigrations() {
    try {
      console.log('🚀 Starting database migrations...\n');
      
      // Ensure migrations table exists
      await this.ensureMigrationsTable();
      
      // Get applied migrations and available migration files
      const appliedMigrations = await this.getAppliedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      
      if (migrationFiles.length === 0) {
        console.log('📝 No migration files found.');
        return;
      }
      
      // Find pending migrations
      const pendingMigrations = migrationFiles.filter(file => {
        const migrationName = file.replace('.sql', '');
        return !appliedMigrations.includes(migrationName);
      });
      
      if (pendingMigrations.length === 0) {
        console.log('✨ All migrations are up to date!');
        return;
      }
      
      console.log(`📋 Found ${pendingMigrations.length} pending migration(s):`);
      pendingMigrations.forEach(migration => {
        console.log(`   - ${migration}`);
      });
      console.log('');
      
      // Run pending migrations
      let successCount = 0;
      for (const migrationFile of pendingMigrations) {
        const success = await this.runMigration(migrationFile);
        if (success) {
          successCount++;
        } else {
          break; // Stop on first failure
        }
      }
      
      console.log(`\n🎉 Successfully applied ${successCount}/${pendingMigrations.length} migrations!`);
      
    } catch (error) {
      console.error('💥 Migration runner failed:', error.message);
      process.exit(1);
    } finally {
      await this.pool.end();
    }
  }

  async rollbackLastMigration() {
    try {
      console.log('🔄 Rolling back last migration...\n');
      
      const appliedMigrations = await this.getAppliedMigrations();
      
      if (appliedMigrations.length === 0) {
        console.log('📝 No migrations to rollback.');
        return;
      }
      
      const lastMigration = appliedMigrations[appliedMigrations.length - 1];
      console.log(`⚠️  Rolling back migration: ${lastMigration}`);
      
      // Remove from migrations table
      await this.pool.query('DELETE FROM migrations WHERE migration_name = $1', [lastMigration]);
      
      console.log('✅ Migration rollback completed!');
      console.log('⚠️  Note: You may need to manually undo schema changes.');
      
    } catch (error) {
      console.error('💥 Rollback failed:', error.message);
      process.exit(1);
    } finally {
      await this.pool.end();
    }
  }

  async showMigrationStatus() {
    try {
      console.log('📊 Migration Status\n');
      
      await this.ensureMigrationsTable();
      
      const appliedMigrations = await this.getAppliedMigrations();
      const migrationFiles = await this.getMigrationFiles();
      
      if (migrationFiles.length === 0) {
        console.log('📝 No migration files found.');
        return;
      }
      
      console.log('Migration Files:');
      migrationFiles.forEach(file => {
        const migrationName = file.replace('.sql', '');
        const isApplied = appliedMigrations.includes(migrationName);
        const status = isApplied ? '✅ Applied' : '⏳ Pending';
        console.log(`   ${status} - ${file}`);
      });
      
      const pendingCount = migrationFiles.length - appliedMigrations.length;
      console.log(`\n📈 Summary: ${appliedMigrations.length} applied, ${pendingCount} pending`);
      
    } catch (error) {
      console.error('💥 Status check failed:', error.message);
      process.exit(1);
    } finally {
      await this.pool.end();
    }
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const migrationRunner = new MigrationRunner();
  
  switch (command) {
    case 'up':
    case 'migrate':
      await migrationRunner.runPendingMigrations();
      break;
      
    case 'rollback':
      await migrationRunner.rollbackLastMigration();
      break;
      
    case 'status':
      await migrationRunner.showMigrationStatus();
      break;
      
    default:
      console.log('🔧 IndiDate Migration Runner\n');
      console.log('Usage:');
      console.log('  node migrate.js up       - Run pending migrations');
      console.log('  node migrate.js migrate  - Run pending migrations');
      console.log('  node migrate.js rollback - Rollback last migration');
      console.log('  node migrate.js status   - Show migration status');
      console.log('');
      console.log('Examples:');
      console.log('  npm run migrate');
      console.log('  npm run migrate:rollback');
      console.log('  npm run migrate:status');
      break;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default MigrationRunner;
