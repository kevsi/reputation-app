#!/usr/bin/env ts-node

import { prisma } from './src/config/database';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    const email = 'test@example.com';
    const password = 'Test123456!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`User ${email} already exists. Updating password...`);
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
    } else {
      // Créer l'utilisateur et l'organisation en même temps
      const userData = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Test User',
          role: 'OWNER',
          isActive: true,
          emailVerified: true,
          organization: {
            create: {
              name: 'Test Organization',
              slug: 'test-org'
            }
          }
        },
        include: {
          organization: true
        }
      });
      console.log(`Created user ${email} with password: ${password}`);
    }

    console.log(`Test user credentials:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();