import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create two users
  const password = await bcrypt.hash('1', 10);
  const adminPass = await bcrypt.hash('koteesa123!', 10);
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
  const products = Array.from({ length: 10 }).map((_, i) => ({
    name: `Product ${i + 1}`,
    code: `P${1000 + i}`,
    weight_gold: 10 + i, // example weights
    weight_silver: 5 + i,
    weight_copper: 2 + i,
    price_gold: 1000 + i * 50,
    price_silver: 500 + i * 25,
    price_copper: 200 + i * 10,
  }));

  await prisma.product.createMany({ data: products });

  console.log(`✅ Seeded ${products.length} products`);
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
