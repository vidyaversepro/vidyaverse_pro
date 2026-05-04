import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
    const t = await p.template.findUnique({
        where: { id: '7cfc3f9a-bdff-4137-9492-a51ee7ae36b4' },
        select: { id: true, name: true, widthMm: true, heightMm: true, content: true, serviceType: true }
    });
    console.log('name:', t?.name);
    console.log('serviceType:', t?.serviceType);
    console.log('widthMm:', t?.widthMm);
    console.log('heightMm:', t?.heightMm);
    console.log('content (first 400):', String(t?.content).substring(0, 400));
    await p.$disconnect();
}

main();
