import { DomainEvent } from '../../../shared/events/DomainEvent';

export class AccountConnectedEvent extends DomainEvent {
  constructor(
    public readonly accountId: string,
    public readonly organizationId: string,
    public readonly sellerId: string,
    public readonly marketplaceIds: string[],
    public readonly accountName: string,
  ) {
    super(accountId);
  }

  toPayload(): Record<string, any> {
    return {
      accountId: this.accountId,
      organizationId: this.organizationId,
      sellerId: this.sellerId,
      marketplaceIds: this.marketplaceIds,
      accountName: this.accountName,
      occurredAt: this.occurredAt,
    };
  }
}