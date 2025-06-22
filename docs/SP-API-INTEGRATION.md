# SP-API Integration Architecture

## Current Implementation Status

### Completed Services

1. **Orders API v0** ✅
   - Full sandbox support with TEST_CASE_200
   - Order retrieval and details
   - Time-based order queries

2. **Catalog API v2022-04-01** ⚠️
   - Complete implementation
   - Limited to static sandbox data
   - Product search and detail retrieval

3. **Reports API v2021-06-30** ❌
   - Full implementation complete
   - NOT available in sandbox
   - Requires production credentials

4. **Finances API v2024-06-19** ❌
   - Complete implementation
   - Permission issues in sandbox
   - Requires "Finance and Accounting" role

## Critical Architecture Issue

**Current Problem**: Single-tenant SP-API design incompatible with multi-tenant SaaS requirements

**Required Solution**: Multi-tenant OAuth flow implementation
- Per-client credential storage
- Marketplace selection (US, UK, DE, FR, IT, ES, CA, AU, JP)
- Multi-store support per client
- Revocation detection and handling

**Impact**: ~60% of SP-API code needs refactoring (2-3 weeks estimated)

## Multi-Tenant Architecture Requirements

### Credential Management
- Store SP-API credentials per client/marketplace
- Encrypted credential storage
- OAuth token refresh handling
- Credential revocation detection

### Marketplace Support
- US, UK, DE, FR, IT, ES, CA, AU, JP
- Per-marketplace endpoints
- Currency conversion handling
- Timezone considerations

### Data Synchronization
- Per-client sync schedules
- Rate limiting per marketplace
- Error handling and retry logic
- Sync status tracking

## Implementation Roadmap

### Phase 1: Architecture Redesign (1 week)
- [ ] Design multi-tenant OAuth flow
- [ ] Create credential storage schema
- [ ] Plan marketplace selection UI
- [ ] Design revocation handling

### Phase 2: Core Implementation (1-2 weeks)
- [ ] Implement OAuth flow
- [ ] Build credential management
- [ ] Create marketplace selector
- [ ] Add revocation detection

### Phase 3: Migration & Testing (1 week)
- [ ] Migrate existing code
- [ ] Update all SP-API services
- [ ] Comprehensive testing
- [ ] Documentation update