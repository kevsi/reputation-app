export type PlanType = 'starter' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible';

export interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
}

export interface Subscription {
    id: string;
    organizationId: string;
    planId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
}

export interface Invoice {
    id: string;
    organizationId: string;
    amount: number;
    currency: string;
    status: InvoiceStatus;
    date: Date;
    pdfUrl?: string;
}

export interface BillingOverviewResponse {
    success: boolean;
    subscription: Subscription | null;
    invoices: Invoice[];
    plans: Plan[];
}

export interface CreateSubscriptionInput {
    organizationId: string;
    planId: string;
    paymentMethodId: string; // Stripe PaymentMethod ID
}

export interface UpdateSubscriptionInput {
    planId?: string;
    cancelAtPeriodEnd?: boolean;
}
