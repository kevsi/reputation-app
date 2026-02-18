export interface Report {
    id: string;
    title: string;
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    format: 'pdf' | 'csv' | 'excel';
    url?: string;
    generatedAt?: Date;
    createdAt: Date;
    organizationId: string;
}

export interface ReportsResponse {
    success: boolean;
    data: Report[];
    count: number;
}

export interface ReportResponse {
    success: boolean;
    data: Report;
}

export interface CreateReportInput {
    title: string;
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    format: 'pdf' | 'csv' | 'excel';
    organizationId: string;
}

export interface UpdateReportInput {
    title?: string;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    url?: string;
}
