export interface Action {
    id: string;
    type: 'takedown' | 'contact' | 'ignore' | 'flag' | 'monitor';
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    targetId: string; // ID of the mention or url being acted upon
    performerId: string; // User ID who initiated the action
    details?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ActionsResponse {
    success: boolean;
    data: Action[];
    count: number;
}

export interface ActionResponse {
    success: boolean;
    data: Action;
}

export interface CreateActionInput {
    type: 'takedown' | 'contact' | 'ignore' | 'flag' | 'monitor';
    targetId: string;
    performerId: string;
    details?: string;
}

export interface UpdateActionInput {
    status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    details?: string;
}
