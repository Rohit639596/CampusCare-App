import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@12345', 12);
  await prisma.user.upsert({
    where: { email: 'admin@campuscare.local' },
    update: { passwordHash, role: 'ADMIN', name: 'CampusCare Admin' },
    create: { email: 'admin@campuscare.local', passwordHash, role: 'ADMIN', name: 'CampusCare Admin' }
  });
  console.log('Admin seeded: admin@campuscare.local / Admin@12345');
}

main().finally(() => prisma.$disconnect());
