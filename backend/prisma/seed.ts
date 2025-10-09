import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create two users
  const password = await bcrypt.hash(process.env.USER_PASS!, 10);
  const adminPass = await bcrypt.hash(process.env.ADMIN_PASS!, 10);
  await prisma.user.createMany({
    data: [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: adminPass, // hash in real use
        role: Role.ADMIN,
      },
      {
        username: 'user',
        email: 'user@example.com',
        password: password,
        role: Role.USER,
      },
    ],
  });
}

main()
  .then(async () => {
    console.log('✅ Users created successfully');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
