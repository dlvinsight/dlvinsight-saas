import { SellerAccount } from '@/domain/marketplace/amazon/entities/SellerAccount';
import { AccountConnectedEvent } from '@/domain/marketplace/amazon/events/AccountConnectedEvent';
import type { ISellerAccountRepository } from '@/domain/marketplace/amazon/repositories/ISellerAccountRepository';
import { SellerId } from '@/domain/marketplace/amazon/value-objects/SellerId';

export type ConnectAmazonAccountCommand = {
  organizationId: string;
  userId: string;
  sellerId: string;
  marketplaceIds: string[];
  apiCredentials: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    region: 'NA' | 'EU' | 'FE';
  };
  accountName: string;
};

export type ConnectAmazonAccountResult = {
  success: boolean;
  accountId?: string;
  error?: string;
};

export class ConnectAmazonAccountUseCase {
  constructor(
    private readonly sellerAccountRepository: ISellerAccountRepository,
    private readonly eventPublisher?: (event: AccountConnectedEvent) => void,
  ) {}

  async execute(command: ConnectAmazonAccountCommand): Promise<ConnectAmazonAccountResult> {
    try {
      // Validate command
      this.validateCommand(command);

      // Check if seller account already exists
      const sellerId = SellerId.create(command.sellerId);
      const existingAccount = await this.sellerAccountRepository.exists(
        sellerId,
        command.organizationId,
      );

      if (existingAccount) {
        return {
          success: false,
          error: 'This seller account is already connected to your organization',
        };
      }

      // Create new seller account
      const sellerAccount = SellerAccount.createNew({
        organizationId: command.organizationId,
        sellerId: command.sellerId,
        marketplaceIds: command.marketplaceIds,
        apiCredentials: command.apiCredentials,
        accountName: command.accountName,
      });

      // Validate API credentials (in real implementation, would test connection)
      const isValid = await this.validateApiCredentials(sellerAccount);
      if (!isValid) {
        return {
          success: false,
          error: 'Invalid API credentials. Please check your Amazon SP-API settings.',
        };
      }

      // Save to repository
      await this.sellerAccountRepository.save(sellerAccount);

      // Publish domain event
      if (this.eventPublisher) {
        const event = new AccountConnectedEvent(
          sellerAccount.getId(),
          sellerAccount.getOrganizationId(),
          sellerAccount.getSellerId().getValue(),
          sellerAccount.getMarketplaceIds().map(m => m.getValue()),
          sellerAccount.getAccountName(),
        );
        this.eventPublisher(event);
      }

      return {
        success: true,
        accountId: sellerAccount.getId(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect Amazon account',
      };
    }
  }

  private validateCommand(command: ConnectAmazonAccountCommand): void {
    if (!command.organizationId) {
      throw new Error('Organization ID is required');
    }

    if (!command.userId) {
      throw new Error('User ID is required');
    }

    if (!command.sellerId) {
      throw new Error('Seller ID is required');
    }

    if (!command.marketplaceIds || command.marketplaceIds.length === 0) {
      throw new Error('At least one marketplace must be selected');
    }

    if (!command.accountName || command.accountName.trim().length === 0) {
      throw new Error('Account name is required');
    }

    if (!command.apiCredentials) {
      throw new Error('API credentials are required');
    }

    if (!command.apiCredentials.clientId
      || !command.apiCredentials.clientSecret
      || !command.apiCredentials.refreshToken) {
      throw new Error('All API credential fields are required');
    }
  }

  private async validateApiCredentials(account: SellerAccount): Promise<boolean> {
    // In a real implementation, this would:
    // 1. Use the credentials to get an access token from Amazon
    // 2. Make a test API call to verify the credentials work
    // 3. Check that the seller ID matches the authenticated account
    // 4. Verify marketplace access

    // For now, we'll do basic validation
    const credentials = account.getApiCredentials().getFullCredentials();

    // Check if credentials look valid
    if (!credentials.clientId.startsWith('amzn1.application-oa2-client.')) {
      return false;
    }

    // In production, make actual API call here
    // const spApiClient = new SpApiClient(credentials);
    // return await spApiClient.testConnection();

    return true;
  }
}
