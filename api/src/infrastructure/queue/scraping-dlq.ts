/**
 * Dead Letter Queue (DLQ) for Scraping Jobs
 * 
 * Provides persistent storage for failed scraping jobs after max retries.
 * Allows manual review and replay of failed jobs.
 * 
 * NOTE: This is a simplified implementation. The ScrapingDeadLetter model
 * needs to be added to schema.prisma for full functionality.
 */

import { logger } from '@/infrastructure/logger';

export interface DeadLetterJob {
  id: string;
  jobId: string;
  sourceId: string;
  brandId: string;
  failureReason: string;
  failureCount: number;
  lastAttempt: Date;
  payload: Record<string, any>;
  createdAt: Date;
  reviewed: boolean;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface CreateDlqEntryParams {
  jobId: string;
  sourceId: string;
  brandId: string;
  failureReason: string;
  failureCount: number;
  lastAttempt: Date;
  payload: Record<string, any>;
}

// In-memory storage for DLQ (for now)
// TODO: Replace with database storage when ScrapingDeadLetter model is added
const dlqStorage: Map<string, DeadLetterJob> = new Map();

export class ScrapingDeadLetterQueue {
  /**
   * Add a failed job to the DLQ
   */
  static async addEntry(params: CreateDlqEntryParams): Promise<DeadLetterJob> {
    const entry: DeadLetterJob = {
      id: `dlq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      jobId: params.jobId,
      sourceId: params.sourceId,
      brandId: params.brandId,
      failureReason: params.failureReason,
      failureCount: params.failureCount,
      lastAttempt: params.lastAttempt,
      payload: params.payload,
      createdAt: new Date(),
      reviewed: false
    };

    dlqStorage.set(entry.id, entry);

    logger.info(`📥 Job ${params.jobId} added to DLQ after ${params.failureCount} failures`);
    
    return entry;
  }

  /**
   * Get all DLQ entries for a brand
   */
  static async getEntries(brandId: string, options?: {
    reviewed?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<DeadLetterJob[]> {
    let entries = Array.from(dlqStorage.values())
      .filter(e => e.brandId === brandId);

    if (options?.reviewed !== undefined) {
      entries = entries.filter(e => e.reviewed === options.reviewed);
    }

    entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const offset = options?.offset || 0;
    const limit = options?.limit || 50;

    return entries.slice(offset, offset + limit);
  }

  /**
   * Get DLQ entry by ID
   */
  static async getEntry(id: string): Promise<DeadLetterJob | null> {
    return dlqStorage.get(id) || null;
  }

  /**
   * Mark entry as reviewed
   */
  static async markAsReviewed(
    id: string, 
    reviewedBy: string, 
    note?: string
  ): Promise<DeadLetterJob> {
    const entry = dlqStorage.get(id);
    
    if (!entry) {
      throw new Error(`DLQ entry ${id} not found`);
    }

    entry.reviewed = true;
    entry.reviewedBy = reviewedBy;
    entry.reviewNote = note;

    return entry;
  }

  /**
   * Delete old entries (cleanup)
   */
  static async cleanup(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let count = 0;
    for (const [id, entry] of dlqStorage.entries()) {
      if (entry.createdAt < cutoffDate && entry.reviewed) {
        dlqStorage.delete(id);
        count++;
      }
    }

    logger.info(`🧹 Cleaned up ${count} old DLQ entries`);
    return count;
  }

  /**
   * Get DLQ statistics
   */
  static async getStats(brandId?: string): Promise<{
    total: number;
    pending: number;
    reviewed: number;
    bySource: Record<string, number>;
  }> {
    const entries = brandId 
      ? Array.from(dlqStorage.values()).filter(e => e.brandId === brandId)
      : Array.from(dlqStorage.values());

    const total = entries.length;
    const pending = entries.filter(e => !e.reviewed).length;
    const reviewed = entries.filter(e => e.reviewed).length;

    const bySource: Record<string, number> = {};
    for (const entry of entries) {
      bySource[entry.sourceId] = (bySource[entry.sourceId] || 0) + 1;
    }

    return { total, pending, reviewed, bySource };
  }

  /**
   * Retry a failed job from DLQ
   * Returns the new job ID if successful
   */
  static async retryJob(
    dlqEntryId: string, 
    retryingUserId: string
  ): Promise<string | null> {
    const entry = dlqStorage.get(dlqEntryId);
    
    if (!entry) {
      throw new Error(`DLQ entry ${dlqEntryId} not found`);
    }

    if (!entry.reviewed) {
      throw new Error('Cannot retry unreviewed DLQ entry');
    }

    // TODO: Trigger a new scraping job
    logger.info(`🔄 Retrying DLQ entry ${dlqEntryId} for source ${entry.sourceId}`);

    // Mark as retried
    await this.markAsReviewed(dlqEntryId, retryingUserId, 'Retried');

    return null; // Return new job ID when implemented
  }
}

/**
 * Helper function to integrate with BullMQ
 */
export async function handleJobFailure(
  jobId: string,
  sourceId: string,
  brandId: string,
  error: Error,
  attemptsMade: number,
  payload: Record<string, any>
): Promise<void> {
  await ScrapingDeadLetterQueue.addEntry({
    jobId,
    sourceId,
    brandId,
    failureReason: error.message || 'Unknown error',
    failureCount: attemptsMade,
    lastAttempt: new Date(),
    payload
  });
}
