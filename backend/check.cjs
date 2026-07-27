const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Generate Prisma Client explicitly
console.log('--- Generating Prisma Client ---');
execSync('npx prisma generate', { stdio: 'inherit' });

// 2. Query existing rows by category
console.log('\n--- Checking existing rows ---');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groups = await prisma.visionariumArticle.groupBy({
    by: ['category'],
    _count: true,
  });
  console.log('Article Counts by Category:', groups);
  
  // 3. Fix migration file
  console.log('\n--- Fixing Migration File ---');
  const migDir = path.join(__dirname, 'prisma', 'migrations', '20260620000000_add_visionarium_magazine');
  if (!fs.existsSync(migDir)) fs.mkdirSync(migDir, { recursive: true });
  
  // Generate SQL diff from existing migrations to current schema
  const sql = execSync('npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script').toString();
  
  if (sql.trim() === '-- This is an empty migration.') {
     console.log('Diff is empty, meaning the migration folder is already in sync.');
  } else {
     fs.writeFileSync(path.join(migDir, 'migration.sql'), sql, 'utf8');
     console.log('Migration SQL generated successfully without BOM.');
  }

  // Also apply to _prisma_migrations so it is known as resolved
  try {
     execSync('npx prisma migrate resolve --applied 20260620000000_add_visionarium_magazine', { stdio: 'pipe' });
     console.log('Migration marked as applied.');
  } catch(e) {
     console.log('Migration might already be applied: ' + e.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
