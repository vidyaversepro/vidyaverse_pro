import { prisma } from './src/config/database.js';

async function main() {
  const counts = await prisma.visionariumArticle.groupBy({
    by: ['category'],
    _count: {
      category: true,
    },
  });
  console.log('Category Counts:', counts);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
