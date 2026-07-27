import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'study0644@gmail.com' }
    });
    if (user) {
        console.log('User found:', JSON.stringify(user, null, 2));
    } else {
        console.log('User not found. Account does not exist or was deleted.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
