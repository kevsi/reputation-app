"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAlerts = exports.AlertCheckerService = void 0;
const database_1 = require("../config/database");
class AlertCheckerService {
    async checkAlerts(mentionId, brandId) {
        try {
            // Récupérer les alertes actives de la marque
            const alerts = await database_1.prisma.alert.findMany({
                where: { brandId, isActive: true },
                include: { rules: true }
            });
            for (const alert of alerts) {
                const result = await this.evaluateAlert(alert, mentionId);
                if (result.shouldTrigger) {
                    await this.createAlertTrigger(alert, mentionId, result);
                }
            }
        }
        catch (error) {
            console.error('Error checking alerts:', error);
        }
    }
    async evaluateAlert(alert, mentionId) {
        const mention = await database_1.prisma.mention.findUnique({
            where: { id: mentionId }
        });
        if (!mention)
            return { shouldTrigger: false };
        // Simple evaluation based on alert condition
        switch (alert.condition) {
            case 'NEGATIVE_SENTIMENT_THRESHOLD':
                if (mention.sentiment === 'NEGATIVE' && (mention.sentimentScore || 0) < -0.5) {
                    return {
                        shouldTrigger: true,
                        value: mention.sentimentScore || 0,
                        message: 'Negative sentiment detected'
                    };
                }
                break;
        }
        return { shouldTrigger: false };
    }
    async createAlertTrigger(alert, mentionId, result) {
        await database_1.prisma.alertTrigger.create({
            data: {
                alertId: alert.id,
                mentionId,
                value: result.value || 0,
                message: result.message || 'Alert triggered'
            }
        });
        // Update alert trigger count
        await database_1.prisma.alert.update({
            where: { id: alert.id },
            data: {
                lastTriggeredAt: new Date(),
                triggerCount: { increment: 1 }
            }
        });
    }
}
exports.AlertCheckerService = AlertCheckerService;
const checkAlerts = async (mentionId, brandId) => {
    const service = new AlertCheckerService();
    await service.checkAlerts(mentionId, brandId);
};
exports.checkAlerts = checkAlerts;
