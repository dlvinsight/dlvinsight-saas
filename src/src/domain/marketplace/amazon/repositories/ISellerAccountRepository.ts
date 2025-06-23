import type { SellerAccount } from '../entities/SellerAccount';
import type { SellerId } from '../value-objects/SellerId';

export type ISellerAccountRepository = {
  findById: (id: string) => Promise<SellerAccount | null>;
  findBySellerId: (sellerId: SellerId) => Promise<SellerAccount | null>;
  findByOrganizationId: (organizationId: string) => Promise<SellerAccount[]>;
  findActiveAccountsNeedingSync: (thresholdHours: number) => Promise<SellerAccount[]>;
  save: (account: SellerAccount) => Promise<void>;
  delete: (id: string) => Promise<void>;
  exists: (sellerId: SellerId, organizationId: string) => Promise<boolean>;
};
