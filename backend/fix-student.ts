import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing study0644@gmail.com...');
    const result = await prisma.$executeRawUnsafe(`
        UPDATE students s
        JOIN users u ON u.email = s.parent_email
        SET s.user_id = u.id
        WHERE s.user_id IS NULL
          AND s.parent_email = 'study0644@gmail.com';
    `);
    console.log(`Updated ${result} rows`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
