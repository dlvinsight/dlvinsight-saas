import { ApiCredentials } from '../value-objects/ApiCredentials';
import { MarketplaceId } from '../value-objects/MarketplaceId';
import { SellerId } from '../value-objects/SellerId';

export interface SellerAccountProps {
  id: string;
  organizationId: string;
  sellerId: SellerId;
  marketplaceIds: MarketplaceId[];
  apiCredentials: ApiCredentials;
  accountName: string;
  isActive: boolean;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class SellerAccount {
  private constructor(private props: SellerAccountProps) {
    this.validate();
  }

  static create(props: SellerAccountProps): SellerAccount {
    return new SellerAccount(props);
  }

  static createNew(params: {
    organizationId: string;
    sellerId: string;
    marketplaceIds: string[];
    apiCredentials: {
      clientId: string;
      clientSecret: string;
      refreshToken: string;
      region: 'NA' | 'EU' | 'FE';
    };
    accountName: string;
  }): SellerAccount {
    const now = new Date();
    return new SellerAccount({
      id: crypto.randomUUID(),
      organizationId: params.organizationId,
      sellerId: SellerId.create(params.sellerId),
      marketplaceIds: params.marketplaceIds.map(id => MarketplaceId.create(id)),
      apiCredentials: ApiCredentials.create(params.apiCredentials),
      accountName: params.accountName,
      isActive: true,
      lastSyncedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validate(): void {
    if (!this.props.id) {
      throw new Error('Seller account ID is required');
    }

    if (!this.props.organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!this.props.accountName || this.props.accountName.trim().length === 0) {
      throw new Error('Account name is required');
    }

    if (this.props.marketplaceIds.length === 0) {
      throw new Error('At least one marketplace must be selected');
    }

    // Ensure all marketplaces belong to the same region as API credentials
    const credentialsRegion = this.props.apiCredentials.getRegion();
    const regionMarketplaces = this.getMarketplacesByRegion(credentialsRegion);
    
    const hasInvalidMarketplace = this.props.marketplaceIds.some(
      marketplace => !regionMarketplaces.includes(marketplace.getValue())
    );

    if (hasInvalidMarketplace) {
      throw new Error('All marketplaces must belong to the same region as API credentials');
    }
  }

  private getMarketplacesByRegion(region: 'NA' | 'EU' | 'FE'): string[] {
    const regionMap = {
      NA: ['ATVPDKIKX0DER', 'A2EUQ1WTGCTBG2', 'A1AM78C64UM0Y8', 'A2Q3Y263D00KWC'],
      EU: ['A1PA6795UKMFR9', 'A13V1IB3VIYZZH', 'A1F83G8C2ARO7P', 'APJ6JRA9NG5V4', 'A1RKKUPIHCS9HS', 'A1805IZSGTT6HS'],
      FE: ['A1VC38T7YXB528', 'A39IBJ37TRP1C6', 'A19VAU5U5O7RUS', 'A21TJRUUN4KGV'],
    };
    return regionMap[region];
  }

  // Getters
  getId(): string {
    return this.props.id;
  }

  getOrganizationId(): string {
    return this.props.organizationId;
  }

  getSellerId(): SellerId {
    return this.props.sellerId;
  }

  getMarketplaceIds(): MarketplaceId[] {
    return [...this.props.marketplaceIds];
  }

  getApiCredentials(): ApiCredentials {
    return this.props.apiCredentials;
  }

  getAccountName(): string {
    return this.props.accountName;
  }

  isActive(): boolean {
    return this.props.isActive;
  }

  getLastSyncedAt(): Date | undefined {
    return this.props.lastSyncedAt;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business methods
  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  updateLastSyncedAt(date: Date): void {
    this.props.lastSyncedAt = date;
    this.props.updatedAt = new Date();
  }

  addMarketplace(marketplaceId: MarketplaceId): void {
    const exists = this.props.marketplaceIds.some(
      m => m.equals(marketplaceId)
    );

    if (exists) {
      throw new Error('Marketplace already added to this account');
    }

    // Validate region
    const credentialsRegion = this.props.apiCredentials.getRegion();
    const regionMarketplaces = this.getMarketplacesByRegion(credentialsRegion);
    
    if (!regionMarketplaces.includes(marketplaceId.getValue())) {
      throw new Error('Marketplace must belong to the same region as API credentials');
    }

    this.props.marketplaceIds.push(marketplaceId);
    this.props.updatedAt = new Date();
  }

  removeMarketplace(marketplaceId: MarketplaceId): void {
    if (this.props.marketplaceIds.length === 1) {
      throw new Error('Cannot remove the last marketplace');
    }

    this.props.marketplaceIds = this.props.marketplaceIds.filter(
      m => !m.equals(marketplaceId)
    );
    this.props.updatedAt = new Date();
  }

  updateAccountName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Account name cannot be empty');
    }
    this.props.accountName = name;
    this.props.updatedAt = new Date();
  }

  // Check if sync is needed (e.g., hasn't synced in last hour)
  needsSync(thresholdHours: number = 1): boolean {
    if (!this.props.isActive) {
      return false;
    }

    if (!this.props.lastSyncedAt) {
      return true;
    }

    const hoursSinceLastSync = 
      (Date.now() - this.props.lastSyncedAt.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceLastSync >= thresholdHours;
  }
}