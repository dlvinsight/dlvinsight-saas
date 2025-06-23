export abstract class DomainEvent {
  public readonly occurredAt: Date;
  public readonly aggregateId: string;
  public readonly eventType: string;
  public readonly eventVersion: number;

  constructor(aggregateId: string) {
    this.occurredAt = new Date();
    this.aggregateId = aggregateId;
    this.eventType = this.constructor.name;
    this.eventVersion = 1;
  }

  abstract toPayload(): Record<string, any>;
}
