import { prisma } from '../config/database'
import { SentimentType, AlertLevel, AlertCondition } from '@sentinelle/database'

export interface AlertCheckResult {
  shouldAlert: boolean
  alertLevel?: AlertLevel
  reason?: string
}

export class AlertCheckerService {
  async checkAlerts(mentionId: string, brandId: string): Promise<void> {
    try {
      // Récupérer les alertes actives de la marque
      const alerts = await prisma.alert.findMany({
        where: { brandId, isActive: true },
        include: { rules: true }
      })

      for (const alert of alerts) {
        const result = await this.evaluateAlert(alert, mentionId)
        if (result.shouldTrigger) {
          await this.createAlertTrigger(alert, mentionId, result)
        }
      }
    } catch (error) {
      console.error('Error checking alerts:', error)
    }
  }

  private async evaluateAlert(alert: any, mentionId: string): Promise<{ shouldTrigger: boolean; value?: number; message?: string }> {
    const mention = await prisma.mention.findUnique({
      where: { id: mentionId }
    })

    if (!mention) return { shouldTrigger: false }

    // Simple evaluation based on alert condition
    switch (alert.condition) {
      case 'NEGATIVE_SENTIMENT_THRESHOLD':
        if (mention.sentiment === 'NEGATIVE' && (mention.sentimentScore || 0) < -0.5) {
          return {
            shouldTrigger: true,
            value: mention.sentimentScore || 0,
            message: 'Negative sentiment detected'
          }
        }
        break
    }

    return { shouldTrigger: false }
  }

  private async createAlertTrigger(alert: any, mentionId: string, result: { value?: number; message?: string }): Promise<void> {
    await prisma.alertTrigger.create({
      data: {
        alertId: alert.id,
        mentionId,
        value: result.value || 0,
        message: result.message || 'Alert triggered'
      }
    })

    // Update alert trigger count
    await prisma.alert.update({
      where: { id: alert.id },
      data: {
        lastTriggeredAt: new Date(),
        triggerCount: { increment: 1 }
      }
    })
  }
}

export const checkAlerts = async (mentionId: string, brandId: string): Promise<void> => {
  const service = new AlertCheckerService()
  await service.checkAlerts(mentionId, brandId)
}