import { writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

class MigrationGenerator {
  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.migrationsDir = join(__dirname, 'migrations');
  }

  getNextMigrationNumber() {
    try {
      const files = readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .map(file => {
          const match = file.match(/^(\d+)_/);
          return match ? parseInt(match[1]) : 0;
        })
        .sort((a, b) => b - a);
      
      return files.length > 0 ? files[0] + 1 : 1;
    } catch (error) {
      return 1;
    }
  }

  formatMigrationNumber(num) {
    return num.toString().padStart(3, '0');
  }

  generateMigrationTemplate(name, description = '') {
    const timestamp = new Date().toISOString().split('T')[0];
    
    return `-- Migration: ${name}
-- Description: ${description || 'Add description here'}
-- Created: ${timestamp}
-- Author: IndiDate Team

-- Add your SQL statements here
-- Example:
-- ALTER TABLE users ADD COLUMN new_column VARCHAR(255);

-- Create indexes if needed
-- CREATE INDEX IF NOT EXISTS idx_table_column ON table_name(column_name);

-- Record this migration as applied
INSERT INTO migrations (migration_name) VALUES ('${name}') ON CONFLICT (migration_name) DO NOTHING;`;
  }

  createMigration(migrationName, description = '') {
    if (!migrationName) {
      console.error('❌ Migration name is required!');
      console.log('Usage: node create-migration.js <migration_name> [description]');
      console.log('Example: node create-migration.js add_user_preferences "Add user preference settings"');
      return;
    }

    // Clean migration name
    const cleanName = migrationName
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const migrationNumber = this.getNextMigrationNumber();
    const formattedNumber = this.formatMigrationNumber(migrationNumber);
    const fullMigrationName = `${formattedNumber}_${cleanName}`;
    const fileName = `${fullMigrationName}.sql`;
    const filePath = join(this.migrationsDir, fileName);

    try {
      const template = this.generateMigrationTemplate(fullMigrationName, description);
      writeFileSync(filePath, template);
      
      console.log('✅ Migration created successfully!');
      console.log(`📁 File: ${fileName}`);
      console.log(`📍 Path: ${filePath}`);
      console.log('');
      console.log('Next steps:');
      console.log('1. Edit the migration file to add your SQL statements');
      console.log('2. Run: npm run migrate');
      console.log('');
      
    } catch (error) {
      console.error('❌ Failed to create migration:', error.message);
    }
  }
}

// CLI Interface
function main() {
  const migrationName = process.argv[2];
  const description = process.argv[3];
  
  if (!migrationName) {
    console.log('🔧 IndiDate Migration Generator\n');
    console.log('Usage:');
    console.log('  node create-migration.js <migration_name> [description]');
    console.log('');
    console.log('Examples:');
    console.log('  node create-migration.js add_user_preferences');
    console.log('  node create-migration.js add_notifications "Add notification system"');
    console.log('  node create-migration.js update_user_schema "Update user table structure"');
    console.log('');
    return;
  }
  
  const generator = new MigrationGenerator();
  generator.createMigration(migrationName, description);
}

main();
