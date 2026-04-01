import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
      phone: '1234567890',
      password: 'securepassword',
      role: 'donor',
    },
    include: {
      donors: true,
    },
  });
  console.log('Created user:', user);

  const donor = await prisma.donors.create({
    data: {
      bloodType: 'A+',
      lastDonation: new Date('2023-01-01'),
      latitude: 40.7128,
      longitude: -74.006,
      userId: user.id,
    },
  });
  console.log('Created donor:', donor);

  // Fetch all users with their donors
  const allUsers = await prisma.user.findMany({
    include: {
      donors: true,
    },
  });
  console.log('All users:', JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
