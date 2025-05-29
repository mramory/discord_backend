import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const hashedPassword = await bcrypt.hash('Mramor919!', 10);
  await prisma.user.upsert({
    where: { email: 'mramor91932765@gmail.com' },
    update: {},
    create: {
      email: 'mramor91932765@gmail.com',
      password: hashedPassword,
      name: 'mramor',
      viewName: '@mramory',
      birthday: new Date('2004-12-15'),
      role: 'ADMIN',
      createdAt: new Date(),
    },
  });

  const hashedPassword2 = await bcrypt.hash('testPass123!', 10);
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword2,
      name: 'testuser',
      viewName: '@testuser',
      birthday: new Date('1990-01-01'),
      role: 'USER',
      createdAt: new Date(),
    },
  });

  const hashedPassword3 = await bcrypt.hash('testPass321!', 10);
  await prisma.user.upsert({
    where: { email: 'test2@example.com' },
    update: {},
    create: {
      email: 'test2@example.com',
      password: hashedPassword3,
      name: 'testuser2',
      viewName: '@testuser2',
      birthday: new Date('1995-03-02'),
      role: 'USER',
      createdAt: new Date(),
    },
  });

  const hashedPassword4 = await bcrypt.hash('testPass432!', 10);
  await prisma.user.upsert({
    where: { email: 'test3@example.com' },
    update: {},
    create: {
      email: 'test3@example.com',
      password: hashedPassword4,
      name: 'testuser3',
      viewName: '@testuser3',
      birthday: new Date('1998-04-03'),
      role: 'USER',
      createdAt: new Date(),
    },
  });

  const hashedPassword5 = await bcrypt.hash('testPass543!', 10);
  await prisma.user.upsert({
    where: { email: 'test4@example.com' },
    update: {},
    create: {
      email: 'test4@example.com',
      password: hashedPassword5,
      name: 'testuser4',
      viewName: '@testuser4',
      birthday: new Date('2000-05-04'),
      role: 'USER',
      createdAt: new Date(),
    },
  });

  const hashedPassword6 = await bcrypt.hash('testPass654!', 10);
  await prisma.user.upsert({
    where: { email: 'test5@example.com' },
    update: {},
    create: {
      email: 'test5@example.com',
      password: hashedPassword6,
      name: 'testuser5',
      viewName: '@testuser5',
      birthday: new Date('2002-06-05'),
      role: 'USER',
      createdAt: new Date(),
    },
  });

  const hashedPassword7 = await bcrypt.hash('testPass765!', 10);
  await prisma.user.upsert({
    where: { email: 'test6@example.com' },
    update: {},
    create: {
      email: 'test6@example.com',
      password: hashedPassword7,
      name: 'testuser6',
      viewName: '@testuser6',
      birthday: new Date('2004-07-06'),
      role: 'USER',
      createdAt: new Date(),
    },
  });

  const hashedPassword8 = await bcrypt.hash('testPass876!', 10);
  await prisma.user.upsert({
    where: { email: 'test7@example.com' },
    update: {},
    create: {
      email: 'test7@example.com',
      password: hashedPassword8,
      name: 'testuser7',
      viewName: '@testuser7',
      birthday: new Date('2006-08-07'),
      role: 'USER',
      createdAt: new Date(),
    },
  });

  const hashedPassword9 = await bcrypt.hash('testPass987!', 10);
  await prisma.user.upsert({
    where: { email: 'test8@example.com' },
    update: {},
    create: {
      email: 'test8@example.com',
      password: hashedPassword9,
      name: 'testuser8',
      viewName: '@testuser8',
      birthday: new Date('1993-09-08'),
      role: 'USER',
      createdAt: new Date(),
    },
  });

  const hashedPassword10 = await bcrypt.hash('testPass1098!', 10);
  await prisma.user.upsert({
    where: { email: 'test9@example.com' },
    update: {},
    create: {
      email: 'test9@example.com',
      password: hashedPassword10,
      name: 'testuser9',
      viewName: '@testuser9',
      birthday: new Date('1996-10-09'),
      role: 'USER',
      createdAt: new Date(),
    },
  });

  const hashedPassword11 = await bcrypt.hash('testPass1109!', 10);
  await prisma.user.upsert({
    where: { email: 'test10@example.com' },
    update: {},
    create: {
      email: 'test10@example.com',
      password: hashedPassword11,
      name: 'testuser10',
      viewName: '@testuser10',
      birthday: new Date('1999-11-10'),
      role: 'USER',
      createdAt: new Date(),
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
