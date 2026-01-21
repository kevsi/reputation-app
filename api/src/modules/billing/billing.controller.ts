import { Request, Response, NextFunction } from 'express';
import { billingService } from './billing.service';

class BillingController {
    async getPlans(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const plans = await billingService.getPlans();
            res.status(200).json({ success: true, data: plans });
            return;
        } catch (error) {
            next(error);
            return;
        }
    }

    async getSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { organizationId } = req.params;
            const sub = await billingService.getSubscription(organizationId);
            res.status(200).json({ success: true, data: sub });
            return;
        } catch (error) {
            next(error);
            return;
        }
    }

    /**
     * Initie le paiement
     */
    async subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { organizationId, tier } = req.body;
            const session = await billingService.createCheckoutSession(organizationId, tier);
            res.status(200).json({ success: true, data: session });
            return;
        } catch (error) {
            next(error);
            return;
        }
    }

    /**
     * Webhook simulation pour confirmer l'abonnement
     */
    async confirmSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { organizationId, tier, stripeSubscriptionId } = req.body;
            const updated = await billingService.handleSubscriptionUpdate(organizationId, tier, stripeSubscriptionId);
            res.status(200).json({ success: true, data: updated });
            return;
        } catch (error) {
            next(error);
            return;
        }
    }

    async getInvoices(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { subscriptionId } = req.params;
            const invoices = await billingService.getInvoices(subscriptionId);
            res.status(200).json({ success: true, data: invoices });
            return;
        } catch (error) {
            next(error);
            return;
        }
    }
}

export const billingController = new BillingController();
