export class MarketplaceId {
  private static readonly VALID_MARKETPLACES = {
    US: 'ATVPDKIKX0DER',
    CA: 'A2EUQ1WTGCTBG2',
    MX: 'A1AM78C64UM0Y8',
    BR: 'A2Q3Y263D00KWC',
    DE: 'A1PA6795UKMFR9',
    FR: 'A13V1IB3VIYZZH',
    GB: 'A1F83G8C2ARO7P',
    IT: 'APJ6JRA9NG5V4',
    ES: 'A1RKKUPIHCS9HS',
    NL: 'A1805IZSGTT6HS',
    JP: 'A1VC38T7YXB528',
    AU: 'A39IBJ37TRP1C6',
    SG: 'A19VAU5U5O7RUS',
    IN: 'A21TJRUUN4KGV',
  } as const;

  private constructor(private readonly value: string) {
    this.validate(value);
  }

  static create(value: string): MarketplaceId {
    return new MarketplaceId(value);
  }

  static fromCountryCode(countryCode: keyof typeof MarketplaceId.VALID_MARKETPLACES): MarketplaceId {
    return new MarketplaceId(MarketplaceId.VALID_MARKETPLACES[countryCode]);
  }

  private validate(value: string): void {
    const validIds = Object.values(MarketplaceId.VALID_MARKETPLACES);
    if (!validIds.includes(value as any)) {
      throw new Error(`Invalid marketplace ID: ${value}`);
    }
  }

  getValue(): string {
    return this.value;
  }

  getCountryCode(): string {
    const entry = Object.entries(MarketplaceId.VALID_MARKETPLACES)
      .find(([_, id]) => id === this.value);
    return entry ? entry[0] : 'UNKNOWN';
  }

  equals(other: MarketplaceId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
