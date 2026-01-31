#!/usr/bin/env ts-node

import { prisma } from './src/config/database';

async function checkSources() {
  try {
    const sources = await prisma.source.findMany({
      select: { id: true, name: true, type: true, isActive: true }
    });
    console.log('Sources in database:');
    sources.forEach(source => {
      console.log(`- ${source.name} (type: ${source.type}, active: ${source.isActive})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSources();