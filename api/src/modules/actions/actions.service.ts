import { prisma } from '../../shared/database/prisma.client';
import { ActionStatus } from '@sentinelle/database';

class ActionsService {
    async getAllActions() {
        return await prisma.action.findMany({
            include: { assignedTo: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getActionById(id: string) {
        return await prisma.action.findUnique({
            where: { id },
            include: { assignedTo: { select: { id: true, name: true, email: true } } }
        });
    }

    async createAction(input: any) {
        return await prisma.action.create({
            data: {
                title: input.title || `Action ${input.type || ''}`,
                description: input.description || input.details,
                status: (input.status as ActionStatus) || 'PENDING',
                priority: input.priority || 0,
                assignedToId: input.assignedToId || input.userId,
                dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
                notes: input.notes,
                tags: input.tags || []
            }
        });
    }

    async updateAction(id: string, input: any) {
        const data: any = { ...input };
        if (input.status) data.status = input.status as ActionStatus;
        if (input.dueDate) data.dueDate = new Date(input.dueDate);

        return await prisma.action.update({
            where: { id },
            data
        });
    }

    async deleteAction(id: string): Promise<boolean> {
        await prisma.action.delete({ where: { id } });
        return true;
    }
}

export const actionsService = new ActionsService();
