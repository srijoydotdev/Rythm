// prisma/clear-songs.js
import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  await prisma.song.deleteMany();
  console.log('Cleared Song table');
}

main()
  .catch(e => {
    console.error('Error clearing songs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });