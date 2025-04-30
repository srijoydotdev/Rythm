require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDb() {
  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful:', result);
  } catch (error) {
    console.error('Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDb();