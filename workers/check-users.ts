#!/usr/bin/env ts-node

import { prisma } from './src/config/database';

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: true,
        isActive: true,
        role: true
      }
    });

    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- ${user.email} (active: ${user.isActive}, role: ${user.role})`);
      console.log(`  Password hash: ${user.password?.substring(0, 20)}...`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();