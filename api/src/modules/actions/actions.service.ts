import { ActionStatus } from '@sentinelle/database';
import { ActionsRepository, actionsRepository } from './actions.repository';
import { PaginationParams, PaginatedResponse } from '@/shared/utils/pagination';

class ActionsService {
    constructor(private repository: ActionsRepository) { }

    /**
     * ✅ Récupérer toutes les actions avec pagination
     */
    async getAllActions(
        organizationId: string, // Currently Action model in schema doesn't have organizationId directly, 
        // but it's assignedTo a User who has organizationId.
        // Looking at schema: model Action { assignedToId String? ... assignedTo User? ... }
        // User has organizationId.
        // So we filter actions assigned to users in the same organization.
        pagination: PaginationParams
    ): Promise<PaginatedResponse<any>> {
        const page = Math.max(1, pagination.page || 1);
        const limit = Math.min(100, Math.max(1, pagination.limit || 20));
        const skip = (page - 1) * limit;

        const where = { assignedTo: { organizationId } };

        const [data, total] = await Promise.all([
            this.repository.findMany(where, skip, limit),
            this.repository.count(where)
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
    }

    async getActionById(id: string) {
        return await this.repository.findById(id);
    }

    async createAction(input: any) {
        return await this.repository.create({
            title: input.title || `Action ${input.type || ''}`,
            description: input.description || input.details,
            status: (input.status as ActionStatus) || 'PENDING',
            priority: input.priority || 2,
            assignedToId: input.assignedToId || input.userId,
            dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
            notes: input.notes,
            tags: input.tags || []
        });
    }

    async updateAction(id: string, input: any) {
        const data: any = { ...input };
        if (input.status) data.status = input.status as ActionStatus;
        if (input.dueDate) data.dueDate = new Date(input.dueDate);

        return await this.repository.update(id, data);
    }

    async deleteAction(id: string): Promise<boolean> {
        await this.repository.delete(id);
        return true;
    }
}

export const actionsService = new ActionsService(actionsRepository);
