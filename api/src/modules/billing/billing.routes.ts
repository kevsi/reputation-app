import { Router } from 'express';
import { billingController } from './billing.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { subscribeSchema, confirmSubscriptionSchema } from './billing.validation';

const router = Router();

// Routes Billing réelles avec validation
router.get('/plans', billingController.getPlans.bind(billingController));
router.get('/subscription/:organizationId', billingController.getSubscription.bind(billingController));
router.post('/subscribe', validate(subscribeSchema), billingController.subscribe.bind(billingController));
router.post('/confirm', validate(confirmSubscriptionSchema), billingController.confirmSubscription.bind(billingController));
router.get('/invoices/:subscriptionId', billingController.getInvoices.bind(billingController));

export default router;
