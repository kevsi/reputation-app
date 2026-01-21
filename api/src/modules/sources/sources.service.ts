import { prisma } from '../../shared/database/prisma.client';
import { SourceType } from '@sentinelle/database';

class SourcesService {
  async getAllSources() {
    return await prisma.source.findMany({
      include: { brand: true }
    });
  }

  async getActiveSources() {
    return await prisma.source.findMany({
      where: { isActive: true },
      include: { brand: true }
    });
  }

  async getSourceById(id: string) {
    return await prisma.source.findUnique({
      where: { id },
      include: { brand: true }
    });
  }

  async createSource(input: any) {
    return await prisma.source.create({
      data: {
        name: input.name,
        url: input.url,
        type: input.type as SourceType,
        isActive: input.isActive ?? true,
        brandId: input.brandId // Requis
      }
    });
  }

  async updateSource(id: string, input: any) {
    return await prisma.source.update({
      where: { id },
      data: input
    });
  }

  async deleteSource(id: string): Promise<boolean> {
    await prisma.source.delete({ where: { id } });
    return true;
  }
}

export const sourcesService = new SourcesService();