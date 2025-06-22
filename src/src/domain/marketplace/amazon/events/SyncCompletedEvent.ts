import { DomainEvent } from '../../../shared/events/DomainEvent';

export interface SyncStatistics {
  ordersImported: number;
  productsUpdated: number;
  inventoryUpdated: number;
  financialEventsImported: number;
  duration: number; // in milliseconds
  errors: number;
}

export class SyncCompletedEvent extends DomainEvent {
  constructor(
    public readonly accountId: string,
    public readonly organizationId: string,
    public readonly syncId: string,
    public readonly statistics: SyncStatistics,
    public readonly success: boolean,
    public readonly errorMessage?: string,
  ) {
    super(accountId);
  }

  toPayload(): Record<string, any> {
    return {
      accountId: this.accountId,
      organizationId: this.organizationId,
      syncId: this.syncId,
      statistics: this.statistics,
      success: this.success,
      errorMessage: this.errorMessage,
      occurredAt: this.occurredAt,
    };
  }
}