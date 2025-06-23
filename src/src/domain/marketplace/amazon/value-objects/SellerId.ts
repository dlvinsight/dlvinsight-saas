export class SellerId {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  static create(value: string): SellerId {
    return new SellerId(value);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('Seller ID cannot be empty');
    }

    // Amazon Seller IDs typically follow pattern like "A1XXXXXXXXXXXXX"
    const amazonSellerIdPattern = /^[A-Z0-9]{13,14}$/;
    if (!amazonSellerIdPattern.test(value)) {
      throw new Error('Invalid Amazon Seller ID format');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: SellerId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
