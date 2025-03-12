import prisma from '../DB/db.config.js';

async function main() {
  try {
    // Delete all records from dependent tables first (due to foreign key constraints)
    await prisma.vote.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log('All seed data deleted successfully!');
  } catch (error) {
    console.error('Error deleting seed data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();