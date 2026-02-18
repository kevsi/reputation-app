import { prisma } from '../../shared/database/prisma.client';
import { SubscriptionTier } from '@sentinelle/database';

class OrganizationService {
  /**
   * Récupère toutes les organizations
   */
  async getAllOrganizations() {
    return await prisma.organization.findMany({
      include: {
        subscription: true,
        _count: {
          select: { brands: true, members: true }
        }
      }
    });
  }

  /**
   * Récupère une organization par ID
   */
  async getOrganizationById(id: string) {
    return await prisma.organization.findUnique({
      where: { id },
      include: {
        subscription: true,
        brands: true,
        members: {
          select: { id: true, email: true, name: true, role: true }
        }
      }
    });
  }

  /**
   * Crée une nouvelle organization
   */
  async createOrganization(input: any) {
    return await prisma.organization.create({
      data: {
        name: input.name,
        industry: input.industry,
        numberTeam: input.numberTeam,
        slug: input.slug || input.name.toLowerCase().replace(/ /g, '-'),
        owner: { connect: { id: input.ownerId } },
        subscription: {
          create: {
            plan: (input.subscriptionTier?.toUpperCase() as SubscriptionTier) || 'FREE',
            status: 'ACTIVE'
          }
        }
      }
    });
  }

  /**
   * Met à jour une organization
   */
  async updateOrganization(id: string, input: any) {
    return await prisma.organization.update({
      where: { id },
      data: input
    });
  }

  /**
   * Supprime une organization
   */
  async deleteOrganization(id: string): Promise<boolean> {
    await prisma.organization.delete({ where: { id } });
    return true;
  }
}

export const organizationService = new OrganizationService();